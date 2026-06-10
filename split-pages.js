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

function parseSrt(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const cues = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line || line === "---") {
      i += 1;
      continue;
    }

    const next = (lines[i + 1] || "").trim();
    if (/^\d+$/.test(line) && next.includes("-->")) {
      const time = timeToMs(next);
      const textLines = [];
      let j = i + 2;

      while (j < lines.length) {
        const t = lines[j].trim();
        if (!t || t === "---") {
          break;
        }
        textLines.push(t);
        j += 1;
      }

      cues.push({
        start: time.start,
        end: time.end,
        text: textLines.join("").trim(),
      });

      i = j;
      continue;
    }

    i += 1;
  }

  return cues;
}

function splitByMarkers(raw) {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const chunks = [];
  let current = [];

  for (const line of lines) {
    if (line.trim() === "---") {
      chunks.push(current.join("\n"));
      current = [];
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) {
    chunks.push(current.join("\n"));
  }

  return chunks.filter((chunk) => chunk.trim());
}

function buildPages(raw) {
  const segments = splitByMarkers(raw);
  const pages = [];
  const allTexts = [];

  segments.forEach((segment, idx) => {
    const cues = parseSrt(segment);
    if (cues.length === 0) {
      return;
    }

    const offset = cues[0].start;
    const items = cues.map((cue) => {
      const start = cue.start - offset;
      const end = cue.end - offset;
      return {
        start,
        end,
        duration: end - start,
        text: cue.text,
      };
    });

    const content = cues.map((cue) => cue.text).filter(Boolean).join("");
    const duration = Math.max(0, cues[cues.length - 1].end - cues[0].start);

    pages.push({
      index: idx + 1,
      page: idx + 1,
      pageName: `page${idx + 1}`,
      pagePath: `pages/page${idx + 1}.html`,
      cssPath: `pages/page${idx + 1}.css`,
      jsPath: `pages/page${idx + 1}.js`,
      duration,
      content,
      items,
    });

    allTexts.push(...cues.map((cue) => cue.text).filter(Boolean));
  });

  return {
    summary: allTexts.join(","),
    pages,
  };
}

function main() {
  const raw = fs.readFileSync(INPUT_FILE, "utf8");
  const result = buildPages(raw);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf8");
  console.log(`Generated: ${OUTPUT_FILE}`);
  console.log(`Pages: ${result.pages.length}`);
}

main();
