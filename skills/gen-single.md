# Skill: 生成 HTML-PPT 页面（gen）

> **本 Skill 的唯一目标**：根据 `pages.json` 的元数据，生成对应的演示页面。
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
│   ├── dark-tech/          # 暗色科技风主题（娱乐向，emoji 偏活跃）
│   └── dark-tech-standard/ # 暗色科技风主题（专业向，emoji 画龙点睛）
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

## 2. `pages.json` 元数据结构（必读）

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

**核心思想**：每一页有 `N` 个 item，把它们当成**节奏点**，每句话触发一个画面元素。

**调度规则：**

1. **第 1 个 item** 触发主标题或视觉钩子（入场最显眼）
2. **中间 items** 触发次要元素（副标题、卡片、数字、对比项）
3. **最后一个 item** 触发落款 / 行动号召 / 关键金句
4. 同一帧内**最多 3 个元素**同时动，多了会糊

**常用动效（按场景选，不要全用同一个）：**

| 场景 | class | 备注 |
|---|---|---|
| 标题入场 | `animate__fadeInDown` / `animate__zoomIn` | |
| 卡片入场 | `animate__fadeInUp` / `animate__slideInLeft` | |
| 数据出现 | `animate__zoomIn` + 数字滚动 | |
| 警示强调 | `animate__headShake` / `animate__tada` | 用于"骗局/亏损" |
| 问号装饰 | `animate__rubberBand animate__infinite` | 持续 2-3 次后停 |
| 列表逐条 | `animate__lightSpeedInLeft` | 一条接一条 |

**禁止：**
- ❌ 同一动画（`fadeInUp`）连续 2 页都用
- ❌ 无限循环动画（`pulse infinite` / `heartBeat infinite`）超过 1 个——视频录屏会出现闪烁伪影
- ❌ 入场动画总时长 > 1.5s
- ❌ 最后一帧空白收尾

---

## 6. Emoji 使用规范（按主题差异化）

> **通用原则**（适用于所有主题）：
> - 文字太"静"——在 4 秒的快切节奏里，纯文字用户记不住
> - emoji 能在 **200ms** 内传递情绪，体积小、跨平台、性价比高
> - emoji + 文字组合比纯文字 **记忆度提升 40%+**
> - 替代低质量的 SVG / icon，比 icon 更"接地气"，更符合短视频调性
>
> **每个主题的具体 emoji 规范见各自的设计文档**
---

## 7. 内容设计原则（来自 `videoppt.md`）

> 这是硬性要求，**违反任何一条都算不合格**。

1. **不要在画面中显示时间码**
2. **不要死板只用列表**——多变的版式、视觉重心、装饰
3. **不要追求统一布局**——每页都应该有不同的视觉结构
4. **站在听众角度润色**，不局限于口播原话；可以加 emoji、贴纸、隐喻、对比
5. **多用 3D / 动效 / 图标**（Vanta 局部背景、Three.js、ECharts、RemixIcon 等）
6. **不要重复使用同一个动画**——连续两页不要都用 `fadeInUp`
7. **不要显示字幕**
8. **❌ 严禁"大大小小的方框"页面**——这是过去生成的致命问题：
   - 不允许整页只是 N 个矩形堆叠
   - 不允许所有内容用同一个背景色 / 同一档圆角
   - **必须有** 大字 / 巨型 emoji / 渐变色块 / 几何装饰 中的至少 **2 种**非"方框"元素
   - **必须有** 至少 1 处"破格"——文字溢出常规网格、emoji 飞出卡片、对角线构图、不对称布局

---

## 8. 生成工作流（按顺序执行）

### Step 1：读取上下文中的`pages.json`元数据
在项目根目录下，名为pages.json

### Step 2：生成 3 个文件

1. **设计画面**（先想清楚视觉重心、版式、配色、动效）
2. **写 `pageN.html`**（套 §3.1 骨架 + 嵌入 `<script id="page-timeline">`）
3. **写 `pageN.css`**（按 §3.2 约束 + §4 画布）
4. **写 `pageN.js`**（按 §3.3 约束 + §5 时间轴调度）
5. **逐项跑 §9 的检查**

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
#    - 是否死板，展示方式是"大大小小的方框"
```

---

## 9. 检查措施（生成完必跑，不通过必须修）

### 9.1 文件完整性检查

```bash
# 每个 page 必须三件套齐全，不能少文件
test -f "pages/page${n}.html" || echo "[缺失] page${n}.html"
test -f "pages/page${n}.css"  || echo "[缺失] page${n}.css"
test -f "pages/page${n}.js"   || echo "[缺失] page${n}.js"
```

### 9.2 内容自检清单（每页生成完后逐项打勾）

- [ ] 画面**没有时间码**（不要出现 `0:00`、`00:00`、毫秒数）
- [ ] 画面**没有 1:1 复述 items[].text** 的呆板大字（要做视觉包装）
- [ ] **没有连续两页用同一套布局**（左右分屏/居中大字/列表……混搭）
- [ ] 文字**没有溢出** 960×720 安全区
- [ ] 字体颜色和背景**对比度足够**（>= 4.5:1）
- [ ] 至少 **80% 的 items 都有对应的入场动效**（不是一次性出完）
- [ ] **第 1 页**有视觉钩子（大字 / 几何转场 / 3D 元素 / 巨型 emoji）
- [ ] **最后 1 页**有金句落款（账号名 / slogan）
- [ ] 引用 `remixicon` / `typed.js` / `vanta` 时 **CDN URL 正确**（见 `themes/tech.md`）
- [ ] HTML 中 `<script id="page-timeline">` 里的 JSON **与 pages.json 元数据中对应页的 items 数组完全一致**
---

> **一句话总结**：拿到 `page`，按"读 items → 设计画面（含 emoji 主视觉） → 写 .html/.css/.js → 跑 §9 检查"的流程循环 N 次，直到所有页都能在 `index.html` 里流畅播放，并且 **没有任何一页是"大大小小的方框"**。