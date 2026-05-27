# Duoduo Badminton — Project State

> 新对话开始前先读这个文件，可以节省大量 context。  
> 最后更新：2026-05-28（MochiUI 全面重构 + 全站 i18n 完成）

---

## 当前状态

| 项目 | 状态 |
|------|------|
| 数据层 | ✅ **真实 Supabase**（`dataService.js` 纯 Supabase，无 Mock 逻辑，无 setTimeout） |
| Supabase 项目 | `bpkysafwfdtrolztaxuz.supabase.co`（Sydney 区域） |
| 数据库表 | ✅ `organizers` / `events` / `registrations`（已在 Supabase 跑过 schema.sql） |
| 认证 | ✅ `AdminLogin` → `adminLogin()` → 查 `organizers` 表密码匹配 |
| 本地开发 | `localhost:5173`（`npm run dev`） |
| Git 仓库 | ✅ 已推送：https://github.com/RainONtime/Sydney-Badminton.git |
| 部署 | ✅ **已上线 Vercel**（GitHub 直连自动部署，`vercel.json` 已配置 SPA rewrites） |
| 国际化 | ✅ **全站中英双语**（公开页面 + 全部 Admin 后台，i18next，Navbar 切换，localStorage 持久化） |
| UI 风格 | ✅ **MochiUI 治愈系**（暖奶油渐变背景、紫粉渐变、白色浮动卡片、胶囊按钮） |
| 双语活动内容 | ⚠️ **需 Supabase 建列**：`ALTER TABLE events ADD COLUMN title_en TEXT; ADD COLUMN description_en TEXT;` |

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | |
| Vite | 5 | dev server + build |
| React Router | v6 | SPA 路由 |
| Tailwind CSS | v3.4 | ⚠️ 见「已知限制」 |
| date-fns | v3 | 含 `zhCN` / `enUS` locale，随 i18n 语言自动切换 |
| lucide-react | latest | 图标（全局 strokeWidth 统一为 2.5） |
| @supabase/supabase-js | latest | 数据库客户端（已激活） |
| i18next | latest | i18n 核心 |
| react-i18next | latest | React 绑定，`useTranslation()` hook |

**已知 Tailwind 限制**：自定义颜色 token（如 `bg-brand`）**不能**在 CSS 文件 `@layer components` 的 `@apply` 里使用，会报错。只能在 JSX className 中使用。阴影 token 同理，CSS 内直接写 raw `box-shadow` 值。

---

## 设计系统速查（MochiUI）

### 色彩体系

```
全局背景:     linear-gradient(135deg, #FFF6F6 0%, #FDF4F8 50%, #F4F6FF 100%)
              background-attachment: fixed（滚动时背景固定）
              （极淡粉紫暖意，卡片在此背景上自然悬浮）

全局文字色:   #4B4552（暖灰紫，非冷黑）

品牌主色:     brand.DEFAULT = #A88BFA  (Mochi 紫)
              brand.light   = #C4B5FD
              brand.dark    = #8B5CF6
              brand.faint   = #F5F3FF

渐变按钮:     linear-gradient(to right, #A88BFA, #F472B6)（紫 → 粉）

糖果色系 (candy):
              candy-pink   = #f9a8d4  (糖果粉)
              candy-yellow = #fde047  (奶油黄)
              candy-mint   = #86efac  (活力薄荷绿)
              candy-purple = #d8b4fe  (香芋紫)
              candy-peach  = #fca5a5  (蜜桃色，用于驳回状态)
              candy-blue   = #93c5fd  (天蓝)

mochi 文字:   mochi.text  = #4B4552
              mochi.cream = #FCFAFA
```

### 形体与材质

```
卡片:         bg-white rounded-[2rem]
              border: 1px solid rgba(249,168,212,0.3)（淡粉描边）
              box-shadow: 0 8px 30px rgba(0,0,0,0.03)
              hover: translateY(-5px) + 紫粉弥散光晕

按钮（主）:   rounded-full + linear-gradient(to right, #A88BFA, #F472B6)
              hover: translateY(-3px) scale(1.02) + 紫色光晕 rgba(168,139,250,0.4)
              active: scale(0.96)

按钮（次）:   bg-white rounded-full border-violet-100
              hover: bg-#F5F3FF + translateY(-2px)

输入框:       bg-rgba(250,248,255,0.85) rounded-2xl border-#EDE9FE
              focus: border-rgba(168,139,250,0.6) + ring rgba(168,139,250,0.1)

EventInfo 卡片: bg-white rounded-[2rem] p-6（活动详情页头部信息）
组织者区块:   bg-amber-50 rounded-2xl（奶油黄，User 图标点缀）
分割线:       border-violet-100/60（柔和紫色）
```

### 组件速查

```
Logo:         <img src="/logo.png" />（用户提供的紫粉渐变完整 logo 图片）
              Navbar: w-9 h-9 shrink-0 hover:scale-110
              AdminLogin: w-24 h-24 mx-auto hover:scale-105

Navbar:       bg rgba(252,250,250,0.90) + backdrop-blur(20px)
              底边: 1px solid rgba(168,139,250,0.14)（淡紫描边）
              active 链接色: text-violet-500
              BADMINTON 副标题: #A88BFA opacity-0.75

StatusBadge:  全部 rounded-full + font-bold + 糖果色半透明背景
              confirmed  → bg-candy-mint/20   text-teal-600
              waitlisted → bg-candy-purple/20  text-purple-600
              rejected   → bg-candy-peach/20   text-rose-500
              pending    → bg-candy-yellow/30  text-amber-600

levelBadge:   bg-violet-50 text-violet-500 rounded-full

EventCard 组织者: inline-flex pill badge，bg-violet-50 text-violet-500 font-semibold

报名行:       正常 → bg-violet-50/40 rounded-2xl
              待确认 → bg-candy-yellow/10 border border-candy-yellow/40 rounded-2xl

时间格式:     start_time?.slice(0,5) → 去掉秒数，显示 HH:mm

性别图标:     ♂ text-indigo-300 / ♀ text-rose-300 / <ShoppingBag> text-violet-400
Hero Banner:  linear-gradient(135deg, #A88BFA 0%, #F472B6 100%)（首页顶部卡片）
语言切换:     Navbar 右上角 Globe strokeWidth={2.5} + "EN"/"中"
              localStorage key: 'duoduo-lang'；值: 'zh' | 'en'
```

---

## 目录结构

```
badminton-app/
├── .env                          # 🔒 本地密钥（已加入 .gitignore，勿提交）
├── .env.example                  # 模板（无密钥，已提交到 Git）
├── .gitignore
├── vercel.json                   # ✅ SPA rewrites（修复 Vercel 刷新 404）
├── tailwind.config.js            # ✅ brand=#A88BFA + candy 6色 + shadow-kawaii/mochi
├── supabase/
│   └── schema.sql                # 完整建表脚本（含 RLS，已在 Supabase 执行）
└── src/
    ├── App.jsx                   # 路由配置 + RequireAuth 守卫
    ├── main.jsx                  # ✅ import './i18n' — 确保翻译配置最先加载
    ├── i18n.js                   # ✅ i18next 初始化；从 localStorage 读初始语言；fallback = 'zh'
    ├── index.css                 # ✅ MochiUI 全局样式（暖渐变背景 + 浮动卡片 + 紫粉按钮）
    ├── locales/
    │   ├── zh.json               # ✅ 中文字典（9 命名空间，含 admin）
    │   └── en.json               # ✅ 英文字典（9 命名空间，含 admin）
    ├── types/
    │   └── index.js              # JSDoc 类型
    ├── data/
    │   └── mockData.js           # 仅供 AdminLogin 无 .env 时降级使用
    ├── services/
    │   ├── supabase.js           # createClient
    │   ├── authService.js        # getAdminUser / setAdminUser / clearAdminUser（sessionStorage）
    │   └── dataService.js        # ✅ N+1 消除；Storage GC；公开/管理员双版本报名查询
    ├── utils/
    │   ├── imageUtils.js         # ✅ Canvas 图片压缩（max 800px, JPEG q=0.7）
    │   └── formatDate.js         # ✅ 语言感知日期格式（zhCN/enUS，供 EventCard/EventInfo 使用）
    ├── components/
    │   ├── ui/
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── CopyButton.jsx
    │   │   ├── QuantityStepper.jsx
    │   │   └── StatusBadge.jsx        # ✅ MochiUI 糖果色 rounded-full 徽章（4种状态）
    │   ├── event/
    │   │   ├── EventCard.jsx          # ✅ i18n + bilingual title；pill 组织者徽章；时间去秒
    │   │   └── EventInfo.jsx          # ✅ i18n + bilingual title/desc；白色浮动卡片；amber 组织者块
    │   ├── registration/
    │   │   ├── RegistrationForm.jsx   # ✅ i18n；rounded-2xl 紫粉 focus 输入框
    │   │   ├── PaymentStep.jsx        # ✅ i18n；Canvas 压缩集成；compressing UX
    │   │   ├── RegistrationSuccess.jsx # ✅ i18n；{{name}} 插值
    │   │   ├── ParticipantList.jsx    # ✅ indigo/rose/violet 性别色；candy 行背景
    │   │   └── BankInfo.jsx           # ✅ i18n
    │   ├── admin/
    │   │   ├── QRUpload.jsx
    │   │   ├── RegistrationDetailsModal.jsx  # ✅ 固定 Header + 可滚动 Body + 全屏截图
    │   │   └── ScreenshotModal.jsx           # ⚠️ 已废弃（无任何 import 引用），可删除
    │   └── layout/
    │       └── Navbar.jsx             # ✅ MochiUI 淡紫底边；active=violet-500；logo.png
    └── pages/
        ├── Home.jsx                   # ✅ i18n；Hero Banner；error state；重试按钮
        ├── EventPage.jsx              # ✅ i18n；暖渐变背景；柔和分割线；violet hover
        └── admin/
            ├── AdminLogin.jsx         # ✅ logo.png（w-24 h-24）；violet eye button
            ├── AdminEvents.jsx        # ✅ i18n 完成；活动状态 t('admin.events.status.*')；violet 操作图标
            ├── AdminEventForm.jsx     # ✅ title_en / description_en 双语选填字段
            ├── AdminRegistrations.jsx # ✅ i18n 完成；所有表头/按钮/确认弹窗已翻译
            └── AdminOrganizers.jsx    # ✅ i18n 完成；所有中文硬编码已清除
```

> ⚠️ **残留旧文件**（历史遗留，未被任何 import 引用，不影响运行，可择机清理）：
> `src/components/LoadingSpinner.jsx` / `src/components/ParticipantList.jsx` /
> `src/components/EventCard.jsx` / `src/components/PaymentStep.jsx` /
> `src/components/Navbar.jsx` / `src/lib/` 目录下三个文件 /
> `src/components/admin/ScreenshotModal.jsx`

---

## i18n 国际化架构

### 语言切换

- **切换按钮**：Navbar 右上角，Globe 图标（strokeWidth=2.5）+ "EN" / "中"（显示"点击后切换到的语言"）
- **持久化**：`localStorage.setItem('duoduo-lang', 'en' | 'zh')`
- **初始化**：`src/i18n.js` 在 `main.jsx` 最先 import，从 `localStorage` 读初始值，`fallbackLng: 'zh'`

### 翻译字典结构（`src/locales/*.json`）

| 命名空间 | 内容 |
|----------|------|
| `common` | retry / free / perPerson / submitting / back |
| `nav` | Navbar 所有文字 |
| `home` | 首页标题 / 副标题 / 加载 / 错误 / 空状态 |
| `event` | 活动详情标签 / 满员 / 剩余名额（含复数）/ 错误信息 |
| `form` | 报名表单（含性别选项、等级、人数）/ 验证错误 |
| `success` | 成功页 / 候补页（含 `{{name}}` 插值） |
| `participants` | 报名名单统计 / 候补提示（含复数） |
| `payment` | 支付步骤所有文字 |
| `admin` | **Admin 后台全部文字**（roles / events / registrations / organizers 四个子对象） |

### Admin 命名空间细分（`admin.*`）

| 子命名空间 | 覆盖内容 |
|-----------|---------|
| `admin.roles` | 超管 / 组织者 角色徽章 |
| `admin.events` | 页面标题、统计、按钮、表头、状态标签、确认弹窗 |
| `admin.registrations` | 返回链接、统计、表头、操作 tooltip、确认弹窗、错误信息、gender 标签 |
| `admin.organizers` | 页面标题、按钮、表头、表单、确认弹窗、错误信息 |

### 双语活动内容（`title_en` / `description_en`）

```js
// EventCard.jsx & EventInfo.jsx 的兜底逻辑：
const displayTitle = (i18n.language === 'en' && event.title_en) ? event.title_en : event.title
const displayDesc  = (i18n.language === 'en' && event.description_en) ? event.description_en : event.description
// → title_en 为空/null/undefined 时自动回退中文，不会出现 undefined
```

**AdminEventForm 已新增两个选填字段：**
- `Activity Title (English)` → 写入 `events.title_en`
- `Description (English)` → 写入 `events.description_en`

**⚠️ 需在 Supabase 执行的迁移 SQL：**
```sql
ALTER TABLE events ADD COLUMN title_en TEXT;
ALTER TABLE events ADD COLUMN description_en TEXT;
```

### 日期本地化（`src/utils/formatDate.js`）

```js
// EventInfo 详情页：
// zh → "2025年6月14日 星期六"
// en → "Saturday, June 14, 2025"
formatEventDate(dateStr, i18n.language)

// EventCard 卡片：
// zh → { weekday: "周六", monthDay: "6月14日" }
// en → { weekday: "Sat", monthDay: "Jun 14" }
formatCardDate(dateStr, i18n.language)
```

### 翻译原则

- **DB 动态内容智能兜底**：`event.title` / `event.description` 优先显示 `*_en` 字段（当语言为 en 且字段非空），否则回退原始中文值
- **其他动态数据不翻译**：`event.location` / `reg.name` / `reg.notes` 等直接渲染原始值
- **复数处理**：`i18next` 标准后缀 `_one` / `_other`，用于 `event.spotsLeft` / `participants.waitlist` 等
- **Admin 后台已全面翻译**：AdminEvents / AdminRegistrations / AdminOrganizers 所有 UI 文字均已 `t()` 化

---

## 性能优化记录

### N+1 查询消除

`getEvents()` 和 `getAdminEvents()` 通过 Supabase 嵌入式查询一次性拿到所有数据：

```js
.select('*, registrations(id, quantity, payment_status)')
```

`registration_count` 在 JS 侧计算（排除 `rejected` + `waitlisted`），原始数组在返回前剥离。**不再有任何串行 N 次请求。**

### 公开 vs 管理员报名数据分离

| 函数 | 用途 | 字段 |
|------|------|------|
| `getRegistrationsByEvent(eventId)` | EventPage（公开） | 排除 `payment_screenshot`（隐私 + 体积） |
| `getAdminRegistrationsByEvent(eventId)` | AdminRegistrations（管理后台） | `select('*')` 全字段 |

### 客户端图片压缩（`src/utils/imageUtils.js`）

```js
compressImage(file, { maxWidth: 800, quality: 0.7 })
// → Canvas 缩放 → JPEG base64 dataURL
// → 上传体积减小约 60-80%
// → 失败时自动 fallback 到原始 FileReader
```

`PaymentStep.jsx` 集成：上传期间显示独立 `compressing` 状态（旋转器 + 文字），阻止提交按钮。

### Storage 垃圾回收

删除报名 / 活动时自动清理 Supabase Storage 截图文件：

- `deleteRegistration(id)` → 先查截图 URL → `deleteStorageFile()` → 再删 DB 行
- `deleteEvent(id)` → 批量查所有报名截图 URL → `storage.remove(paths[])` → 再删 event
- `extractFilePathFromUrl(url)` 解析 `/storage/v1/object/public/payment_screenshots/` 路径；base64 dataURL 直接跳过
- **Storage 错误非致命**：仅 `console.warn`，不阻断 DB 操作

---

## 数据模型

### `OrganizerAccount`（`organizers` 表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK，自动生成 |
| name | TEXT | 显示名字 |
| password | TEXT | 明文（MVP 阶段）；TODO: 接 Supabase Auth |
| role | `'super'`\|`'organizer'` | 权限角色 |
| created_at | TIMESTAMPTZ | |

### `BadmintonEvent`（`events` 表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| organizer_id | UUID | FK → organizers.id（ON DELETE SET NULL） |
| title | TEXT | 中文标题 |
| title_en | TEXT | ⚠️ 英文标题（需手动 ALTER TABLE 添加，选填） |
| description | TEXT | 中文描述 |
| description_en | TEXT | ⚠️ 英文描述（需手动 ALTER TABLE 添加，选填） |
| date | DATE | |
| start_time | TIME | 前端展示时 `.slice(0,5)` 去秒，显示 HH:mm |
| end_time | TIME | 同上 |
| location | TEXT | |
| max_participants | INTEGER | |
| price | NUMERIC(10,2) | 0 = 免费 |
| organizer | TEXT | 冗余展示名（避免 JOIN） |
| organizer_wechat | TEXT | 取消/退款联系方式 |
| payment_methods | TEXT[] | `[]`=免费，`['wechat']`，`['bank']`，`['wechat','bank']` |
| wechat_qr | TEXT | Storage URL |
| wechat_note | TEXT | 付款页大字高亮（金额/备注） |
| payid | TEXT | |
| account_name | TEXT | |
| bsb | TEXT | |
| account_number | TEXT | |
| status | `'active'`\|`'completed'`\|`'cancelled'` | |
| created_at | TIMESTAMPTZ | |

### `Registration`（`registrations` 表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| event_id | UUID | FK → events.id（ON DELETE CASCADE） |
| name | TEXT | |
| gender | `'male'`\|`'female'`\|`'other'` | |
| skill_level | TEXT | `'1'`–`'6'`，可为空 |
| quantity | INTEGER | 1–3 |
| notes | TEXT | |
| payment_status | `'pending'`\|`'confirmed'`\|`'rejected'`\|`'waitlisted'` | |
| payment_screenshot | TEXT | base64 dataURL（前端压缩后存储）或 Storage URL |
| created_at | TIMESTAMPTZ | |

---

## 功能完成清单

### 公开页面
- [x] 首页 `/` — 活动列表卡片，名额进度条，组织者信息
  - 居中 LoadingSpinner + error state + 重试按钮
  - ✅ **中英双语**（`useTranslation`）
  - ✅ **Hero Banner**（紫粉渐变，首页顶部）
  - ✅ **MochiUI 卡片**（白色浮动 + 暖渐变背景）
  - ✅ **组织者 pill 徽章**（violet 胶囊，替代旧浅色文字）
  - ✅ **时间显示去秒**（HH:mm 格式）
- [x] 活动详情 `/events/:id`
  - Step 1：填写名字 / 性别 / 等级 / 人数 / 备注
  - Step 2：支付（微信 QR / 银行转账 / 免费直接确认）；多支付方式二选一
  - Step 3：成功 or 候补提示
  - 网络错误 / 活动不存在 双分支；居中 LoadingSpinner
  - ✅ **中英双语**（全流程：报名 → 付款 → 成功）
  - ✅ **活动信息卡片化**（白色大圆角卡片 + 标签/值层级分离）
  - ✅ **组织者区块暖色化**（amber-50 底色 + User 图标）
- [x] **候补队列**：名额满时跳过付款直接提交 `waitlisted`；成功页显示候补专属提示
- [x] 报名名单：GenderIcon h-6 固定高度对齐；候补独立展示；中英双语

### 管理后台 `/admin`（✅ 已全面国际化）
- [x] **登录页**：`logo.png`（w-24 h-24）居中；密码唯一标识
- [x] **super（超管）**：全站活动 + 报名；组织者管理页
- [x] **organizer（组织者）**：仅自己活动（`organizer_id` 过滤）；最多 3 个 active
- [x] **组织者管理** `/admin/organizers`（超管专属）：✅ i18n 完成；新增 / 改密码 / 删除（有活动时拦截）
- [x] **活动管理** `AdminEvents.jsx`：✅ i18n 完成；状态徽章翻译；violet 操作图标
- [x] **报名管理** `AdminRegistrations.jsx`：✅ i18n 完成；所有表头/操作/弹窗已翻译；Eye → RegistrationDetailsModal；确认/驳回/候补转正/导出 CSV
- [x] **活动表单** `AdminEventForm.jsx`：✅ `title_en` / `description_en` 双语选填字段
- [x] **全局提交锁**：所有变更按钮带 loading spinner 防重复点击

---

## RegistrationDetailsModal 结构说明

```
fixed backdrop（z-50，点击关闭）
└── 卡片（max-h-[90vh] flex flex-col overflow-hidden）
    ├── Header（shrink-0）— 姓名 + "报名详情" + X 关闭按钮 【永不随内容滚动】
    └── Body（flex-1 overflow-y-auto）— 信息行 + 截图缩略图 【可独立滚动】
        └── 点击截图 → 全屏 overlay（z-[60]）
                       fixed X 按钮（z-[61]，锁定视口右上角）
```

展示字段：姓名 / 性别 / 等级 / 报名人数 / 当前状态 / 备注 / 付款截图  
空值统一显示 `—`；长文本 `break-all`；iOS 底部 `env(safe-area-inset-bottom)`。

---

## dataService.js 暴露的所有函数

```js
// 活动（公开）
getEvents()                          // 嵌入 registration_count，无 N+1
getEventById(id)

// 活动（管理后台）
getAdminEvents(user)                 // 按 role 过滤；嵌入 registration_count，无 N+1
getAllEvents()                        // 全量（legacy，不推荐）
getOrganizerActiveCount(organizerId)
createEvent(event, user)             // 含配额检查；自动写入 title_en / description_en
updateEvent(id, updates)             // 自动更新 title_en / description_en
deleteEvent(id)                      // ✅ 自动清理 Storage 截图（批量）

// 组织者管理（超管专属）
getOrganizers()
addOrganizer({ name, password })
deleteOrganizer(id)                  // HAS_ACTIVE_EVENTS 时返回错误
updateOrganizerPassword(id, newPassword)
adminLogin(password)                 // 查 organizers 表，返回 { id, name, role }

// 报名
getRegistrationsByEvent(eventId)          // 公开版：排除 payment_screenshot
getAdminRegistrationsByEvent(eventId)     // 管理版：select('*') 全字段
getRegistrationCount(eventId)             // 排除 rejected + waitlisted（备用）
createRegistration(registration)
updateRegistrationStatus(id, eventId, status)
updateRegistrationQuantity(id, eventId, newQuantity)
deleteRegistration(id)                    // ✅ 自动清理 Storage 截图
promoteWaitlistedRegistration(id, eventId)  // NO_SPOTS_AVAILABLE 时返回错误
```

所有函数返回 `{ data, error }` 或 `{ count, error }`。**无任何 setTimeout 人工延迟。**

---

## .env 配置（本地，勿提交）

```
VITE_SUPABASE_URL=https://bpkysafwfdtrolztaxuz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_LPAh9po7pcbNDaXeetVTQA_S8bErK1R
```

（`VITE_ADMIN_PASSWORD` 已废弃，AdminLogin 现查 organizers 表）

---

## Vercel 部署

已上线，与 GitHub `master` 分支直连，push 后自动重新部署。

**`vercel.json`**（SPA rewrites，修复刷新 404）：
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Vercel 环境变量**（已在后台配置）：
```
VITE_SUPABASE_URL      = https://bpkysafwfdtrolztaxuz.supabase.co
VITE_SUPABASE_ANON_KEY = sb_publishable_LPAh9po7pcbNDaXeetVTQA_S8bErK1R
```

---

## Git 提交记录

```
3ebacd5  feat: MochiUI redesign, full i18n (zh/en), and bilingual event content
7d69da3  perf: eliminate N+1 queries, add image compression, and fix icon alignment
45c38fe  docs: update PROJECT_STATE.md with latest iteration progress
61f6144  fix: improve loading UX, error handling, and gender icon alignment
f8fc349  fix: SPA routing, registration details modal, and UI polish
ee511e9  Initial commit: Duoduo Badminton full-stack MVP
```

---

## 技术决策记录

| 决策 | 原因 |
|------|------|
| `payment_methods TEXT[]` | 支持同时开放微信 + 银行两种方式，报名者二选一 |
| `wechat_note` 大字高亮 | 明确金额和备注，降低操作错误率 |
| 密码即身份（单字段登录） | 无用户枚举风险；密码全局唯一（DB unique index） |
| `waitlisted` 状态独立 | 语义清晰；不占名额；管理员精确控制何时转正 |
| `dataService.js` 纯 Supabase，无 useMock | 双模式逻辑已无必要；Mock 降级仅剩 AdminLogin |
| `promoteWaitlistedRegistration` read-then-write | 简单够用；TODO: 高并发换 Postgres RPC |
| RLS 当前全开放给 anon | 未接 Supabase Auth；TODO: 上线后按角色收紧 |
| `sessionStorage` 存 admin_user | 关浏览器即失效；切 Auth 只改 authService.js |
| `organizer` 字段冗余 | 避免列表每次 JOIN；数据量小可接受 |
| `vercel.json` rewrites | Vite SPA 在 Vercel 刷新路由 404，rewrites 一行修复 |
| RegistrationDetailsModal Header `shrink-0` | 长截图不会把关闭按钮推出屏幕外 |
| 全屏截图关闭按钮用 `fixed` | 脱离滚动流，永远锁在视口右上角（z-[61]） |
| 嵌入式 `registrations` 子查询 | 一次 Supabase 请求拿全部数据，彻底消灭主页/管理页 N+1 |
| 公开/管理员两版 `getRegistrationsByEvent` | 公开版排除 `payment_screenshot`（隐私 + 减少传输）；管理版 `select('*')` |
| Storage GC 非致命 | 截图删除失败不应阻断 DB 操作；仅 `console.warn` |
| Canvas 压缩后存 base64 | 无需 Storage bucket 权限配置；`extractFilePathFromUrl` 兼容旧数据 |
| i18next 不用 browser-languagedetector | 产品受众以中文为主，默认 `zh` 优先于 navigator.language |
| `formatDate.js` 独立工具函数 | 非 hook，可在任意上下文调用，传入 `i18n.language` 字符串即可 |
| localStorage key `'duoduo-lang'` | 项目专属命名空间，避免与其他应用冲突 |
| MochiUI 品牌色从天蓝改为紫粉 | 视觉重构：从 Kawaii 天蓝（#38bdf8）升级为暖系 Mochi 紫（#A88BFA）+ 粉（#F472B6），更贴合女性活力运动定位 |
| 全局背景用渐变 + `background-attachment: fixed` | 暖奶油渐变背景在滚动时固定，白色卡片自然悬浮其上，营造层次感 |
| `logo.png` 替换旧 SVG 和 shuttlecock.png | SVG 手写羽毛球视觉效果差；用户提供了带渐变背景的完整 logo，直接 `<img>` 展示无需任何修饰 |
| 时间显示 `.slice(0, 5)` 去秒 | 数据库 TIME 类型返回 `HH:mm:ss`，前端截断为 `HH:mm`，更简洁 |
| Admin 后台完成 i18n | 组织者群体有海外用户需求；统一双语体验；`admin.*` 命名空间独立维护 |
| `title_en` / `description_en` 独立字段 | 允许组织者为活动提供可选英文版本；前端智能兜底（en字段空→回退中文）；不影响现有数据 |
| Admin 后台 i18n 采用 `t('admin.registrations.gender.*')` | Admin 表格中性别标签需配合界面语言切换；与公开页面 `form.male/female` 保持一致性但命名空间隔离 |
| Kawaii 阴影用 raw CSS 而非 `@apply shadow-kawaii` | Tailwind 自定义 token 在 @layer components 的 @apply 中不可靠；raw 值更稳定 |
| Icon `strokeWidth={2.5}` | 配合软糖质感，线条更饱满圆润 |

---

## 待办 / TODO

- [ ] **⚠️ Supabase 迁移**：`ALTER TABLE events ADD COLUMN title_en TEXT; ADD COLUMN description_en TEXT;`（双语内容功能需要此迁移才能生效）
- [ ] 清理旧版残留文件（`src/components/*.jsx` 根目录、`src/lib/` 目录、`src/components/admin/ScreenshotModal.jsx`）
- [ ] Supabase Auth（替换明文密码 + anon key 登录）
- [ ] RLS 按角色收紧各表读写权限（目前 anon 全开放）
- [ ] `promoteWaitlistedRegistration` 换 Postgres RPC 保证原子性
- [ ] i18next 懒加载（当前全量打包；字典小可接受，未来按需可拆分）
- [ ] Admin 后台 UI 同步 MochiUI 风格（当前仍为灰白，功能优先暂缓）
