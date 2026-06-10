# Skill: 生成 HTML-PPT 页面（gen）

> **本 Skill 的唯一目标**：根据 `pages.json` 的内容，为每一条 `page` 记录生成对应的演示页面。
> 生成结果必须能直接被 `index.html` 加载并播放，能被 `record.js` 录制成视频。

---

## 1. 项目结构（必须先理解）

```
html-ppt-template/
├── index.html              # 播放器主入口（加载 pages.json 并 iframe 切换页面）
├── pages.json              # 唯一的"内容源"，决定每一页要讲什么
├── pages/                  # 生成的页面存放目录（由本 Skill 填充）
│   ├── page1.html
│   ├── page1.css
│   ├── page1.js
│   ├── page2.html
│   ├── page2.css
│   ├── page2.js
│   └── ...
├── styles/
│   └── index.css           # 播放器外壳样式（不参与单页生成）
├── themes/
│   ├── tech.md             # 技术栈选型说明（CDN/库用法速查）
│   └── dark-tech/          # 暗色科技风主题素材（按需参考）
├── skills/
│   └── gen.md              # ← 本文件
├── record.js               # Puppeteer 录屏脚本
├── record.bat              # 一键录屏
├── init_npm.bat            # 安装 puppeteer 依赖
└── clear.bat               # 清理临时文件
```

**关键约束（来自 `index.html`）：**

1. 每个页面是 **独立的 HTML 文件**，通过 `iframe` 加载
2. 播放器把 iframe **强制缩放** 到 `960 × 720` 设计尺寸
3. 页面内容是 **固定 960×720 画布**，不要用 `width:100vw`、不要写响应式
4. **不要在页面内做跨页面跳转**（如 `<a href>`），只负责呈现本页内容
5. 页面内**禁用外链字体请求 google fonts 等**——iframe 在离线或受限网络下可能加载失败
6. 播放器在 `index.html` 已经引入了 `Vanta.fog` 全局背景，**单页内不要再重复加 Vanta 全屏背景**，否则会和播放器抢视觉

---

## 2. `pages.json` 结构（必读）

```json
{
  "summary": "整段口播全文",
  "pages": [
    {
      "index": 1,                                // 1-based 序号
      "page": 1,                                 // 同上
      "pageName": "page1",                       // 资源名前缀
      "pagePath": "pages/page1.html",            // ← 生成的 HTML 路径
      "cssPath": "pages/page1.css",              // ← 生成的 CSS 路径
      "jsPath":  "pages/page1.js",               // ← 生成的 JS 路径
      "duration": 4100,                          // 停留毫秒数（index.html 用来自动翻页）
      "content": "本页完整旁白（去除标点的口语稿）",
      "items": [                                 // 时间轴分段（控制画面节奏）
        { "start": 0,     "end": 2666, "duration": 2666, "text": "AA" },
        { "start": 2666,  "end": 4100, "duration": 1434, "text": "BB" }
      ]
    }
  ]
}
```

**字段使用规则：**

| 字段 | 用途 |
|---|---|
| `pageName` | 决定文件名前缀：`<pageName>.html` / `.css` / `.js` |
| `duration` | 只给 `index.html` 用，**不要写进页面 HTML** |
| `content` | 用于**理解本页主题**和设计文案改写 |
| `items[].text` | 用于**画面节奏**——一般 1 个 item 对应 1 个画面元素（一句话一行） |
| `items[].duration` | 该句话在画面上停留的毫秒数，决定动画触发时机 |

---

## 3. 页面文件结构（每个 page 必须输出 3 个文件）

根据要求的theme模板完成。
---

## 4. 画布与排版基准（960×720）

根据要求的theme模板完成。
---

## 5. 动画时间轴：把 `items` 翻译成画面节奏

**核心思想**：每一页有 `N` 个 item，根据需要合理、有
---

## 6. 内容设计原则（来自 `videoppt.md`）

> 这是硬性要求，**违反任何一条都算不合格**。

1. **不要在画面中显示时间码**
2. **不要死板只用列表**——多变的版式、视觉重心、装饰
3. **不要追求统一布局**——每页都应该有不同的视觉结构
4. **站在听众角度润色**，不局限于口播原话；可以加 emoji、贴纸、隐喻、对比
5. **多用 3D / 动效 / 图标**（Vanta 局部背景、Three.js、ECharts、RemixIcon 等）
6. **不要重复使用同一个动画**——连续两页不要都用 `fadeInUp`
7. **不要显示字幕**

---

## 7. 生成工作流（按顺序执行）

### Step 1：读取并解析 `pages.json`
在项目根目录下，名为pages.json

### Step 2：为每页生成 3 个文件

按 `pages.json.pages` 数组顺序逐条处理。每条记录：

1. **设计画面**（先想清楚视觉重心、版式、配色、动效）
2. **写 `pageN.html`**（套 §3.1 骨架 + 嵌入 `<script id="page-timeline">`）
3. **写 `pageN.css`**（按 §3.2 约束 + §4 画布）
4. **写 `pageN.js`**（按 §3.3 约束 + §5 时间轴调度）
5. **逐项跑 §8 的检查**

### Step 3：本地冒烟验证

```bash
# 1. 起一个静态服务器（任选其一）
npx http-server . -p 8080
# 或
python -m http.server 8080

# 2. 浏览器访问 http://localhost:8080
# 3. 点"自动播放"，肉眼检查每页：
#    - 文字是否出框 / 溢出
#    - 动画是否在该出现的时候出现
#    - 最后一帧的停留是否完整
```
---

## 8. 检查措施（生成完必跑，不通过必须修）

### 8.1 文件完整性检查

```bash
# 必须返回 15 条记录（与 pages.json 的 pages 数量一致）
ls pages/*.html | wc -l
ls pages/*.css  | wc -l
ls pages/*.js   | wc -l

# 每个 pageN 必须三件套齐全，不能少文件
for n in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  test -f "pages/page${n}.html" || echo "[缺失] page${n}.html"
  test -f "pages/page${n}.css"  || echo "[缺失] page${n}.css"
  test -f "pages/page${n}.js"   || echo "[缺失] page${n}.js"
done
```

### 8.2 `pages.json` 与文件交叉校验

```bash
node -e "
const p=require('./pages.json');
const fs=require('fs');
let bad=0;
p.pages.forEach(pg=>{
  for (const f of [pg.pagePath, pg.cssPath, pg.jsPath]) {
    if (!fs.existsSync(f)) { console.log('[缺失]', f); bad++; }
  }
});
process.exit(bad?1:0);
"
```

退出码非 0 → 修复后再继续。

### 8.3 内容自检清单（每页生成完后逐项打勾）

- [ ] 画面**没有时间码**（不要出现 `0:00`、`00:00`、毫秒数）
- [ ] 画面**没有 1:1 复述 items[].text** 的呆板大字（要做视觉包装）
- [ ] **没有连续两页用同一套布局**（左右分屏/居中大字/列表……混搭）
- [ ] 文字**没有溢出** 960×720 安全区
- [ ] 字体颜色和背景**对比度足够**（>= 4.5:1）
- [ ] 至少 **80% 的 items 都有对应的入场动效**（不是一次性出完）
- [ ] 画面内容分布合理，不会只集中在一个地方。内容铺满页面。
- [ ] **第 1 页**有视觉钩子（大字 / 几何转场 / 3D 元素）
- [ ] **最后 1 页**有金句落款（账号名 / slogan）
- [ ] 引用 `remixicon` / `typed.js` / `vanta` 时 **CDN URL 正确**（见 §6 速查表）
- [ ] HTML 中 `<script id="page-timeline">` 里的 JSON **与 pages.json 中对应页的 items 数组完全一致**

---

> **一句话总结**：拿到 `pages.json` 的每一条 `page`，按"读 items → 设计画面 → 写 .html/.css/.js → 跑 §8 检查"的流程循环 15 次，直到所有页都能在 `index.html` 里流畅播放。