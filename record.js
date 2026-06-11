const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn } = require("child_process");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");

const WIDTH = Number(process.env.RECORD_WIDTH || 2560);
const HEIGHT = Number(process.env.RECORD_HEIGHT || 1300);
const FPS = Number(process.env.RECORD_FPS || 30);
const BITRATE = Number(process.env.RECORD_BITRATE || 12_000_000);

// serve.js 相关配置
const SERVE_HOST = process.env.SERVE_HOST || "127.0.0.1";
const SERVE_PORT = Number(process.env.SERVE_PORT || 8088);
const SERVE_SCRIPT = path.resolve(
  process.env.SERVE_SCRIPT || path.join(__dirname, "serve.js")
);
const SERVE_URL = `http://${SERVE_HOST}:${SERVE_PORT}`;
const PAGES_JSON_PATH = path.join(__dirname, "pages.json");

function pad(n) {
  return String(n).padStart(2, "0");
}

function buildOutputPath() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return path.join(__dirname, "out", `record_${WIDTH}x${HEIGHT}_${FPS}fps_${stamp}.mp4`);
}

// 用 HTTP HEAD/GET 探测本地静态服务器是否就绪
function probeServe(timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const attempt = () => {
      const req = http.get(
        { host: SERVE_HOST, port: SERVE_PORT, path: "/index.html", timeout: 800 },
        (res) => {
          // 任何 HTTP 响应都说明 server 在监听
          res.resume();
          resolve(true);
        }
      );
      req.on("error", () => {
        if (Date.now() >= deadline) {
          resolve(false);
          return;
        }
        setTimeout(attempt, 200);
      });
      req.on("timeout", () => {
        req.destroy();
        if (Date.now() >= deadline) {
          resolve(false);
          return;
        }
        setTimeout(attempt, 200);
      });
    };
    attempt();
  });
}

// 复用或启动 serve.js，返回 { owned: boolean, child?: ChildProcess }
async function ensureServe() {
  const alive = await probeServe(800);
  if (alive) {
    console.log(`[serve] 复用已运行的 ${SERVE_URL}`);
    return { owned: false };
  }

  console.log(`[serve] 启动 ${SERVE_SCRIPT} -> ${SERVE_URL}`);
  const child = spawn(process.execPath, [SERVE_SCRIPT], {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  child.stdout.on("data", (d) => process.stdout.write(`[serve] ${d}`));
  child.stderr.on("data", (d) => process.stderr.write(`[serve] ${d}`));
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.warn(`[serve] 进程退出，code=${code}`);
    }
  });

  const ready = await probeServe(5000);
  if (!ready) {
    try { child.kill(); } catch (_) {}
    throw new Error(`[serve] 在 5 秒内未就绪：${SERVE_URL}`);
  }
  return { owned: true, child };
}

function shutdownServe(serve) {
  if (!serve || !serve.owned || !serve.child) return;
  try {
    serve.child.kill();
  } catch (err) {
    console.warn(`[serve] 关闭失败：${err.message}`);
  }
}

// 同步读 pages.json，累加 pages[i].duration 得总时长
function readTotalDurationMs() {
  try {
    const raw = fs.readFileSync(PAGES_JSON_PATH, "utf8");
    const data = JSON.parse(raw);
    const pages = Array.isArray(data) ? data : (Array.isArray(data.pages) ? data.pages : []);
    const total = pages.reduce((sum, p) => sum + Number(p.duration || 0), 0);
    if (total > 0) return total;
  } catch (err) {
    console.warn(`[duration] 解析 pages.json 失败：${err.message}`);
  }
  return 180000;
}

async function ensureViewportSize(browser, page, targetWidth, targetHeight) {
  const session = await page.target().createCDPSession();
  const { windowId } = await session.send("Browser.getWindowForTarget");
  await session.send("Browser.setWindowBounds", {
    windowId,
    bounds: { windowState: "maximized" },
  });
  await page.waitForTimeout(180);

  for (let i = 0; i < 4; i += 1) {
    const metrics = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
    }));

    const dw = targetWidth - metrics.innerWidth;
    const dh = targetHeight - metrics.innerHeight;
    if (Math.abs(dw) <= 1 && Math.abs(dh) <= 1) {
      break;
    }

    const nextWidth = Math.max(800, metrics.outerWidth + dw);
    const nextHeight = Math.max(600, metrics.outerHeight + dh);
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: {
        width: Math.round(nextWidth),
        height: Math.round(nextHeight),
      },
    });
    await page.waitForTimeout(120);
  }

  await page.setViewport({ width: targetWidth, height: targetHeight });
  const finalMetrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }));
  if (Math.abs(finalMetrics.innerWidth - targetWidth) > 2 || Math.abs(finalMetrics.innerHeight - targetHeight) > 2) {
    await session.send("Browser.setWindowBounds", {
      windowId,
      bounds: { windowState: "fullscreen" },
    });
    await page.waitForTimeout(200);
    await page.setViewport({ width: targetWidth, height: targetHeight });
  }
}

(async () => {
  fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });

  const serve = await ensureServe();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      ignoreDefaultArgs: ["--enable-automation"],
      defaultViewport: {
        width: WIDTH,
        height: HEIGHT,
      },
      args: [
        `--window-size=${WIDTH},${HEIGHT}`,
        "--start-maximized",
        "--autoplay-policy=no-user-gesture-required",
        "--disable-infobars",
        "--disable-blink-features=AutomationControlled",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-frame-rate-limit",
      ],
    });

    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });
    await page.setViewport({ width: WIDTH, height: HEIGHT });
    await ensureViewportSize(browser, page, WIDTH, HEIGHT);

    const pageUrl = `${SERVE_URL}/index.html`;
    const outputFile = buildOutputPath();
    const totalDurationMs = readTotalDurationMs();

    const recorder = new PuppeteerScreenRecorder(page, {
      followNewTab: false,
      fps: FPS,
      videoFrame: {
        width: WIDTH,
        height: HEIGHT,
      },
      videoCrf: 18,
      videoBitrate: BITRATE,
      autopad: {
        color: "black",
      },
      aspectRatio: `${WIDTH}:${HEIGHT}`,
    });

    await page.goto(pageUrl, { waitUntil: "load" });
    await recorder.start(outputFile);

    // 控制区默认隐藏，先展开控制区
    await page.click("#toggle-controls");
    await page.waitForTimeout(150);

    // 某些页面层会拦截鼠标事件，直接触发按钮 click 更稳
    await page.$eval("#play-btn", (el) => el.click());
    // 开始播放后收起控制区，避免录屏时显示按钮
    await page.click("#toggle-controls");

    // 总时长 + 缓冲，保证最后一页也录进去
    await page.waitForTimeout(totalDurationMs + 6000);

    await recorder.stop();
    await browser.close();
    browser = undefined;

    console.log(`录制完成: ${outputFile}`);
    console.log(`总时长约 ${(totalDurationMs / 1000).toFixed(1)}s，参数 ${WIDTH}x${HEIGHT} @ ${FPS}fps`);
  } finally {
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    shutdownServe(serve);
  }
})().catch((err) => {
  console.error(`[record] 失败：${err.stack || err.message}`);
  process.exit(1);
});