#!/usr/bin/env node
/**
 * page-batches.js
 *
 * 用途：把 pages.json 切成 N 批（默认 1 个 page 一批），为每个 page 生成独立的
 *       cline GEN 脚本（sh / bat / js 三种格式）以及统一串联的 run.sh / run.bat。
 *       提示词中嵌入完整的 tech.md / theme-*.md / index.html / gen-single.md，
 *       让 cline 拥有一次性生成页面所需的全部上下文（不节选）。
 *
 * 输出到 batches/（扁平结构，Windows 路径更稳）：
 *   - manifest.json
 *   - run.sh / run.bat                 统一运行所有 page
 *   - page-NN-prompt.txt               该 page 完整 GEN 提示词
 *   - page-NN.sh / page-NN.bat / page-NN.js   调 cline 的三种调用方式
 *
 * 用法：
 *   node scripts/page-batches.js
 *   node scripts/page-batches.js -b 1 -s 1 -e 16
 *   node scripts/page-batches.js -b 2 -s 3 -e 8 --theme dark-tech
 *   node scripts/page-batches.js --model gpt-4o
 */

const fs = require('fs');
const path = require('path');

/* ──────────────────── CLI 解析 ──────────────────── */
function parseArgs(argv) {
  const args = {
    batchSize: 1,
    startScene: 1,
    endScene: null,
    theme: 'dark-tech-standard',
    skill: 'skills/gen-single.md',
    model: null,
    clineBin: 'cline',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === '--batch-size' || token === '-b') {
      args.batchSize = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--start' || token === '-s') {
      args.startScene = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--end' || token === '-e') {
      args.endScene = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--theme' || token === '-t') {
      args.theme = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--skill' || token === '-k') {
      args.skill = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--model' || token === '-m') {
      args.model = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--cline-bin') {
      args.clineBin = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === '--help' || token === '-h') {
      printHelp();
      process.exit(0);
    }
    if (/^\d+$/.test(token)) {
      args.batchSize = Number(token);
    }
  }
  return args;
}

function printHelp() {
  console.log(
    [
      'Usage: node scripts/page-batches.js [options]',
      '',
      'Options:',
      '  -b, --batch-size N      每批 page 数（默认 1）',
      '  -s, --start S           起始 page index（默认 1）',
      '  -e, --end E             结束 page index（默认 pages.length）',
      '  -t, --theme NAME        主题目录名（默认 dark-tech-standard）',
      '  -k, --skill PATH        skill md 路径（默认 skills/gen-single）',
      '  -m, --model NAME        透传给 cline 的模型参数',
      '      --cline-bin BIN     cline 可执行文件（默认 cline）',
      '  -h, --help              打印本帮助',
      '',
      '示例:',
      '  node scripts/page-batches.js                 # 全量 16 页',
      '  node scripts/page-batches.js -b 1 -s 1 -e 16 # 显式指定范围',
      '  node scripts/page-batches.js -b 2 -s 3 -e 8  # 每批 2 张，page 3-8',
      '  node scripts/page-batches.js --theme dark-tech',
    ].join('\n')
  );
}

/* ──────────────────── 工具函数 ──────────────────── */
function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

/** 把 page 字段归一化（处理有 items / 只有 content 两种形态） */
function normalizePage(page) {
  const hasItems = Array.isArray(page.items) && page.items.length > 0;
  const items = hasItems
    ? page.items.map((it, i) => ({
        index: it.index || i + 1,
        content: it.content || '',
        start: Number.isFinite(it.start) ? it.start : 0,
        end: Number.isFinite(it.end) ? it.end : page.duration,
        duration: Number.isFinite(it.duration)
          ? it.duration
          : Math.max(0, (it.end || page.duration) - (it.start || 0)),
      }))
    : null;

  const text =
    (page.summary && page.summary.trim()) || (page.content && page.content.trim()) || '';

  const baseHtml = page.pageHtmlPath || `pages/Page${page.index}.html`;
  const cssPath = baseHtml.replace(/\.html?$/i, '.css');
  const jsPath = baseHtml.replace(/\.html?$/i, '.js');

  return {
    index: page.index,
    pageName: page.pageName || baseHtml.split('/').pop(),
    pageHtmlPath: baseHtml,
    cssPath,
    jsPath,
    duration: page.duration,
    summary: text,
    items,
  };
}

function makeModelFlag(model) {
  return model ? ` --model ${model}` : '';
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** 列出 pages/ 目录中已存在的 page 文件（page 名前缀，不带 .html/.css/.js 后缀） */
function listExistingPages(pagesDir) {
  if (!fs.existsSync(pagesDir)) return [];
  const files = fs.readdirSync(pagesDir);
  const names = new Set();
  for (const f of files) {
    const m = f.match(/^(Page?\d+)\.(html|css|js)$/i);
    if (m) names.add(m[1]);
  }
  return Array.from(names).sort();
}

/* ──────────────────── Prompt 拼接（完整嵌入，不节选） ──────────────────── */
function buildPrompt({
  batch, batchIndex, batches, theme,
  techMd, skillMd, themeMd, themeExample, existingPages,
}) {
  const pageIndexes = batch.map((p) => p.index).join(', ');
  const fileLines = batch
    .map((p) => `  - ${p.pageName}  →  ${p.pageHtmlPath} + ${p.cssPath} + ${p.jsPath}`)
    .join('\n');

  return [
    '# 任务',
    '',
    `你现在只处理第 ${batchIndex + 1}/${batches.length} 批 page（共 ${batch.length} 张）。`,
    `本批 page 序号：${pageIndexes}`,
    '',
    '## 本批输出文件（注意 pageName 的大小写，pages.json 中已指定，请照抄）',
    fileLines,
    '',
    '# 项目目录结构（html-ppt-template/）',
    '```',
    '├── index.html              ← 播放器主入口（iframe 切换页面）',
    '├── pages.json              ← ⭐ 唯一内容源，pages 数组决定每一页讲什么',
    '├── pages/                  ← 生成的页面文件（你输出到这里）',
    '│   ├── Page1.html / page1.css / page1.js',
    '│   ├── page2.html / page2.css / page2.js',
    '│   └── ...（共 ' + batch.length + ' 个 page × 3 文件）',
    '├── styles/index.css        ← 播放器外壳样式',
    '├── themes/',
    '│   ├── tech.md             ← 技术栈选型（CDN/库用法速查）',
    `│   └── ${theme}/           ← ⭐ 当前主题（你必须严格遵守）`,
    `│       ├── theme-${theme}.md`,
    '│       └── index.html      ← 主题示例页（可参考视觉风格）',
    '├── skills/gen-single.md    ← ⭐ 生成规则（必读）',
    '├── record.js               ← Puppeteer 录屏脚本（生成后用于录视频）',
    '└── scripts/page-batches.js ← 本脚本',
    '```',
    '',
    '# 必须读取并遵守的文件（顺序）',
    `1. themes/tech.md`,
    `2. themes/${theme}/theme-${theme}.md`,
    `3. themes/${theme}/index.html`,
    `4. skills/gen-single.md`,
    '',
    '# 本批 page 元数据（来自 pages.json，已归一化）',
    '```json',
    JSON.stringify(batch, null, 2),
    '```',
    '',
    '# pages/ 目录现有 page（不区分大小写）',
    '```',
    existingPages.length ? existingPages.join('\n') : '（空）',
    '```',
    '',
    '# 关键约束（违反任何一条都算不合格）',
    '1. **不要修改 pages.json / index.html / styles/index.css** —— 你只生成 pages/ 下的 3 个文件。',
    '2. **文件名严格按 pages.json 的 pageName / pageHtmlPath / cssPath / jsPath 字段**（注意 Page1.html vs page2.html 这种大小写差异）。',
    '3. **画布固定 960×720**，使用 Tailwind 排版 + animate.css 入场 + (可选) transition-style / typed.js / vanta.js。',
    `4. **颜色与字体严格使用主题 tokens**（dts-bg / dts-accent / dts-cyan / dts-violet ...），参考 themes/${theme}/index.html。`,
    '5. **iframe 加载约束**：HTML 内不能写 `<a href>` 跳其他页；不能全局 Vanta 背景（播放器已加载）。',
    '6. **页面底部必须含 `<script id="page-timeline" type="application/json">`，内容 = 本页 items 数组 JSON**（没有 items 的 page 写空数组 `[]`）。',
    '7. **3 个文件大小写保持一致**（Page1.html → page1.css → page1.js，Page12.html → page12.css → page12.js）。',
    '8. **避免 §7 的所有禁忌**：无时间码、无字幕、不死板列表、不连续两页同布局、严禁"大大小小的方框"。',
    '9. **每页之间动画要有变化**（不要连续两页用同一个 animate__xxx）。',
    '10. **80% 的 items 必须有入场动效**（如果有 items 的话）。',
    '',
    '# 任务清单',
    '1. 用 list_files 确认 pages/ 目录当前已有文件',
    '2. 用 read_file 至少读一遍上面列出的 4 份必读文件',
    '3. 为本批每个 page 依次生成 .html / .css / .js 三个文件',
    '4. 写完用 read_file 抽查关键片段（timeline JSON、tailwind config、CDN link）',
    `5. 最后一行写：BATCH_DONE ${pad2(batchIndex + 1)}`,
    '',
    '# ────────────────────────────────────────────────────────────────',
    '# 完整上下文（不再节选）',
    '# ────────────────────────────────────────────────────────────────',
    '',
    '## =============== themes/tech.md ===============',
    techMd,
    '',
    `## =============== themes/${theme}/theme-${theme}.md ===============`,
    themeMd,
    '',
    `## =============== themes/${theme}/index.html ===============`,
    themeExample,
    '',
    '## =============== skills/gen-single.md ===============',
    skillMd,
    '',
    '## =============== END ===============',
  ].join('\n');
}

/* ──────────────────── 三种调用脚本生成 ──────────────────── */
function buildShScript({ projectRoot, promptTxtRel, pageTag, modelFlag, clineBin }) {
  return `#!/bin/bash
# Auto-generated by scripts/page-batches.js
# GEN for ${pageTag}
set -e
SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="${projectRoot}"
cd "\${PROJECT_ROOT}"
echo "═══ [GEN] ${pageTag} (cwd: \$(pwd)) ═══"
${clineBin} --yes --no-git${modelFlag} < "\${SCRIPT_DIR}/${promptTxtRel}"
`;
}

function buildBatScript({ projectRoot, promptTxtRel, pageTag, modelFlag, clineBin }) {
  return `@echo off
rem Auto-generated by scripts/page-batches.js
rem GEN for ${pageTag}
setlocal
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=${projectRoot}
cd /d "%PROJECT_ROOT%"
echo === [GEN] ${pageTag} (cwd: %cd%) ===
type "%SCRIPT_DIR%\\${promptTxtRel}" | ${clineBin} --yes --no-git${modelFlag}
exit /b %ERRORLEVEL%
`;
}

function buildJsScript({ promptTxtRel, pageTag, modelFlag, clineBin }) {
  return `#!/usr/bin/env node
/* Auto-generated by scripts/page-batches.js */
/* GEN for ${pageTag} */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.join(SCRIPT_DIR, '..', '..');
process.chdir(PROJECT_ROOT);
console.log('═══ [GEN] ${pageTag} (cwd: ' + process.cwd() + ') ═══');

const prompt = fs.readFileSync(path.join(SCRIPT_DIR, '${promptTxtRel}'), 'utf8');
const args = ['--yes', '--no-git'${modelFlag ? `, '--model', '${args_model_for_js}'` : ''}].filter(Boolean);
// 注：若需透传 --model，请在调用方用 buildJsScript 拼装 args（见 main）
const r = spawnSync('${clineBin}', args, { input: prompt, stdio: ['pipe', 'inherit', 'inherit'], shell: true });
process.exit(r.status || 0);
`;
}

/* ──────────────────── main ──────────────────── */
function main() {
  // 使用脚本所在项目的根目录（即 scripts/ 的父目录），而不是进程当前工作目录
  const root = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));

  if (!Number.isFinite(args.batchSize) || args.batchSize < 1) {
    console.error('错误：--batch-size 必须是正整数');
    printHelp();
    process.exit(1);
  }

  const pagesPath = path.join(root, 'pages.json');
  const techPath = path.join(root, 'themes', 'tech.md');
  const skillPath = path.join(root, args.skill);
  const themeDir = path.join(root, 'themes', args.theme);
  const themeDocPath = path.join(themeDir, `theme-${args.theme}.md`);
  const themeExamplePath = path.join(themeDir, 'index.html');
  const pagesDir = path.join(root, 'pages');

  for (const p of [pagesPath, techPath, skillPath, themeDocPath]) {
    if (!fs.existsSync(p)) {
      console.error(`缺少文件: ${p}`);
      process.exit(1);
    }
  }

  const pagesJson = JSON.parse(fs.readFileSync(pagesPath, 'utf8'));
  const techMd = fs.readFileSync(techPath, 'utf8');
  const skillMd = fs.readFileSync(skillPath, 'utf8');
  const themeMd = fs.readFileSync(themeDocPath, 'utf8');
  const themeExample = fs.existsSync(themeExamplePath)
    ? fs.readFileSync(themeExamplePath, 'utf8')
    : '（主题示例页不存在）';

  const pages = Array.isArray(pagesJson.pages) ? pagesJson.pages : [];
  if (pages.length === 0) {
    console.error('pages.json 中没有找到 pages 数组');
    process.exit(1);
  }

  const startScene = Math.max(1, args.startScene || 1);
  const endScene = Math.min(pages.length, args.endScene || pages.length);
  const selectedPages = pages.slice(startScene - 1, endScene);
  if (selectedPages.length === 0) {
    console.error(`没有匹配的 page：${startScene}-${endScene}`);
    process.exit(1);
  }

  const normalized = selectedPages.map(normalizePage);
  const batches = chunk(normalized, args.batchSize);
  const outDir = path.join(root, 'batches');
  fs.mkdirSync(outDir, { recursive: true });

  const existingPages = listExistingPages(pagesDir);
  const projectRoot = root; // 在 sh/bat 中用绝对路径避免相对路径歧义
  const modelFlag = makeModelFlag(args.model);

  /* 写 manifest */
  const manifest = {
    batchSize: args.batchSize,
    startScene,
    endScene,
    totalPages: normalized.length,
    totalBatches: batches.length,
    theme: args.theme,
    skill: args.skill,
    model: args.model,
    clineBin: args.clineBin,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  const shFiles = [];
  const batFiles = [];
  const jsFiles = [];

  batches.forEach((batch, batchIndex) => {
    const batchNo = pad2(batchIndex + 1);
    const pageIndexes = batch.map((p) => p.index).join('-');
    const pageTag = `page${batchNo} (index ${pageIndexes})`;

    const prompt = buildPrompt({
      batch,
      batchIndex,
      batches,
      theme: args.theme,
      techMd,
      skillMd,
      themeMd,
      themeExample,
      existingPages,
    });

    const promptTxtName = `page-${batchNo}-prompt.txt`;
    const promptTxtRel = promptTxtName;
    fs.writeFileSync(path.join(outDir, promptTxtName), prompt, 'utf8');

    /* sh */
    const shName = `page-${batchNo}.sh`;
    const shScript = buildShScript({
      projectRoot,
      promptTxtRel,
      pageTag,
      modelFlag,
      clineBin: args.clineBin,
    });
    fs.writeFileSync(path.join(outDir, shName), shScript, 'utf8');
    shFiles.push(shName);

    /* bat */
    const batName = `page-${batchNo}.bat`;
    const batScript = buildBatScript({
      projectRoot,
      promptTxtRel,
      pageTag,
      modelFlag,
      clineBin: args.clineBin,
    });
    fs.writeFileSync(path.join(outDir, batName), batScript, 'utf8');
    batFiles.push(batName);

    /* js */
    const jsName = `page-${batchNo}.js`;
    // js 的 --model 参数必须直接嵌入 args 数组，不能用占位符
    const argsForJs = ['--yes', '--no-git'];
    if (args.model) argsForJs.push('--model', args.model);
    const jsScript = `#!/usr/bin/env node
/* Auto-generated by scripts/page-batches.js */
/* GEN for ${pageTag} */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
// 使用绝对路径（与 sh/bat 一致），避免从不同目录运行时路径错误
const PROJECT_ROOT = ${JSON.stringify(projectRoot)};
process.chdir(PROJECT_ROOT);
console.log('═══ [GEN] ${pageTag} (cwd: ' + process.cwd() + ') ═══');

const prompt = fs.readFileSync(path.join(SCRIPT_DIR, ${JSON.stringify(promptTxtRel)}), 'utf8');
const args = ${JSON.stringify(argsForJs)};
const r = spawnSync(${JSON.stringify(args.clineBin)}, args, {
  input: prompt,
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true,
});
process.exit(r.status || 0);
`;
    fs.writeFileSync(path.join(outDir, jsName), jsScript, 'utf8');
    jsFiles.push(jsName);
  });

  /* run.sh — 串联所有 page 的 sh 脚本 */
  const runSh = `#!/bin/bash
# Auto-generated by scripts/page-batches.js
# Run all GEN scripts in sequence.
set -e
SCRIPT_DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
cd "\${SCRIPT_DIR}/.."
COUNT=0
for s in "\${SCRIPT_DIR}"/page-*.sh; do
  [ -f "\$s" ] || continue
  COUNT=\$((COUNT+1))
  bash "\$s"
  sleep 3
done
echo "═══ Done: ran \${COUNT} GEN script(s) ═══"
`;
  fs.writeFileSync(path.join(outDir, 'run.sh'), runSh, 'utf8');

  /* run.bat — 串联所有 page 的 bat 脚本 */
  const runBat = `@echo off
rem Auto-generated by scripts/page-batches.js
rem Run all GEN scripts in sequence.
setlocal
set SCRIPT_DIR=%~dp0
set COUNT=0
for %%f in ("%SCRIPT_DIR%\\page-*.bat") do (
  set /a COUNT+=1
  call "%%f"
  timeout /t 3 /nobreak >nul
)
echo === Done: ran %COUNT% GEN script(s) ===
`;
  fs.writeFileSync(path.join(outDir, 'run.bat'), runBat, 'utf8');

  console.log(`✓ 已生成 ${batches.length} 个 page 的 GEN 脚本到 batches/`);
  console.log(`  - manifest.json`);
  console.log(`  - run.sh / run.bat                          统一串联运行`);
  for (let i = 0; i < batches.length; i += 1) {
    const no = pad2(i + 1);
    console.log(`  - page-${no}-prompt.txt + page-${no}.sh/.bat/.js`);
  }
  console.log('');
  console.log(`参数：`);
  console.log(`  - batch size : ${args.batchSize}`);
  console.log(`  - page range : ${startScene}-${endScene}`);
  console.log(`  - theme      : ${args.theme}`);
  console.log(`  - skill      : ${args.skill}`);
  console.log(`  - model      : ${args.model || '(cline 默认)'}`);
  console.log(`  - cline bin  : ${args.clineBin}`);
  console.log('');
  console.log('执行（任选其一）：');
  console.log('  sh batches/run.sh                       # Git Bash / WSL');
  console.log('  batches\\run.bat                        # Windows CMD');
  console.log(`  for %%f in (batches\\page-*.bat) do call "%%f"   # 手动串联`);
  console.log(`  for %%f in (batches\\page-*.js) do node "%%f"     # 通过 node 调 cline`);
  console.log('  bash batches/page-03.sh                 # 单个 page');
}

main();