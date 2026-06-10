# HTML PPT Template

这是一个纯静态的 HTML PPT 模板项目，用于让用户和 AI 快速生成可播放、可扩展动画的演示页面。

## 项目结构

```text
html-ppt
  |- index.html
  |- styles/
      |- ppt.css
  |- pages/
  |- templates/
```

## 快速开始

直接在浏览器打开 `index.html` 即可运行。

## 如何新增页面

1. 复制 `templates/` 中合适的模板，例如 `title_content.html`。
2. 在 `pages/` 下创建新页面（例如 `page4.html`），按“页眉 / 内容 / 页脚”三段结构编写。
3. 如果页面需要图表或 3D 动画，可直接在页面内引入 ECharts / Three.js 的 CDN 并初始化。

## 如何修改样式

1. 统一样式文件是 `styles/ppt.css`，主框架和页面内部样式都在这一个文件中。
2. `index.html` 固定引用 `./styles/ppt.css`，`pages/` 和 `templates/` 固定引用 `../styles/ppt.css`。
3. 需要调整视觉风格时，直接编辑 `styles/ppt.css` 即可，不再使用主题目录和 URL 参数。

## 如何配置播放顺序

在 `index.html` 中修改 `pages` 数组即可：

```js
const pages = [
  { src: "./pages/page1.html", duration: 4200, transition: "slide" },
  { src: "./pages/page2.html", duration: 4800, transition: "glitch" },
  { src: "./pages/page3.html", duration: 5200, transition: "canvas-pull" }
];
```

字段说明：

- `src`：页面路径
- `duration`：该页自动播放停留时长（毫秒）
- `transition`：切换效果（`slide` / `flip` / `glitch` / `canvas-pull`）

## Icon 库使用（推荐）

项目已默认使用 [Remix Icon](https://remixicon.com/) 在线库，适合做科技风信息展示。

在页面 `<head>` 中引入：

```html
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />
```

在内容中使用：

```html
<i class="ri-rocket-2-line"></i>
<i class="ri-cpu-line"></i>
<i class="ri-bubble-chart-line"></i>
```

## 交互说明

- `上一页`、`下一页`：手动切换页面
- `自动播放 / 暂停播放`：自动轮播控制
- 右下角 `控制` 按钮：显示或隐藏操作区
- 底部进度条：基于页面顺序和停留时间展示总进度
