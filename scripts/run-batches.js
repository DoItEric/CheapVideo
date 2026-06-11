#!/usr/bin/env node
/**
 * run-batches.js
 *
 * 用途：调度器 —— 串行执行 batches/page-*.js（即 page-batches.js 生成的 page 脚本）。
 *       每个 .js 内部会用 spawnSync 调一次 cline CLI；本调度器负责：
 *         - 解析 batches/manifest.json 获取批次范围
 *         - 顺序 spawn 各个 page-NN.js（用 node 执行子进程）
 *         - 进度展示、超时、失败处理
 *         - 汇总报告 + 写 batches/run.log
 *
 * 用法：
 *   node scripts/run-batches.js                  # 跑 manifest 里的全部批次
 *   node scripts/run-batches.js -s 1 -e 4        # 只跑 page 1-4
 *   node scripts/run-batches.js --retry          # 只重试上次失败/未跑的
 *   node scripts/run-batches.js --stop-on-fail   # 失败时立即停止
 *   node scripts/run-batches.js --timeout 600000 # 单 page 超时（默认 10 分钟）
 *   node scripts/run-batches.js --no-color       # 禁用颜色
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/* ──────────────────── 颜色工具 ──────────────────── */
const useColor = process.stdout.isTTY && !process.argv.includes('--no-color');
const c = (color, s) => (useColor ? `\x1b[${color}m${s}\x1b[0m` : s);
const RED = (s) => c('31', s);
const GREEN = (s) => c('32', s);
const YELLOW = (s) => c('33', s);
const BLUE = (s) => c('34', s);
const CYAN = (s) => c('36', s);
const GRAY = (s) => c('90', s);
const BOLD = (s) => c('1', s);

/* ──────────────────── CLI 解析 ──────────────────── */
function parseArgs(argv) {
  const args = {
    start: null,
    end: null,
    retry: false,
    stopOnFail: false,
    timeout: 10 * 60 * 1000, // 10 分钟
    batchesDir: 'batches',
    noColor: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (t === '--start' || t === '-s') {
      args.start = Number(argv[i + 1]);
      i += 1;
    } else if (t === '--end' || t === '-e') {
      args.end = Number(argv[i + 1]);
      i += 1;
    } else if (t === '--retry' || t === '-r') {
      args.retry = true;
    } else if (t === '--stop-on-fail') {
      args.stopOnFail = true;
    } else if (t === '--timeout' || t === '-t') {
      args.timeout = Number(argv[i + 1]);
      i += 1;
    } else if (t === '--batches-dir') {
      args.batchesDir = String(argv[i + 1]);
      i += 1;
    } else if (t === '--no-color') {
      args.noColor = true;
    } else if (t === '--help' || t === '-h') {
      printHelp();
      process.exit(0);
    } else if (/^\d+$/.test(t) && args.start === null) {
      args.start = Number(t);
    } else if (/^\d+$/.test(t)) {
      args.end = Number(t);
    }
  }
  return args;
}

function printHelp() {
  console.log(
    [
      'Usage: node scripts/run-batches.js [options]',
      '',
      'Options:',
      '  -s, --start N            起始 page index（默认 1）',
      '  -e, --end N              结束 page index（默认 manifest 的 endScene）',
      '  -r, --retry              只跑上次未跑/失败的（读 batches/run.log）',
      '      --stop-on-fail       任一 page 失败时立即停止（默认继续跑完）',
      '  -t, --timeout MS         单 page 超时（毫秒，默认 600000 = 10 分钟）',
      '      --batches-dir DIR    批处理目录（默认 batches）',
      '      --no-color           禁用颜色输出',
      '  -h, --help               打印本帮助',
      '',
      '示例:',
      '  node scripts/run-batches.js              # 跑全部',
      '  node scripts/run-batches.js -s 3 -e 5    # 只跑 page 3-5',
      '  node scripts/run-batches.js --retry      # 重试失败项',
    ].join('\n')
  );
}

/* ──────────────────── run.log 解析 ──────────────────── */
/**
 * run.log 格式（每行一条）：
 *   2026-06-11T10:00:00.000Z OK    page-01
 *   2026-06-11T10:02:00.000Z FAIL  page-02 exit=1
 *   2026-06-11T10:05:00.000Z TIMEOUT page-03
 */
function parseRunLog(logPath) {
  if (!fs.existsSync(logPath)) return new Map();
  const text = fs.readFileSync(logPath, 'utf8');
  const map = new Map();
  for (const line of text.split('\n')) {
    const m = line.match(/^\S+\s+(OK|FAIL|TIMEOUT)\s+(\S+)/);
    if (m) map.set(m[2], m[1]);
  }
  return map;
}

function appendRunLog(logPath, batchNo, status, extra) {
  const ts = new Date().toISOString();
  const line = `${ts} ${status.padEnd(7)} page-${batchNo}${extra ? ' ' + extra : ''}\n`;
  fs.appendFileSync(logPath, line, 'utf8');
}

/* ──────────────────── 单个 page 执行 ──────────────────── */
function runPage(jsPath, { timeoutMs, index, total, batchNo }) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const head = `[${String(index).padStart(2, '0')}/${total}] ${BOLD('page-' + batchNo)}`;
    console.log(`\n${CYAN('═══')} ${head} ${GRAY(jsPath)}`);

    const child = spawn(process.execPath, [jsPath], {
      stdio: 'inherit',
      windowsHide: true,
    });

    let timer = null;
    let killed = false;

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        killed = true;
        try {
          child.kill('SIGTERM');
        } catch (_) { /* ignore */ }
        // Windows 上 SIGTERM 不会传递，几秒后强制杀
        setTimeout(() => {
          try {
            child.kill('SIGKILL');
          } catch (_) { /* ignore */ }
        }, 3000);
      }, timeoutMs);
    }

    child.on('exit', (code, signal) => {
      if (timer) clearTimeout(timer);
      const dur = ((Date.now() - startedAt) / 1000).toFixed(1);

      if (killed) {
        console.log(`${YELLOW('⏱  TIMEOUT')} ${GRAY(dur + 's')}`);
        return resolve({ status: 'TIMEOUT', code: null, durationSec: Number(dur) });
      }
      if (code === 0) {
        console.log(`${GREEN('✓ OK')}      ${GRAY(dur + 's')}`);
        return resolve({ status: 'OK', code, durationSec: Number(dur) });
      }
      console.log(
        `${RED('✗ FAIL')}    ${GRAY(dur + 's')} ${GRAY('exit=' + (code != null ? code : signal))}`
      );
      resolve({ status: 'FAIL', code, signal, durationSec: Number(dur) });
    });

    child.on('error', (err) => {
      if (timer) clearTimeout(timer);
      console.log(`${RED('✗ ERROR')}   ${err.message}`);
      resolve({ status: 'FAIL', code: -1, error: err.message });
    });
  });
}

/* ──────────────────── main ──────────────────── */
async function main() {
  // 使用脚本所在项目的根目录（即 scripts/ 的父目录），而不是进程当前工作目录
  const root = path.resolve(__dirname, '..');
  const args = parseArgs(process.argv.slice(2));
  if (args.noColor) process.env.NO_COLOR = '1';

  const batchesDir = path.join(root, args.batchesDir);
  const manifestPath = path.join(batchesDir, 'manifest.json');
  const runLogPath = path.join(batchesDir, 'run.log');

  if (!fs.existsSync(manifestPath)) {
    console.error(`${RED('错误')}：找不到 ${manifestPath}`);
    console.error(`请先跑：node scripts/page-batches.js`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const { totalBatches, startScene, endScene } = manifest;
  const runFrom = args.start || startScene;
  const runTo = args.end || endScene;

  console.log(
    `${BOLD('调度器')}  batches: ${CYAN(args.batchesDir)}  pages: ${CYAN(
      String(runFrom)
    )}-${CYAN(String(runTo))}  total: ${CYAN(String(totalBatches))}`
  );
  console.log(
    `  ${GRAY('timeout=' + args.timeout + 'ms  stopOnFail=' + args.stopOnFail + '  retry=' + args.retry)}`
  );

  /* 列出 page-NN.js */
  const allJs = fs
    .readdirSync(batchesDir)
    .filter((f) => /^page-\d+\.js$/.test(f))
    .sort();
  if (allJs.length === 0) {
    console.error(`${RED('错误')}：${batchesDir}/ 下没有 page-*.js`);
    process.exit(1);
  }

  /* 过滤范围 */
  const prevLog = args.retry ? parseRunLog(runLogPath) : new Map();
  const selected = [];
  for (const f of allJs) {
    const no = Number(f.match(/^page-(\d+)\.js$/)[1]);
    const pageIdx = runFrom + (no - 1); // batchNo -> 对应 page index（默认 batchNo 与 page 序号一致）
    if (no < runFrom || no > runTo) continue;
    // run.log 里 key 是 `page-NN`（无 .js 后缀），查询时统一去后缀
    if (args.retry && prevLog.get(f.replace(/\.js$/, '')) === 'OK') continue; // 重试模式：跳过上次 OK 的
    selected.push({ file: f, batchNo: no, pageIdx });
  }

  if (selected.length === 0) {
    console.log(`${YELLOW('⚠')} 没有可跑的脚本（范围内都已 OK）`);
    return;
  }

  console.log(
    `\n即将跑 ${BOLD(selected.length)} 个 page：${selected.map((s) => s.file).join(', ')}\n`
  );

  /* 清空 run.log（如果是首次跑或非 --retry） */
  if (!args.retry && fs.existsSync(runLogPath)) {
    const backupName = `run.log.${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
    fs.renameSync(runLogPath, path.join(batchesDir, backupName));
    console.log(`${GRAY('(已备份旧 run.log → ' + backupName + ')')}`);
  }

  /* 顺序执行 */
  const summary = [];
  const t0 = Date.now();
  for (let i = 0; i < selected.length; i += 1) {
    const { file, batchNo } = selected[i];
    const jsPath = path.join(batchesDir, file);
    const r = await runPage(jsPath, {
      timeoutMs: args.timeout,
      index: i + 1,
      total: selected.length,
      batchNo: String(batchNo).padStart(2, '0'),
    });
    summary.push({ file, ...r });
    appendRunLog(runLogPath, String(batchNo).padStart(2, '0'), r.status, r.code != null ? `exit=${r.code}` : '');

    if (r.status !== 'OK' && args.stopOnFail) {
      console.log(`\n${RED('⛔ --stop-on-fail 触发，中断后续执行')}`);
      break;
    }

    if (i < selected.length - 1) {
      // 冷却 2 秒，避免 cline 启动风暴
      await new Promise((r2) => setTimeout(r2, 2000));
    }
  }

  /* 汇总 */
  const totalSec = ((Date.now() - t0) / 1000).toFixed(1);
  const ok = summary.filter((s) => s.status === 'OK').length;
  const fail = summary.filter((s) => s.status === 'FAIL').length;
  const timeout = summary.filter((s) => s.status === 'TIMEOUT').length;

  console.log('\n' + '━'.repeat(60));
  console.log(
    `${BOLD('汇总')}  ${GREEN(ok + ' OK')}  ${fail ? RED(fail + ' FAIL') : GRAY('0 FAIL')}  ${
      timeout ? YELLOW(timeout + ' TIMEOUT') : GRAY('0 TIMEOUT')
    }   总耗时 ${totalSec}s`
  );

  if (fail + timeout > 0) {
    console.log(`\n${YELLOW('失败的项：')}`);
    for (const s of summary) {
      if (s.status !== 'OK') {
        console.log(`  ${RED('•')} ${s.file}  ${GRAY(s.status + (s.code != null ? ' exit=' + s.code : ''))}`);
      }
    }
    console.log(`\n${GRAY('重跑失败项：node scripts/run-batches.js --retry')}`);
    process.exit(1);
  }

  console.log(`${GREEN('✓')} 全部完成。日志：${runLogPath}`);
}

main().catch((err) => {
  console.error(`${RED('fatal:')} ${err.stack || err.message}`);
  process.exit(2);
});