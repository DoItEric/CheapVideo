# DARK-TECH-STANDARD · 设计规范

> **专业级暗色科技主题** — 适用于商业产品发布 / 企业级技术方案 / 行业研究报告类 PPT 视频
>
> 本规范基于 `themes/dark-tech-standard/index.html` 提取，作为 **AI 生成 PPT 页面时的视觉约束源**
>
> 与 `dark-tech` 的关系：**同骨架（字体/尺寸/布局）不同气质** —— 同是暗色科技感，但本主题去除了娱乐化的鲜艳配色，色彩克制、克制再克制，更显商业专业气质

---

## 0. 速查卡片

| 维度 | 取值 |
|------|------|
| 设计尺寸 | **960 × 720**（4:3，iframe 标准） |
| 主体调性 | **专业暗色科技** · 深空黑蓝底 + 钢蓝/青/蓝紫 克制辅色 |
| 主品牌色 | **#3b82f6** 钢蓝（专业、可信、科技） |
| 辅色 | 蓝紫 #6366f1 · 青 #06b6d4 · 琥珀 #f59e0b · 翠绿 #10b981 |
| 字体族 | **Orbitron**（display）+ **Inter**（body）+ **JetBrains Mono**（mono） |
| 圆角档位 | 2 / 4 / 8 / 12 px |
| 特色 | 3 层低饱和度 radial-gradient + 毛玻璃 + 克制 glow + 蓝紫渐变文字 |

### 与 `dark-tech` 的核心差异

| 维度 | `dark-tech`（娱乐向） | `dark-tech-standard`（专业向） |
|------|----------------------|------------------------------|
| 主品牌色 | #e60012 暗红（强警示、刺激） | **#3b82f6 钢蓝**（专业、可信） |
| 紫 | #8b5cf6（高饱和） | **#6366f1 indigo**（沉稳） |
| 青 | #00e5ff（霓虹感） | **#06b6d4**（中明度） |
| 琥珀 | #ffb800（亮黄） | **#f59e0b**（标准琥珀） |
| 绿 | #10d97f（荧光） | **#10b981**（标准翠绿） |
| 背景渐变层 | 5 层（红+紫+青+琥珀+绿，热闹） | **3 层**（蓝+蓝紫+青，克制） |
| 渐变透明度 | 0.55 / 0.40 / 0.30 / 0.18 / 0.15 | **0.28 / 0.22 / 0.14**（全部降低） |
| 玻璃模糊 | blur(28px) saturate(160%) | **blur(20px) saturate(140%)** |
| Glow 强度 | 0.45-0.55 alpha + 22px 范围 | **0.35-0.40 alpha + 14-16px 范围** |
| 渐变文字 | 红→紫（刺激） | **蓝→蓝紫（专业）** |
| 标签文案 | HOT/NEW/BETA/PRO | **RELEASE/STABLE/ENTERPRISE/VERIFIED** |
| 顶栏图标 | `ri-vidicon-line` video-ready | **`ri-shield-check-line` professional** |
| 整体气质 | 炫酷、跳脱、互联网感 | **专业、克制、企业级** |

---

## 1. 设计尺寸与自适应

### 基础尺寸

- **设计画布：** 960 × 720（与 `index.html` 的 `DESIGN_W / DESIGN_H` 一致）
- **目标场景：** iframe 内加载，被父容器 `transform: scale()` 等比缩放
- **最终观看：** 手机端缩放后仍清晰（**所有字号放大约 1.6 倍**）

### 强制 CSS（每个页面必须）

```css
html, body {
  margin: 0;
  padding: 0;
  background: #0a0d14;
  color: #e8eaed;
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
- 不使用固定 `width: 960px; height: 720px;`
- 主内容用 `<main class="w-full h-full ...">` 撑满 body

---

## 2. 色板（Color Tokens）

**11 个语义色 token**，使用前缀 `dts-`（dark-tech-standard）以与 `dt-`（dark-tech）区分。

| Token | Hex | 用途 | 备注 |
|-------|-----|------|------|
| `dts-bg` | `#0a0d14` | 页面背景（深空黑蓝） | 比纯黑更有专业感 |
| `dts-surface` | `#131826` | 次级表面（卡片底） | 玻璃拟态内底色 |
| `dts-border` | `#232938` | 边框 / 分隔线 | 低饱和度蓝灰 |
| `dts-ink` | `#e8eaed` | 主文字（米白） | 高对比度主色 |
| `dts-mute` | `#9ca3af` | 次级文字 | 说明文字、辅助 |
| `dts-faint` | `#6b7280` | 弱化文字 | 角标、辅助标签 |
| `dts-accent` | `#3b82f6` | **主品牌蓝**（钢蓝） | 强调、CTA、关键数字 |
| `dts-glow` | `#60a5fa` | 蓝色 glow 变体 | 发光描边、悬停态 |
| `dts-cyan` | `#06b6d4` | 青色辅色 | 数据、链接、高亮 |
| `dts-violet` | `#6366f1` | 蓝紫辅色（indigo） | 渐变搭档、稳重感 |
| `dts-amber` | `#f59e0b` | 琥珀 | 警示、突出数字 |
| `dts-emerald` | `#10b981` | 翠绿 | 增长 / 正向指标 |

### Tailwind config 写法（必须保留）

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'dts-bg':      '#0a0d14',
        'dts-surface': '#131826',
        'dts-border':  '#232938',
        'dts-ink':     '#e8eaed',
        'dts-mute':    '#9ca3af',
        'dts-faint':   '#6b7280',
        'dts-accent':  '#3b82f6',
        'dts-glow':    '#60a5fa',
        'dts-cyan':    '#06b6d4',
        'dts-violet':  '#6366f1',
        'dts-amber':   '#f59e0b',
        'dts-emerald': '#10b981',
      },
    }
  }
}
```

### 配色使用规则

- **永远不要写硬编码 hex 值**（如 `bg-[#3b82f6]`），必须用 `dts-accent` 等 token
- **背景必须深色系**：body 是 `dts-bg`，卡片用 `glass` 类（不要用 `dts-surface` 直铺）
- **强调点最多用 1-2 种辅色**（如 `dts-accent` + `dts-cyan`），**强烈反对**多个高饱和色同框
- **避免使用纯红色**（娱乐感强），如需警示用 `dts-amber` 琥珀色

### 为什么选 #3b82f6 作为主品牌色

- **专业可信**：钢蓝是 Linear、Stripe、GitHub、Vercel 等专业产品的主流色
- **科技但不娱乐**：相比暗红 #e60012，蓝色不具攻击性，更适合 B 端/技术内容
- **平衡中性**：能与冷色（青/紫）和暖色（琥珀）都搭配，不会喧宾夺主

---

## 3. 字体系统（Typography）

### 字体族（与 dark-tech 一致）

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
<span class="font-mono text-[14px] text-dts-mute">DATA · 渐变大数字</span>
```

### 字体使用规则

- **大标题** 永远用 `font-display` + `font-black/700`
- **正文** 用 `font-body`（Inter，可读性最好）
- **数字 / 标签 / 副信息** 用 `font-mono`（JetBrains Mono，更有"数据感"）
- **大数字（关键数据）** 用 `font-display font-black` + 渐变文字（如 `class="grad-cv"`）

---

## 4. 间距（Spacing）

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

## 5. 圆角（Border Radius）

**4 档圆角**，统一使用（不要混用其他值）：

| 档位 | 写法 | 用途 |
|------|------|------|
| **2px** | `rounded-[2px]` | 像素级小元素、色块边角 |
| **4px** | `rounded` 或 `rounded-[4px]` | 标签、小按钮 |
| **8px** | `rounded-md` 或 `rounded-[8px]` | 卡片、输入框 |
| **12px** | `rounded-lg` 或 `rounded-[12px]` | 大卡片、主容器 |

**默认：** `<button>`、`<div class="glass">` 都用 `rounded-lg`（12px）

---

## 6. 发光（Glow）· 克制版

相比 `dark-tech`，本主题的 **glow 强度降低约 30%**，让整体气质更沉稳。

```css
.glow-blue   { box-shadow: 0 0 16px rgba(59, 130, 246, 0.40), 0 0 3px rgba(96, 165, 250, 0.6); }
.glow-cyan   { box-shadow: 0 0 14px rgba(6, 182, 212, 0.35), 0 0 3px rgba(6, 182, 212, 0.6); }
.glow-violet { box-shadow: 0 0 16px rgba(99, 102, 241, 0.35); }
```

**用法：**
```html
<!-- 蓝色发光按钮（主 CTA） -->
<button class="bg-dts-accent glow-blue ...">PRIMARY</button>

<!-- 青色发光小点 -->
<span class="w-3 h-3 rounded-full bg-dts-cyan glow-cyan"></span>

<!-- 紫色发光卡片 -->
<div class="bg-dts-violet glow-violet">...</div>
```

**规则：**
- ⚠️ **glow 严格限制使用**：仅用于主 CTA 按钮、状态指示器、关键数据点
- ❌ **不在普通背景元素上加 glow**（视觉过载会显得轻浮）
- ❌ **glow 不要堆叠**（同色 + 不同色不要同时出现）

---

## 7. 渐变（Gradient）· 蓝紫调

相比 `dark-tech` 的红紫渐变，本主题采用 **更克制的蓝-蓝紫-青** 渐变组合。

| 名称 | 写法 | 渐变方向 | 用途 |
|------|------|----------|------|
| `grad-bv` | 浅蓝 → 蓝紫 | `135deg, #60a5fa → #6366f1` | 主品牌色、封面大标题 |
| `grad-cv` | 青 → 蓝紫 | `135deg, #06b6d4 → #6366f1` | 数据大数字、科技感指标 |
| `grad-bc` | 蓝 → 青 | `135deg, #3b82f6 → #06b6d4` | 品牌渐变、稳定感 |

**CSS 定义（每个页面必加）：**
```css
.grad-bv {
  background: linear-gradient(135deg, #60a5fa 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.grad-cv {
  background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.grad-bc {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

**用法：**
```html
<h1 class="grad-bv font-display font-black">DARK-TECH</h1>
<div class="grad-cv font-display font-black text-[44px]">2,847</div>
```

**❌ 禁止使用**：`dark-tech` 主题的红紫渐变（`grad-rv`）和黄红渐变（`grad-av`），娱乐感太强。

---

## 8. 玻璃拟态（Glassmorphism）· 克制版

相比 `dark-tech` 的 0.42 透明 + 28px 模糊，本主题 **降低模糊强度、提高不透明度**，让玻璃更"实"。

```css
.glass {
  background: rgba(19, 24, 38, 0.55);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(232, 234, 237, 0.08);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.20);
}
```

**对比 dark-tech：**
- 背景透明度：0.42 → **0.55**（更不透明 → 更稳重）
- 模糊强度：28px → **20px**（更克制）
- 饱和度：160% → **140%**（更自然）
- 边框：10% 白 → **8% 白**（更含蓄）

**用法：所有卡片默认加 `glass`：**
```html
<div class="glass rounded-lg p-3 ...">
  <!-- 内容 -->
</div>
```

---

## 9. 背景系统 · 核心（克制版）

### 推荐方案：3 层低饱和度 CSS 渐变

相比 `dark-tech` 的 5 层多色渐变，本主题 **减为 3 层同色系渐变**，背景更安静。

```html
<!-- 背景层 -->
<div class="bg-gradient"></div>

<!-- 噪点纹理层（增强质感） -->
<div style="position:absolute; inset:0; pointer-events:none; opacity:0.25; mix-blend-mode:overlay; z-index:1;
     background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22/><feColorMatrix values=%220 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>');">
</div>
```

```css
.bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 20%, rgba(59,130,246,0.28) 0%, transparent 45%),
    radial-gradient(circle at 85% 80%, rgba(99,102,241,0.22) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, rgba(6,182,212,0.14) 0%, transparent 55%);
  animation: bg-flow 28s ease-in-out infinite alternate;
}
@keyframes bg-flow {
  0%   { background-position: 0% 0%, 100% 100%, 50% 50%; }
  33%  { background-position: 25% 25%, 75% 75%, 60% 40%; }
  66%  { background-position: 50% 50%, 50% 50%, 40% 60%; }
  100% { background-position: 70% 70%, 30% 30%, 30% 70%; }
}
```

**3 个渐变光晕的分布：**
- 蓝（15%, 20%）— 左上
- 蓝紫（85%, 80%）— 右下
- 青（50%, 50%）— 中心

**为什么减为 3 层：**
- 暗色科技感来自 **光晕的微妙存在**，而非 **多色堆砌**
- 3 层同色系（蓝/蓝紫/青）保证背景"有色彩感"但"不抢戏"
- 动画时长从 24s 拉长到 28s，让漂移更"安静"

---

## 10. 动效规范

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

### Typed.js（打字机效果 · 用于封面）

```html
<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
```

```html
<h1 id="typewriter"></h1>
<script>
  new Typed('#typewriter', {
    strings: ['企业级 AI 方案', '专业可信赖', '未来已来'],
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

## 11. 图标规范

使用 **Remixicon**（统一图标库）：

```html
<link href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css" rel="stylesheet" />
```

**用法：**
```html
<i class="ri-palette-fill text-dts-cyan"></i>
<i class="ri-font-size-2 text-dts-cyan"></i>
<i class="ri-layout-grid-fill text-dts-cyan"></i>
<i class="ri-shield-check-line text-dts-faint"></i>
```

**常用图标速查：**

| 类别 | 图标 class |
|------|------------|
| 色板 | `ri-palette-fill` |
| 字体 | `ri-font-size-2` |
| 布局 | `ri-layout-grid-fill` |
| 专业 | `ri-shield-check-line` |
| 箭头 | `ri-arrow-right-line` / `ri-arrow-left-line` |
| 数据 | `ri-bar-chart-line` / `ri-line-chart-line` |
| 企业 | `ri-building-line` / `ri-government-line` |
| 关闭 | `ri-close-line` |
| 设置 | `ri-equalizer-2-line` |

**规则：** 图标颜色统一用 `text-dts-cyan` 或 `text-dts-faint`，字号统一 `text-base` (16px)

---

## 12. 适用场景速查

| ✅ 推荐使用本主题 | ❌ 不推荐使用本主题 |
|------------------|-------------------|
| 企业级产品发布会 PPT | 个人 Vlog / 娱乐向短视频 |
| B 端 SaaS 产品介绍 | 潮流文化 / 街头风内容 |
| 行业研究报告 / 白皮书 | 游戏 / 电竞解说 |
| 技术架构讲解 | 节日活动 / 促销海报 |
| 商业路演 / 融资 PPT | 二次元 / ACG 内容 |
| 咨询公司 Case Study | K12 教育 / 启蒙内容 |

**一句话总结：** 当你需要"看起来像 Linear / Vercel / GitHub 那种专业产品"时，用本主题。