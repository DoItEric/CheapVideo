# DARK-TECH · 设计规范

> **暗色科技感主题** — 适用于炫酷的互联网项目介绍 / 行业洞察 / 未来概念类 PPT 视频
>
> 本规范基于 `themes/dark-tech/index.html` 提取，作为 **AI 生成 PPT 页面时的视觉约束源**
>
> 与项目技术栈完全兼容：Tailwind + animate.css + transition.css + Typed.js + Vanta.js（不强制使用 Vanta）

---

## 0. 速查卡片

| 维度 | 取值 |
|------|------|
| 设计尺寸 | **960 × 720**（4:3，iframe 标准） |
| 主体调性 | **暗色科技** · 深空黑底 + 多色 glow 高光 |
| 主品牌色 | **#e60012** 暗红（沿用项目 `ed-accent`） |
| 辅色 | 紫 #8b5cf6 · 青 #00e5ff · 琥珀 #ffb800 · 翠绿 #10d97f |
| 字体族 | **Orbitron**（display）+ **Inter**（body）+ **JetBrains Mono**（mono） |
| 圆角档位 | 2 / 4 / 8 / 12 px |
| 特色 | 渐变毛玻璃背景 + 多层 radial-gradient 缓慢漂移 + 高斯噪点 |

---

## 1. 设计定位与适用场景

**适用：**
- AI / 算力 / GPU / 数据类产品介绍
- 行业洞察 / 趋势预测类报告
- 科技感品牌发布会
- 任何想"炫酷直白"的视频 PPT

**不适用：**
- 商务严肃报告（建议另起 `themes/corporate/` 主题）
- 教育 / 课件（字号偏大、装饰偏多，不适合长时阅读）

---

## 2. 设计尺寸与自适应

### 基础尺寸

- **设计画布：** 960 × 720（与 `index.html` 的 `DESIGN_W / DESIGN_H` 一致）
- **目标场景：** iframe 内加载，被父容器 `transform: scale()` 等比缩放
- **最终观看：** 手机端缩放后仍清晰（**所有字号放大约 1.6 倍**）

### 强制 CSS（每个页面必须）

```css
html, body {
  margin: 0;
  padding: 0;
  background: #05050a;
  color: #f5f5f7;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
}
html { width: 100%; height: 100%; }
body {
  width: 100%;
  height: 100%;
  position: relative;
}
```

**关键点：**
- body 用 `width: 100%; height: 100%;` 完全占满视口
- 不使用固定 `width: 960px; height: 720px;`（那样直接打开会有空白边）
- 主内容用 `<main class="w-full h-full ...">` 撑满 body

---

## 3. 色板（Color Tokens）

**11 个语义色 token**，已写入 Tailwind config，使用前缀 `dt-`（dark-tech）：

| Token | Hex | 用途 | 备注 |
|-------|-----|------|------|
| `dt-bg` | `#05050a` | 页面背景（深空黑） | 最暗，仅作底层 |
| `dt-surface` | `#0e0e16` | 次级表面（卡片底） | 玻璃拟态内底色 |
| `dt-border` | `#1f1f2e` | 边框 / 分隔线 | 低饱和度灰紫 |
| `dt-ink` | `#f5f5f7` | 主文字（米白） | 高对比度主色 |
| `dt-mute` | `#8a8a9a` | 次级文字 | 说明文字、辅助 |
| `dt-faint` | `#5a5a6a` | 弱化文字 | 角标、辅助标签 |
| `dt-accent` | `#e60012` | **主品牌红**（沿用 `ed-accent`） | 强调、CTA、关键数字 |
| `dt-glow` | `#ff2d4a` | 红色 glow 变体 | 发光描边、悬停态 |
| `dt-cyan` | `#00e5ff` | 青色辅色 | 数据、链接、高亮 |
| `dt-violet` | `#8b5cf6` | 紫色辅色 | 渐变搭档、未来感 |
| `dt-amber` | `#ffb800` | 琥珀 | 警示、突出数字 |
| `dt-emerald` | `#10d97f` | 翠绿 | 增长 / 正向指标 |

### Tailwind config 写法（必须保留）

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'dt-bg':      '#05050a',
        'dt-surface': '#0e0e16',
        'dt-border':  '#1f1f2e',
        'dt-ink':     '#f5f5f7',
        'dt-mute':    '#8a8a9a',
        'dt-faint':   '#5a5a6a',
        'dt-accent':  '#e60012',
        'dt-glow':    '#ff2d4a',
        'dt-cyan':    '#00e5ff',
        'dt-violet':  '#8b5cf6',
        'dt-amber':   '#ffb800',
        'dt-emerald': '#10d97f',
      },
    }
  }
}
```

### 配色使用规则

- **永远不要写硬编码 hex 值**（如 `bg-[#e60012]`），必须用 `dt-accent` 等 token
- **背景必须深色系**：body 是 `dt-bg`，卡片用 `glass` 类（不要用 `dt-surface` 直铺）
- **强调点最多用 1-2 种高饱和色**（如 `dt-accent` + `dt-cyan`），不要堆砌

---

## 4. 字体系统（Typography）

### 3 字体族（Tailwind 已配置）

| 用途 | Token | 字体栈 | 字重 |
|------|-------|--------|------|
| 标题 / 大数字 | `font-display` | Orbitron | 500/700/800/900 |
| 正文 / UI | `font-body` | Inter | 400/500/600/700 |
| 数字 / 标签 / 代码 | `font-mono` | JetBrains Mono | 400/500/700 |

**Google Fonts 引入（必加）：**
```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
```

### 字号阶梯（5 阶 · 已放大 1.6×）

| 级别 | 字号 | Tailwind / inline style | 用途 |
|------|------|-------------------------|------|
| display | **44px** | `font-display font-black text-[44px]` | 封面大标题、关键数字 |
| h1 | **30px** | `font-display font-bold text-[30px]` | 页内主标题、卡片标题 |
| h2 | **24px** | `font-display font-bold text-[24px]` | 二级标题、分区标题 |
| body | **18px** | `font-body text-[18px]` | 正文段落、说明 |
| caption | **14px** | `font-mono text-[14px]` | 辅助标签、注释 |

**为什么放大 1.6 倍：** 父容器 `transform: scale()` 在手机端会把页面缩到 0.4-0.5 倍。原 13px 标签会变成 5-6px 物理像素，太小看不清。放大后 body 18px 在手机端仍有 7-9px 物理像素，**保证最小可读性**。

### 字号阶梯示例

```html
<!-- display：封面 -->
<h1 class="font-display font-black text-[64px] leading-none">DARK-TECH</h1>

<!-- h1：页内主标题 -->
<h2 class="font-display font-bold text-[30px]">核心论点</h2>

<!-- h2：分区 -->
<h3 class="font-display font-bold text-[24px]">数据洞察</h3>

<!-- body：正文 -->
<p class="font-body text-[18px]">...</p>

<!-- caption：标签 -->
<span class="font-mono text-[14px] text-dt-mute">DATA · 渐变大数字</span>
```

### 字体使用规则

- **大标题** 永远用 `font-display` + `font-black/700`
- **正文** 用 `font-body`（Inter，可读性最好）
- **数字 / 标签 / 副信息** 用 `font-mono`（JetBrains Mono，更有"数据感"）
- **大数字（关键数据）** 用 `font-display font-black` + 渐变文字（如 `class="grad-cv"`）

---

## 5. 间距（Spacing）

基于 Tailwind 默认的 4px 基准网格。本主题高频使用的间距档位：

| 场景 | Tailwind class | 像素 |
|------|----------------|------|
| 卡片内 padding | `p-3` / `p-2.5` | 12 / 10px |
| Section 内 padding | `p-5` | 20px |
| 卡片之间 gap | `gap-2` / `gap-2.5` | 8 / 10px |
| 区块之间 gap | `gap-3` | 12px |
| 分隔线 | `h-px` / `border-t` | 1px |

**规则：** 内容紧凑优先，避免大面积空白（视频场景切换快，元素密度要高）

---

## 6. 圆角（Border Radius）

**4 档圆角**，统一使用（不要混用其他值）：

| 档位 | 写法 | 用途 |
|------|------|------|
| **2px** | `rounded-[2px]` | 像素级小元素、色块边角 |
| **4px** | `rounded` 或 `rounded-[4px]` | 标签、小按钮 |
| **8px** | `rounded-md` 或 `rounded-[8px]` | 卡片、输入框 |
| **12px** | `rounded-lg` 或 `rounded-[12px]` | 大卡片、主容器 |

**默认：** `<button>`、`<div class="glass">` 都用 `rounded-lg`（12px）

---

## 7. 发光（Glow）· 关键特色

**3 种 glow 阴影**，让元素呈现"科技发光"质感：

```css
.glow-red    { box-shadow: 0 0 22px rgba(230, 0, 18, 0.55), 0 0 4px rgba(255, 45, 74, 0.7); }
.glow-cyan   { box-shadow: 0 0 20px rgba(0, 229, 255, 0.45), 0 0 4px rgba(0, 229, 255, 0.7); }
.glow-violet { box-shadow: 0 0 22px rgba(139, 92, 246, 0.50); }
```

**用法：**
```html
<!-- 红色发光按钮 -->
<button class="bg-dt-accent glow-red ...">PRIMARY</button>

<!-- 青色发光小点 -->
<span class="w-3 h-3 rounded-full bg-dt-cyan glow-cyan"></span>

<!-- 紫色发光卡片 -->
<div class="bg-dt-violet glow-violet">...</div>
```

**规则：**
- 关键 CTA、状态指示器、数据点 — 必须加 glow
- 普通背景元素不加 glow（避免视觉过载）
- glow 不要堆叠（同色 + 不同色不要同时出现）

---

## 8. 渐变（Gradient）

**3 种渐变文字效果**（用 `background-clip: text`）：

| 名称 | 写法 | 渐变方向 | 用途 |
|------|------|----------|------|
| `grad-rv` | 红 → 紫 | `135deg, #ff2d4a → #8b5cf6` | 主品牌色、封面大标题 |
| `grad-cv` | 青 → 紫 | `135deg, #00e5ff → #8b5cf6` | 数据大数字、科技感指标 |
| `grad-av` | 琥珀 → 红 | `135deg, #ffb800 → #ff2d4a` | 警示、强调数据 |

**CSS 定义（每个页面必加）：**
```css
.grad-rv {
  background: linear-gradient(135deg, #ff2d4a 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.grad-cv {
  background: linear-gradient(135deg, #00e5ff 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.grad-av {
  background: linear-gradient(135deg, #ffb800 0%, #ff2d4a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

**用法：**
```html
<h1 class="grad-rv font-display font-black">DARK-TECH</h1>
<div class="grad-cv font-display font-black text-[44px]">2,847</div>
```

---

## 9. 玻璃拟态（Glassmorphism）· 关键特色

**`.glass` class** — 所有前景卡片都用这个：

```css
.glass {
  background: rgba(14, 14, 22, 0.42);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(245, 245, 7, 0.10);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
}
```

**为什么是关键特色：**
- `backdrop-filter: blur(28px)` — 让背后的渐变光晕被模糊成柔和光斑
- `saturate(160%)` — 增加色彩饱和度，让模糊后仍有色彩
- 半透明背景（0.42）— 让背景渐变能透出来
- 边框（10% 白）— 提供柔和的"玻璃边缘"轮廓

**用法：所有卡片默认加 `glass`：**
```html
<div class="glass rounded-lg p-3 ...">
  <!-- 内容 -->
</div>
```

**变体：**
- 加强版：`bg-dt-accent/20` + `glow-red` 做出"红色发光卡片"
- 边框强调：`border-2 border-dt-cyan` 做出"描边卡片"

---

## 10. 背景系统 · 核心

### 推荐方案：CSS 渐变毛玻璃（强烈推荐）

**多层 radial-gradient + 缓慢 keyframes 动画**：

```html
<!-- 背景层 -->
<div class="bg-gradient"></div>

<!-- 噪点纹理层（增强质感） -->
<div style="position:absolute; inset:0; pointer-events:none; opacity:0.35; mix-blend-mode:overlay; z-index:1;
     background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/><feColorMatrix values=%220 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');">
</div>
```

```css
.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 18%, rgba(139,92,246,0.55) 0%, transparent 42%),
    radial-gradient(circle at 88% 82%, rgba(0,229,255,0.40) 0%, transparent 42%),
    radial-gradient(circle at 50% 50%, rgba(230,0,18,0.30) 0%, transparent 55%),
    radial-gradient(circle at 30% 75%, rgba(255,184,0,0.18) 0%, transparent 45%),
    radial-gradient(circle at 75% 25%, rgba(16,217,127,0.15) 0%, transparent 45%);
  animation: bg-flow 24s ease-in-out infinite alternate;
}
@keyframes bg-flow {
  0%   { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%, 100% 0%; }
  33%  { background-position: 25% 25%, 75% 75%, 60% 40%, 20% 80%, 80% 20%; }
  66%  { background-position: 50% 50%, 50% 50%, 40% 60%, 40% 60%, 60% 40%; }
  100% { background-position: 70% 70%, 30% 30%, 30% 70%, 60% 40%, 40% 60%; }
}
```

**5 个渐变光晕的分布：**
- 紫（12%, 18%）— 左上
- 青（88%, 82%）— 右下
- 红（50%, 50%）— 中心
- 琥珀（30%, 75%）— 左下
- 翠绿（75%, 25%）— 右上

**为什么推荐 CSS 渐变（不用 Vanta）：**
- Vanta fog：雾气弥漫，**诡异**
- Vanta net：粒子网络线条，**太乱**
- Vanta waves / clouds：与本主题调性不匹配
- **CSS radial-gradient：完全可控、零依赖、缓慢漂移有"呼吸感"**

### 备选方案：Vanta（如果客户特殊要求）

如果一定要用 Vanta，使用 **`vanta.halo`**（光晕聚焦感）或 **`vanta.dots`**（圆点粒子），并降低强度：

```javascript
VANTA.HALO({
  el: "#vanta-bg",
  mouseControls: false, touchControls: false, gyroControls: false,
  minHeight: 720, minWidth: 960,
  baseColor: 0x05050a,
  backgroundColor: 0x05050a,
  color1: 0x8b5cf6,  // 紫
  color2: 0x00e5ff,  // 青
  amplitudeFactor: 0.8,
  sizeFactor: 0.6,
});
```

---

## 11. 布局规范（弹性化 · 关键）

### 必须使用的布局类

每个 PPT 页面必须遵循的弹性布局模式：

```html
<main class="relative z-10 w-full h-full p-5 flex flex-col gap-3 min-h-0">

  <!-- 顶部 header（不压缩） -->
  <header class="shrink-0">...</header>

  <!-- 主体（占满剩余空间） -->
  <div class="grid grid-cols-12 gap-3 flex-1 min-h-0">
    <section class="col-span-X flex flex-col min-h-0 min-w-0">...</section>
  </div>

  <!-- 底部 footer（不压缩） -->
  <footer class="shrink-0">...</footer>
</main>
```

### 关键 Tailwind 类（必须理解）

| 类 | 含义 | 使用场景 |
|----|------|----------|
| `flex-1` | 占满父容器剩余空间 | 主区域 |
| `shrink-0` | 不被压缩（固定尺寸） | 标题、footer、关键标签 |
| `min-h-0` | 允许收缩到 0 | flex/grid 子项，必须配合 `flex-1` |
| `min-w-0` | 允许收缩到 0 | 防止 flex/grid 子项内容溢出 |
| `flex flex-col` | 垂直弹性 | 所有 section 默认 |
| `grid grid-cols-12` | 12 列网格 | 主体布局 |
| `gap-3` | 12px 间距 | section 之间 |

### 三列并排模板（最常用）

```html
<div class="grid grid-cols-12 gap-3 flex-1 min-h-0">
  <!-- 色板 / 主内容：5 列宽 -->
  <section class="col-span-5 flex flex-col min-h-0 min-w-0">...</section>

  <!-- 字体 / 次内容：4 列宽 -->
  <section class="col-span-4 flex flex-col min-h-0 min-w-0">...</section>

  <!-- 组件 / 边栏：3 列宽 -->
  <section class="col-span-3 flex flex-col min-h-0 min-w-0">...</section>
</div>
```

### ❌ 禁止事项

- ❌ 固定高度 `h-[500px]` 等（应该用 `flex-1`）
- ❌ 固定宽度 `w-[800px]` 等（应该用 `flex-1` 或 `col-span-X`）
- ❌ `overflow: hidden` 在外层（会导致动画/动效被裁剪）
- ❌ 忘记 `min-h-0`（grid/flex 子项默认 `min-height: auto`，可能撑爆布局）

---

## 12. 动效规范

### animate.css 使用规则

```html
<!-- 引入 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />
```

**常用入场动画（适配本主题）：**

| 效果 | class | 延迟辅助 |
|------|-------|----------|
| 从下淡入 | `animate__fadeInUp` | `animate__delay-0.5s` |
| 缩放弹出 | `animate__zoomIn` | `animate__delay-0.4s` |
| 从上淡入 | `animate__fadeInDown` | 无 |
| 从左滑入 | `animate__slideInLeft` | `animate__delay-1s` |

**组合用法：**
```html
<header class="animate__animated animate__fadeInDown">...</header>
<section class="animate__animated animate__fadeInUp animate__delay-0.4s">...</section>
<footer class="animate__animated animate__fadeInUp animate__delay-1s">...</footer>
```

### 顺序建议

1. 顶部 header：`fadeInDown`（无延迟）
2. 主体内容：`fadeInUp` + `delay-0.4s`
3. 底部 footer：`fadeInUp` + `delay-1s`

**总入场时间控制在 1.5s 内**，避免拖沓。

### transition.css（页面级转场）

如果需要"几何展开"或"擦除"等高级转场效果（iframe 之间切换时）：

```html
<link rel="stylesheet" href="https://unpkg.com/transition-style" />
```

```html
<div transition-style="in:circle:center">...</div>
<div transition-style="in:wipe:up">...</div>
```

**注意：** transition.css 主要用于 **页面级转场**（整个页面翻转），不要滥用在小元素上（会导致视觉疲劳）。

### Typed.js（打字机效果 · 用于封面）

```html
<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
```

```html
<h1 id="typewriter"></h1>
<script>
  new Typed('#typewriter', {
    strings: ['算力租赁', '英伟达 GPU', '未来已来'],
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 2000,
    startDelay: 500,
    loop: false,
    cursorChar: '|',
    showCursor: true,
  });
</script>
```

### ❌ 动效禁止事项

- ❌ `animate__pulse animate__infinite` 等无限循环动画（视频录制会出现"闪烁"伪影）
- ❌ 同页面同时使用超过 3 种不同动画（视觉过载）
- ❌ 动画时长超过 1.5s（拖沓）
- ❌ 在 `body` 上加 transform 动画（影响布局）

---

## 13. 图标规范

使用 **Remixicon**（统一图标库）：

```html
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />
```

**用法：**
```html
<i class="ri-palette-fill text-dt-cyan"></i>
<i class="ri-font-size-2 text-dt-cyan"></i>
<i class="ri-layout-grid-fill text-dt-cyan"></i>
<i class="ri-vidicon-line text-dt-faint"></i>
```

**常用图标速查：**

| 类别 | 图标 class |
|------|------------|
| 色板 | `ri-palette-fill` |
| 字体 | `ri-font-size-2` |
| 布局 | `ri-layout-grid-fill` |
| 视频 | `ri-vidicon-line` |
| 箭头 | `ri-arrow-right-line` / `ri-arrow-left-line` |
| 数据 | `ri-bar-chart-line` / `ri-line-chart-line` |
| 关闭 | `ri-close-line` |
| 设置 | `ri-equalizer-2-line` |

**规则：** 图标颜色统一用 `text-dt-cyan` 或 `text-dt-faint`，字号统一 `text-base` (16px)

---

## 14. 最小页面模板（可直接拷贝）

完整可运行的最小模板，所有约束都已包含：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PAGE · dark-tech</title>

  <!-- 字体 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />

  <!-- Tailwind + dt-* token -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: {
        'dt-bg':'#05050a','dt-surface':'#0e0e16','dt-border':'#1f1f2e',
        'dt-ink':'#f5f5f7','dt-mute':'#8a8a9a','dt-faint':'#5a5a6a',
        'dt-accent':'#e60012','dt-glow':'#ff2d4a','dt-cyan':'#00e5ff',
        'dt-violet':'#8b5cf6','dt-amber':'#ffb800','dt-emerald':'#10d97f',
      }, fontFamily: {
        display:['Orbitron','sans-serif'], body:['Inter','sans-serif'], mono:['JetBrains Mono','monospace'],
      }}}
    }
  </script>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />

  <style>
    html, body { margin:0; padding:0; background:#05050a; color:#f5f5f7; font-family:'Inter',sans-serif; overflow:hidden; }
    html { width:100%; height:100%; }
    body { width:100%; height:100%; position:relative; }
    .bg-gradient {
      position:absolute; inset:0;
      background:
        radial-gradient(circle at 12% 18%, rgba(139,92,246,0.55) 0%, transparent 42%),
        radial-gradient(circle at 88% 82%, rgba(0,229,255,0.40) 0%, transparent 42%),
        radial-gradient(circle at 50% 50%, rgba(230,0,18,0.30) 0%, transparent 55%),
        radial-gradient(circle at 30% 75%, rgba(255,184,0,0.18) 0%, transparent 45%),
        radial-gradient(circle at 75% 25%, rgba(16,217,127,0.15) 0%, transparent 45%);
      animation: bg-flow 24s ease-in-out infinite alternate;
    }
    @keyframes bg-flow {
      0%   { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%, 100% 0%; }
      33%  { background-position: 25% 25%, 75% 75%, 60% 40%, 20% 80%, 80% 20%; }
      66%  { background-position: 50% 50%, 50% 50%, 40% 60%, 40% 60%, 60% 40%; }
      100% { background-position: 70% 70%, 30% 30%, 30% 70%, 60% 40%, 40% 60%; }
    }
    .glass {
      background: rgba(14, 14, 22, 0.42);
      backdrop-filter: blur(28px) saturate(160%);
      -webkit-backdrop-filter: blur(28px) saturate(160%);
      border: 1px solid rgba(245, 245, 247, 0.10);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
    }
    .glow-red    { box-shadow: 0 0 22px rgba(230,0,18,0.55), 0 0 4px rgba(255,45,74,0.7); }
    .glow-cyan   { box-shadow: 0 0 20px rgba(0,229,255,0.45), 0 0 4px rgba(0,229,255,0.7); }
    .glow-violet { box-shadow: 0 0 22px rgba(139,92,246,0.50); }
    .grad-rv { background: linear-gradient(135deg,#ff2d4a 0%,#8b5cf6 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .grad-cv { background: linear-gradient(135deg,#00e5ff 0%,#8b5cf6 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
  </style>
</head>
<body>
  <!-- 背景层 -->
  <div class="bg-gradient"></div>
  <!-- 噪点 -->
  <div style="position:absolute;inset:0;pointer-events:none;opacity:0.35;mix-blend-mode:overlay;z-index:1;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");"></div>

  <!-- 主内容 -->
  <main class="relative z-10 w-full h-full p-5 flex flex-col gap-3 min-h-0">

    <!-- 顶部 header -->
    <header class="shrink-0">
      <h1 class="font-display font-black text-[64px] leading-none">
        <span class="grad-rv">PAGE TITLE</span>
      </h1>
    </header>

    <!-- 主体三列 -->
    <div class="grid grid-cols-12 gap-3 flex-1 min-h-0">
      <section class="col-span-5 glass rounded-lg p-3">左</section>
      <section class="col-span-4 glass rounded-lg p-3">中</section>
      <section class="col-span-3 glass rounded-lg p-3">右</section>
    </div>

    <!-- 底部 footer -->
    <footer class="shrink-0 text-dt-faint text-[14px]">© DARK-TECH</footer>
  </main>
</body>
</html>
```

---

## 15. 给 AI 的硬性约束清单（生成页面时必须遵守）

### ✅ 必须做

1. ✅ 使用 Tailwind `dt-*` 颜色 token，**不要写硬编码 hex**
2. ✅ body 用 `width:100%; height:100%;`，**不要写固定 960×720**
3. ✅ 主内容用弹性布局：`flex-1 min-h-0`，**不要写固定 height**
4. ✅ 字号放大约 1.6 倍（display 44 / h1 30 / h2 24 / body 18 / cap 14）
5. ✅ 关键卡片用 `glass` 类（毛玻璃）
6. ✅ 关键 CTA / 状态指示器加 `glow-red` / `glow-cyan` / `glow-violet`
7. ✅ 关键大数字 / 主标题用 `grad-rv` / `grad-cv` 渐变文字
8. ✅ 背景用 `.bg-gradient`（CSS 渐变 + keyframes），**不用 Vanta**
9. ✅ 字体族：标题用 `font-display`，正文用 `font-body`，数字 / 标签用 `font-mono`
10. ✅ 动效用 `animate.css`，总入场时间 < 1.5s

### ❌ 禁止做

1. ❌ 不用 Vanta fog / net（雾感和粒子线太乱）
2. ❌ 不在元素上用 `overflow:hidden` 在外层
3. ❌ 不用 `animate__pulse infinite` 等无限循环动画
4. ❌ 不用 4 档圆角外的其他圆角值（如 6px / 10px）
5. ❌ 不用 `dt-*` token 之外的颜色
6. ❌ 不用衬线字体（serif），全部 sans-serif
7. ❌ 不在 body 上用 transform 动画
8. ❌ 不堆砌超过 3 种不同动画效果
9. ❌ 不留大块空白（视频场景节奏要快）
10. ❌ 文字不要直接用纯白（`#ffffff`），必须用 `dt-ink`（`#f5f5f7` 微暖白）

---

## 16. 速查：完整 HTML 模板头部

每次生成新页面时，**复制这段作为 `<head>` 的基础**：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>...</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />

  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: {
        'dt-bg':'#05050a','dt-surface':'#0e0e16','dt-border':'#1f1f2e',
        'dt-ink':'#f5f5f7','dt-mute':'#8a8a9a','dt-faint':'#5a5a6a',
        'dt-accent':'#e60012','dt-glow':'#ff2d4a','dt-cyan':'#00e5ff',
        'dt-violet':'#8b5cf6','dt-amber':'#ffb800','dt-emerald':'#10d97f',
      }, fontFamily: {
        display:['Orbitron','sans-serif'], body:['Inter','sans-serif'], mono:['JetBrains Mono','monospace'],
      }}}
    }
  </script>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />

  <style>
    html, body { margin:0; padding:0; background:#05050a; color:#f5f5f7; font-family:'Inter',sans-serif; overflow:hidden; }
    html { width:100%; height:100%; }
    body { width:100%; height:100%; position:relative; }
    /* 背景渐变（必加） */
    .bg-gradient {
      position:absolute; inset:0;
      background:
        radial-gradient(circle at 12% 18%, rgba(139,92,246,0.55) 0%, transparent 42%),
        radial-gradient(circle at 88% 82%, rgba(0,229,255,0.40) 0%, transparent 42%),
        radial-gradient(circle at 50% 50%, rgba(230,0,18,0.30) 0%, transparent 55%),
        radial-gradient(circle at 30% 75%, rgba(255,184,0,0.18) 0%, transparent 45%),
        radial-gradient(circle at 75% 25%, rgba(16,217,127,0.15) 0%, transparent 45%);
      animation: bg-flow 24s ease-in-out infinite alternate;
    }
    @keyframes bg-flow {
      0%   { background-position: 0% 0%, 100% 100%, 50% 50%, 0% 100%, 100% 0%; }
      33%  { background-position: 25% 25%, 75% 75%, 60% 40%, 20% 80%, 80% 20%; }
      66%  { background-position: 50% 50%, 50% 50%, 40% 60%, 40% 60%, 60% 40%; }
      100% { background-position: 70% 70%, 30% 30%, 30% 70%, 60% 40%, 40% 60%; }
    }
    /* 玻璃拟态（必加） */
    .glass {
      background: rgba(14, 14, 22, 0.42);
      backdrop-filter: blur(28px) saturate(160%);
      -webkit-backdrop-filter: blur(28px) saturate(160%);
      border: 1px solid rgba(245, 245, 247, 0.10);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
    }
    /* 发光（按需使用） */
    .glow-red    { box-shadow: 0 0 22px rgba(230,0,18,0.55), 0 0 4px rgba(255,45,74,0.7); }
    .glow-cyan   { box-shadow: 0 0 20px rgba(0,229,255,0.45), 0 0 4px rgba(0,229,255,0.7); }
    .glow-violet { box-shadow: 0 0 22px rgba(139,92,246,0.50); }
    /* 渐变文字（按需使用） */
    .grad-rv { background:linear-gradient(135deg,#ff2d4a 0%,#8b5cf6 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .grad-cv { background:linear-gradient(135deg,#00e5ff 0%,#8b5cf6 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .grad-av { background:linear-gradient(135deg,#ffb800 0%,#ff2d4a 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
  </style>
</head>
```

---

## 17. 与项目其他文档的关系

| 文档 | 关系 |
|------|------|
| `req.md` | 项目需求总纲（HTML PPT 模板约束） |
| `videoppt.md` | 视频 PPT 内容生成规则 |
| `skills/tech.md` | **技术栈选型**（Tailwind / animate.css / Vanta.js 等库的使用） |
| `skills/page-generation.md` | **页面生成规则**（每页结构、内容组织） |
| `themes/dark-tech/index.html` | **设计规范可视化**（本主题的视觉参考） |
| `themes/dark-tech/theme-dark-tech.md` | **本文件：设计规范文档**（AI 生成的硬性约束源） |

---

## 附录：与原始项目的 token 对照

| 原 `ed-*` token | 本主题 `dt-*` token | 说明 |
|-----------------|---------------------|------|
| `ed-bg` (`#f5f2ed`) | `dt-bg` (`#05050a`) | 背景翻转：米白 → 深空黑 |
| `ed-ink` (`#1a1a1a`) | `dt-ink` (`#f5f5f7`) | 文字翻转：黑 → 米白 |
| `ed-accent` (`#e60012`) | `dt-accent` (`#e60012`) | **品牌红保持一致** |
| — | 新增 `dt-cyan` / `dt-violet` / `dt-amber` / `dt-emerald` | 科技感辅色（4 色） |
| — | 新增 `dt-glow` (`#ff2d4a`) | 红色 glow 变体 |
| `font-serif` | 删除 | 暗色科技感不用衬线 |

**结论：** 沿用 `ed-accent` 作为品牌色锚点，整体配色从米白底转向深空黑底，扩展出 4 色科技辅色系。