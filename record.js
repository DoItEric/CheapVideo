const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder");

const WIDTH = Number(process.env.RECORD_WIDTH || 2560);
const HEIGHT = Number(process.env.RECORD_HEIGHT || 1300);
const FPS = Number(process.env.RECORD_FPS || 30);
const BITRATE = Number(process.env.RECORD_BITRATE || 12_000_000);

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

  const browser = await puppeteer.launch({
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
  const fileUrl = "file:///" + path.join(__dirname, "index.html").replace(/\\/g, "/");
  const outputFile = buildOutputPath();

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

  await page.goto(fileUrl, { waitUntil: "load" });
  await recorder.start(outputFile);

  // 控制区默认隐藏，先展开控制区
  await page.click("#toggle-controls");
  await page.waitForTimeout(150);

  // 某些页面层会拦截鼠标事件，直接触发按钮 click 更稳
  await page.$eval("#play-btn", (el) => el.click());
  // 开始播放后收起控制区，避免录屏时显示按钮
  await page.click("#toggle-controls");

  // 从页面里读取总时长，避免手工改数值
  const totalDurationMs = await page.evaluate(() => {
    const scripts = Array.from(document.querySelectorAll("script"));
    const inlineScript = scripts.find((s) => s.textContent && s.textContent.includes("const pages = ["));
    if (!inlineScript || !inlineScript.textContent) {
      return 180000;
    }
    const match = inlineScript.textContent.match(/const pages = \[([\s\S]*?)\];/);
    if (!match) {
      return 180000;
    }
    const durations = [...match[1].matchAll(/duration:\s*(\d+)/g)].map((m) => Number(m[1]));
    if (!durations.length) {
      return 180000;
    }
    return durations.reduce((sum, n) => sum + n, 0);
  });

  // 总时长 + 缓冲，保证最后一页也录进去
  await page.waitForTimeout(totalDurationMs + 6000);

  await recorder.stop();
  await browser.close();

  console.log(`录制完成: ${outputFile}`);
  console.log(`总时长约 ${(totalDurationMs / 1000).toFixed(1)}s，参数 ${WIDTH}x${HEIGHT} @ ${FPS}fps`);
})();