# HTML PPT Template

> **专业级暗色科技主题** · 适用于商业产品发布 / 企业级技术方案 / 行业研究报告类 PPT 视频
>
> 主题：`dark-tech-standard` · 设计尺寸 960×720 · 16 页演示

---

## 🚀 快速开始（3 种启动方式）

### 方式 1：直接双击打开（最简单 ✅）

直接双击项目根目录下的 **`index.html`** 即可在浏览器中打开。

> ⚠️ 注意：Chrome / Edge 等浏览器对本地 `file://` 协议下的 `fetch('./pages.json')` 有跨域限制，
> 可能提示"无法加载 pages.json"。遇到这种情况请用方式 2 或方式 3。

### 方式 2：Python 静态服务器（推荐 · 零依赖）

Python 3 自带 `http.server`，无需安装任何东西：

```bash
# 在项目根目录执行
python -m http.server 8080
```

然后浏览器访问： **<http://localhost:8080/>**

### 方式 3：Node.js 静态服务器

任选其一：

```bash
# A. npx 一次性（推荐，无需全局安装）
npx http-server . -p 8080 -c-1

# B. live-server（带热刷新）
npx live-server --port=8080

# C. 安装 http-server 后使用
npm install -g http-server
http-server . -p 8080
```

然后浏览器访问： **<http://localhost:8080/>**

> Windows 用户也可以直接双击根目录的 **`serve.js`**（项目自带）+ 或运行 `init_npm.bat` 安装依赖。

---

## 🎬 录屏（可选）

录屏可生成 MP4 视频，需要 puppeteer：

```bash
# 1. 安装依赖（首次）
init_npm.bat          # Windows
# 或
npm install            # macOS / Linux

# 2. 开始录屏
record.bat            # Windows
# 或
node record.js         # macOS / Linux
```

输出文件位于 `output/` 目录。

---

## 📁 项目结构

```text
html-ppt-template/
├── index.html              # 播放器主入口（iframe 加载所有页面）
├── pages.json              # ⭐ 唯一的"内容源"，决定每一页讲什么
├── pages/                  # 16 页演示页面（已生成）
│   ├── Page1.html / Page1.css / Page1.js   ←  注意大小写
│   ├── page2.html / page2.css / page2.js
│   ├── ...
│   └── page16.html / page16.css / page16.js
├── styles/
│   └── index.css           # 播放器外壳样式
├── themes/
│   ├── tech.md
│   ├── dark-tech/          # 暗色科技风主题（娱乐向）
│   └── dark-tech-standard/ # ⭐ 当前使用 · 暗色科技风主题（专业向）
├── skills/
│   └── gen.md              # AI 生成页面的工作流说明
├── record.js               # Puppeteer 录屏脚本
├── record.bat              # 一键录屏（Windows）
├── init_npm.bat            # 安装 puppeteer 依赖
├── clear.bat               # 清理临时文件
└── serve.js                # Node.js 静态服务器（可选）
```

---

## 🎨 主题说明

当前所有 16 页均采用 **`dark-tech-standard`** 主题（专业向暗色科技）：

| 维度 | 取值 |
|------|------|
| 设计尺寸 | **960 × 720** |
| 主品牌色 | **#3b82f6** 钢蓝 |
| 辅色 | #6366f1 蓝紫 · #06b6d4 青 · #f59e0b 琥珀 · #10b981 翠绿 |
| 字体族 | Orbitron (display) + Inter (body) + JetBrains Mono (mono) |
| 圆角 | 2 / 4 / 8 / 12 px |
| 背景 | 3 层低饱和度 radial-gradient + 噪点纹理 + 毛玻璃 |

完整规范见 [`themes/dark-tech-standard/theme-dark-tech-standard.md`](themes/dark-tech-standard/theme-dark-tech-standard.md)。

---

## ⚙️ 如何配置播放顺序与时长

所有页面信息都集中在根目录的 **`pages.json`** 中，结构如下：

```json
{
  "summary": "整段口播全文（可读，不影响播放）",
  "pages": [
    {
      "index": 1,
      "pageName": "page1.html",
      "pageHtmlPath": "pages/page1.html",
      "duration": 7400,                          // ⭐ 该页停留毫秒数
      "summary": "本页口播摘要",
      "items": [                                 // ⭐ 时间轴分段，控制画面节奏
        { "index": 1, "content": "AA", "start": 0,     "end": 1766, "duration": 1766 },
        { "index": 2, "content": "BB", "start": 1900,  "end": 7400, "duration": 5500 }
      ]
    }
  ]
}
```

**字段说明：**

| 字段 | 用途 |
|---|---|
| `pageName` / `pageHtmlPath` | 页面文件名（含大小写），必须与 `pages/` 目录一致 |
| `duration` | 自动播放停留毫秒数（`index.html` 用来自动翻页） |
| `items` | 时间轴分段，每段对应一个画面元素触发时机 |
| `items[].start` | 该画面元素延迟多少毫秒后入场 |

> 修改 `pages.json` 后**刷新浏览器**即可生效，无需重启服务器。

---

## ➕ 如何新增页面

最简单的方式是 **修改 `pages.json` + 复制现有页面**：

1. 复制 `pages/page16.html`（含完整骨架、CDN、Tailwind 配置）为 `pages/page17.html`（同时复制 `.css` / `.js`）
2. 在 `pages.json` 的 `pages` 数组末尾追加新条目：
   ```json
   {
     "index": 17,
     "pageName": "page17.html",
     "pageHtmlPath": "pages/page17.html",
     "duration": 8000,
     "items": []
   }
   ```
3. 在新 HTML 中编写内容，引用 `./page17.css` 和 `./page17.js`
4. 浏览器刷新即可播放

---

## 🖱️ 交互说明

- **自动播放 / 暂停播放**：自动按 `pages.json` 的 `duration` 轮播
- **上一页 / 下一页**：手动切换
- **右下角控制按钮**（齿轮图标）：显示或隐藏操作区
- **底部进度条**：基于所有页面总停留时间展示总进度

---

## 🎯 Icon 库

项目默认使用 [Remix Icon](https://remixicon.com/) 在线图标库，适合做科技风信息展示。

```html
<!-- 在 <head> 中引入 -->
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />

<!-- 在内容中使用 -->
<i class="ri-rocket-2-line"></i>
<i class="ri-shield-check-line"></i>
<i class="ri-team-line"></i>
```

---

## ❓ 常见问题

**Q1：浏览器提示"无法加载 pages.json"？**
A：Chrome 等浏览器对 `file://` 协议下的 `fetch` 有跨域限制。请用方式 2 或方式 3 启动静态服务器。

**Q2：页面显示空白 / 字体不对？**
A：检查网络是否能访问 `cdn.jsdelivr.net`（用于 Tailwind、Remixicon、animate.css）。如果离线，可以替换为本地资源。

**Q3：怎么改主题色？**
A：编辑 `pages/pageN.html` 中的 `tailwind.config` 里的 `dts-accent / dts-cyan / dts-violet` 等值，全站统一改可用 `sed` 或 IDE 全局替换。

**Q4：录屏输出黑屏？**
A：确保 puppeteer 加载的是 `http://localhost:8080/`（而非 `file://`），并在 `record.js` 中给 iframe 留足加载时间。

---

## 📜 License

MIT · 随取随用