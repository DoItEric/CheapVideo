const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.join(__dirname, "step1.srt");
const OUTPUT_FILE = path.join(__dirname, "step1_pages.json");

function timeToMs(timeStr) {
  const match = timeStr.match(
    /^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})$/
  );
  if (!match) {
    throw new Error(`Invalid time line: ${timeStr}`);
  }

  const start =
    Number(match[1]) * 3600000 +
    Number(match[2]) * 60000 +
    Number(match[3]) * 1000 +
    Number(match[4]);
  const end =
    Number(match[5]) * 3600000 +
    Number(match[6]) * 60000 +
    Number(match[7]) * 1000 +
    Number(match[8]);

  return { start, end };
}

/**
 * 一次性解析整个 SRT，在解析过程中记录 --- 和 &&& 分隔符的位置
 * 避免二次 split 导致的序号/时间戳混入文本的问题
 * 
 * SRT 结构：
 *   序号
 *   时间行
 *   文本（可能多行）
 *   （空行）
 *   &&& 或 --- 出现在文本之后、下一个序号之前
 */
function parseSrtCues(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const cues = [];

  let state = "expect_seq"; // expect_seq -> expect_time -> expect_text
  let currentSeq = null;
  let currentTime = null;
  let currentText = [];
  let animationBreakAfter = false;
  let pageBreakAfter = false;

  function saveCurrent() {
    if (currentSeq !== null && currentTime) {
      const time = timeToMs(currentTime);
      cues.push({
        seq: Number(currentSeq),
        start: time.start,
        end: time.end,
        text: currentText.join("").trim(),
        animationBreakAfter,
        pageBreakAfter,
      });
    }
  }

  function resetCurrent() {
    currentSeq = null;
    currentTime = null;
    currentText = [];
    animationBreakAfter = false;
    pageBreakAfter = false;
    state = "expect_seq";
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // 空行：结束当前 cue（不带分隔符标记）
    if (!line) {
      if (state === "expect_text" || (currentSeq !== null && currentTime)) {
        saveCurrent();
        resetCurrent();
      }
      continue;
    }

    // 分隔符：可能出现在文本之后（无空行），需要先保存当前 cue 再重置
    if (line === "---" || line === "&&&") {
      if (state === "expect_text" && currentSeq !== null && currentTime) {
        // 在文本阶段遇到分隔符：给当前 cue 打上标记并保存
        if (line === "---") {
          pageBreakAfter = true;
        } else {
          animationBreakAfter = true;
        }
        saveCurrent();
        resetCurrent();
      }
      // 如果不在文本阶段（如空行后），忽略分隔符标记
      continue;
    }

    // 期望序号：纯数字
    if (state === "expect_seq") {
      if (/^\d+$/.test(line)) {
        currentSeq = line;
        state = "expect_time";
      }
      continue;
    }

    // 期望时间行
    if (state === "expect_time") {
      if (line.includes("-->")) {
        currentTime = line;
        state = "expect_text";
      }
      continue;
    }

    // 文本阶段：收集文本
    if (state === "expect_text") {
      currentText.push(line);
    }
  }

  // 处理最后一个 cue（文件末尾可能没有空行）
  if (currentSeq !== null && currentTime) {
    saveCurrent();
  }

  return cues;
}

/**
 * 根据 cues 中的 pageBreakAfter 和 animationBreakAfter 构建 pages
 */
function buildPages(cues) {
  const pages = [];
  const allTexts = [];

  // 按 --- 分组得到 page
  let currentPageCues = [];

  for (const cue of cues) {
    currentPageCues.push(cue);

    if (cue.pageBreakAfter) {
      processPage(currentPageCues, pages, allTexts);
      currentPageCues = [];
    }
  }

  // 处理最后一页
  if (currentPageCues.length > 0) {
    processPage(currentPageCues, pages, allTexts);
  }

  return {
    summary: allTexts.join(","),
    pages,
  };
}

/**
 * 处理一个 page 内的 cues，根据 &&& 拆分 items
 */
function processPage(cues, pages, allTexts) {
  if (cues.length === 0) return;

  const pageDuration = Math.max(0, cues[cues.length - 1].end - cues[0].start);
  const allTextsInPage = cues.map((c) => c.text).filter(Boolean);
  const hasAnimation = cues.some((c) => c.animationBreakAfter);

  if (hasAnimation) {
    // 按 &&& 分组得到 items
    const items = [];
    let currentItemCues = [];

    for (const cue of cues) {
      currentItemCues.push(cue);

      if (cue.animationBreakAfter) {
        processItem(currentItemCues, items);
        currentItemCues = [];
      }
    }

    // 处理最后一个 item
    if (currentItemCues.length > 0) {
      processItem(currentItemCues, items);
    }

    const summary = allTextsInPage.join("");

    pages.push({
      index: pages.length + 1,
      pageName: `page${pages.length + 1}.html`,
      pageHtmlPath: `pages/page${pages.length + 1}.html`,
      duration: pageDuration,
      summary,
      items,
    });
  } else {
    const content = allTextsInPage.join("");

    pages.push({
      index: pages.length + 1,
      pageName: `Page${pages.length + 1}.html`,
      pageHtmlPath: `pages/Page${pages.length + 1}.html`,
      duration: pageDuration,
      content,
    });
  }

  allTexts.push(...allTextsInPage);
}

/**
 * 将一个 item 内的 cues 合并为单个 item 对象
 */
function processItem(cues, items) {
  if (cues.length === 0) return;

  const content = cues.map((c) => c.text).filter(Boolean).join("");
  const duration = Math.max(0, cues[cues.length - 1].end - cues[0].start);

  items.push({
    index: items.length + 1,
    content,
    duration,
  });
}

function main() {
  const raw = fs.readFileSync(INPUT_FILE, "utf8");
  const cues = parseSrtCues(raw);
  const result = buildPages(cues);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf8");
  console.log(`Generated: ${OUTPUT_FILE}`);
  console.log(`Pages: ${result.pages.length}`);
}

main();
