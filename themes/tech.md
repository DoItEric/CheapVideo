# HTML-PPT 技术栈选型说明

> 本文档用于指导 AI 在生成 HTML-PPT 页面时，正确选择和使用样式/动画库。
>
> 项目约束：**纯静态 HTML**、**iframe 独立加载**（960×720）、**视频录制场景**。

---

## 1. Tailwind CSS — 原子化布局与排版骨架

**CDN 引入：**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'ed-bg': '#f5f2ed',
          'ed-ink': '#1a1a1a',
          'ed-accent': '#e60012',
        },
        fontFamily: {
          'serif': ['Georgia', 'Playfair Display', 'serif'],
        }
      }
    }
  }
</script>
```

**在项目中的作用：**
- 负责**页面的整体布局骨架**：flex、grid、absolute 定位、宽高控制
- 负责**排版系统**：字号阶梯（`text-xs` → `text-9xl`）、字重、行高、字间距
- 负责**间距系统**：padding/margin 的 4px 基准网格（`p-4`、`gap-6`）
- 负责**响应式适配**：虽然 PPT 是固定 960×720，但不同内容密度需要微调
- **Tailwind 不是视觉风格**，它是「搭积木的工具」，风格由你定义的配色和字体决定

**视频场景注意：**
- CDN 版约 2-3MB，每个 iframe 独立加载。如页面数量多，建议将配置后的 CSS 下载为本地文件
- 搭配 `tailwind-animations` 插件可扩展更多动画 class

---

## 2. animate.css — 通用入场/强调/退场动画

**CDN 引入：**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css" />
```

**在项目中的作用：**
- 提供**最基础的 70+ 种 CSS 动画**：fade、slide、bounce、zoom、flip、rotate
- 用于**页面元素的入场**：标题弹出、卡片飞入、按钮浮现
- 用于**强调效果**：pulse（脉冲）、shake（抖动）、tada（弹跳）
- 用于**退场**：fadeOut、slideOut（配合自动播放时序，元素消失）

**常用 class（视频PPT场景）：**
| 效果 | class |
|------|-------|
| 淡入上浮 | `animate__animated animate__fadeInUp` |
| 缩放弹出 | `animate__animated animate__zoomIn` |
| 从左滑入 | `animate__animated animate__slideInLeft` |
| 脉冲强调 | `animate__animated animate__pulse animate__infinite` |
| 抖动警告 | `animate__animated animate__shakeX` |
| 延迟触发 | `animate__animated animate__fadeIn animate__delay-1s` |

**局限性：**
- 效果偏「通用」，缺少 clip-path 几何过渡、3D 深度感
- 有「动画疲劳感」，所有网站都用同一套
- **适合：** 内容元素的常规入场，不适合页面级转场

---

## 3. transition.css — 高级几何页面转场

**CDN 引入：**
```html
<link rel="stylesheet" href="https://unpkg.com/transition-style" />
```

**在项目中的作用：**
- **专门解决页面级转场**。不像 animate.css 做元素动画，transition.css 做**整个页面/区块的几何展开**
- 基于 `clip-path` 实现，有**圆形展开、方形展开、擦除、多边形折叠**等高级效果
- 非常适合**视频PPT的页面切换**：前一页擦除消失，后一页几何展开

**在项目中的用法：**
```html
<!-- 圆形从中心展开入场 -->
<div transition-style="in:circle:center">
  页面内容
</div>

<!-- 从下往上擦除入场 -->
<div transition-style="in:wipe:up">
  页面内容
</div>

<!-- 从右下角圆形展开 -->
<div transition-style="in:circle:bottom-right">
  页面内容
</div>

<!-- 多边形对角折叠 -->
<div transition-style="in:polygon:opposing-corners">
  页面内容
</div>
```

**效果分类：**
| 类别 | 示例 | 视频场景 |
|------|------|---------|
| Circles | `in:circle:center` | 标题页从中心扩散 |
| Squares | `in:square:center` | 内容块从中心方块展开 |
| Wipes | `in:wipe:up/down/left/right` | PPT页面擦除切换 |
| Polygons | `in:polygon:opposing-corners` | 创意转场 |

**优势：**
- 纯 CSS，无 JS，性能极好（GPU 加速的 clip-path）
- 效果**极具「视频感」**，像专业剪辑软件的转场
- 可通过 CSS 变量控制 duration、easing、delay

---

## 4. Typed.js — 打字机文本效果

**CDN 引入：**
```html
<script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12"></script>
```

**在项目中的作用：**
- 模拟**逐字打字效果**，带闪烁光标
- 非常适合**视频PPT的叙事节奏**：标题逐字出现，制造悬念
- 支持**多行文本轮换**、**打字后删除**、**HTML标签内打字**

**在项目中的用法：**
```html
<h1 id="typewriter"></h1>
<script>
  new Typed('#typewriter', {
    strings: ['算力租赁', '英伟达 GPU', '未来已来'],
    typeSpeed: 60,      // 打字速度
    backSpeed: 40,      // 删除速度
    backDelay: 2000,    // 删除前停留
    startDelay: 500,    // 开始延迟
    loop: false,        // 视频场景通常不循环
    cursorChar: '|',    // 光标字符
    showCursor: true,
    onComplete: (self) => {
      // 打字完成后触发其他动画
      document.querySelector('.subtitle').classList.add('animate__fadeInUp');
    }
  });
</script>
```

**视频场景技巧：**
- `startDelay` 配合页面切换时机，让打字在页面入场后开始
- `onComplete` 回调链式触发下一个动画，形成**叙事节奏**
- 光标可用 CSS 自定义样式（如红色、加粗）
- **不适合大段文字**，适合标题、金句、关键词

---

## 5. Vanta.js — 3D 动态背景

**CDN 引入：**
```html
<script src="https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js"></script>
<!-- 其他效果同理替换文件名 -->
```

**在项目中的作用：**
- 提供**多种 3D/动态背景效果**，替代静态背景
- 基于 Three.js 但**开箱即用**，一行 JS 初始化
- 效果自动运行，**不需要写 3D 代码**

**可用效果及视频场景：**

| 效果文件 | 视觉特征 | 视频PPT场景 |
|---------|---------|------------|
| `vanta.fog.min.js` | 雾状颜色弥漫 | 氛围页、过渡页 |
| `vanta.waves.min.js` | 流动波浪 | 海洋/流动主题 |
| `vanta.net.min.js` | 粒子网络连线 | 科技风、数据页 |
| `vanta.cells.min.js` | 细胞状分形 | 生物/有机主题 |
| `vanta.halo.min.js` | 光环/光晕 | 标题页、高光时刻 |
| `vanta.birds.min.js` | 飞鸟群 | 自然/自由主题 |
| `vanta.dots.min.js` | 浮动圆点 | 简洁科技感 |
| `vanta.rings.min.js` | 旋转光环 | 运动/节奏主题 |
| `vanta.clouds.min.js` | 云层飘动 | 天空/远景主题 |

**在项目中的用法：**
```html
<div id="vanta-bg" style="position:absolute; inset:0; z-index:0;"></div>
<script>
  VANTA.NET({
    el: "#vanta-bg",
    mouseControls: false,      // 视频场景不需要鼠标交互
    touchControls: false,
    gyroControls: false,
    minHeight: 720,
    minWidth: 960,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x4bd6ff,           // 线条颜色
    backgroundColor: 0x070b1a, // 背景色
    points: 8.0,               // 粒子密度
    maxDistance: 20.0,         // 连线距离
    spacing: 18.0
  });
</script>
```

**视频场景关键配置：**
- `mouseControls: false` — 视频录制不需要鼠标交互
- `minHeight/minWidth` 设为设计尺寸 960×720
- 放在 z-index:0 作为背景层，内容层放 z-index:1+
- 多个页面可**使用不同效果**形成视觉变化

---

## 技术栈组合策略

### 常规内容页
```
Tailwind CSS（布局骨架）
  + animate.css（元素入场）
  + Vanta.js（动态背景，可选）
```

### 标题/开场页
```
Tailwind CSS（居中大字排版）
  + transition.css（几何展开入场）
  + Typed.js（标题逐字打出）
  + Vanta.js（光晕/网络背景）
```

### 数据/图表页
```
Tailwind CSS（grid/flex 布局）
  + animate.css（数字计数、卡片飞入）
  + Vanta.js（网络连线背景，科技风）
```

### 转场/过渡页
```
Tailwind CSS（全屏单色）
  + transition.css（wipe/circle 转场）
```

---

## CDN 速查表

| 库 | CDN 链接 |
|----|---------|
| Tailwind CSS | `https://cdn.tailwindcss.com` |
| animate.css | `https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css` |
| transition.css | `https://unpkg.com/transition-style` |
| Typed.js | `https://cdn.jsdelivr.net/npm/typed.js@2.0.12` |
| Three.js (Vanta依赖) | `https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js` |
| Vanta.js | `https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.{effect}.min.js` |

---

## 给 AI 的生成提示

生成页面时，根据内容类型选择技术组合：

1. **所有页面** → 用 Tailwind 做布局和排版
2. **需要转场感** → 加 transition.css 的 `transition-style` 属性
3. **需要打字效果** → 加 Typed.js 初始化脚本
4. **需要动态背景** → 加 Vanta.js（选择合适的 effect）
5. **需要常规动画** → 加 animate.css 的 `animate__animated animate__xxx`

**优先级原则：** 先 Tailwind 搭骨架，再按需叠加其他库。不要同时引入过多库，单个页面保持轻量。
