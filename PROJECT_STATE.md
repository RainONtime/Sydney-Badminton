# Duoduo Badminton — Project State

> 新对话开始前先读这个文件，可以节省大量 context。  
> 最后更新：2026-05-28（Kawaii UI 全面视觉重构）

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
| 国际化 | ✅ **中英双语**（i18next，Navbar 右上角切换，localStorage 持久化） |
| UI 风格 | ✅ **Kawaii + Minimal 治愈系极简风**（已完成全面视觉重构） |

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | |
| Vite | 5 | dev server + build |
| React Router | v6 | SPA 路由 |
| Tailwind CSS | v3.4 | ⚠️ 见「已知限制」 |
| date-fns | v3 | 含 `zhCN` / `enUS` locale，随 i18n 语言自动切换 |
| lucide-react | latest | 图标（全局 strokeWidth 统一为 2.5，线条更饱满） |
| @supabase/supabase-js | latest | 数据库客户端（已激活） |
| i18next | latest | i18n 核心 |
| react-i18next | latest | React 绑定，`useTranslation()` hook |

**已知 Tailwind 限制**：自定义颜色 token（如 `bg-brand`）**不能**在 CSS 文件 `@layer components` 的 `@apply` 里使用，会报错。只能在 JSX className 中使用。阴影 token 同理，在 CSS 内直接写 raw `box-shadow` 值。

---

## 设计系统速查（Kawaii + Minimal）

### 色彩体系

```
全局背景:     linear-gradient(160deg, #f8fffe 0%, #f0f9ff 60%, #fafff8 100%)
              (薄荷白 → 马卡龙天蓝 → 薄荷白三段渐变)

品牌主色:     brand.DEFAULT = #38bdf8  (Macaron Sky Blue 马卡龙天蓝)
              brand.light   = #7dd3fc
              brand.dark    = #0ea5e9  (hover 态)
              brand.faint   = #f0f9ff

糖果色系 (candy):
              candy-pink   = #f9a8d4  (糖果粉)
              candy-yellow = #fde047  (奶油黄)
              candy-mint   = #86efac  (活力薄荷绿)
              candy-purple = #d8b4fe  (香芋紫)
              candy-peach  = #fca5a5  (蜜桃色，用于驳回状态)
              candy-blue   = #93c5fd  (天蓝)

品牌青色:     #29aedd（logo 背景，内联 style 使用，非 Tailwind token）
```

### 形体与材质

```
卡片圆角:     rounded-[2rem]（超大圆角，软糖质感）
按钮圆角:     rounded-full（全胶囊形）
输入框圆角:   rounded-2xl
小徽章圆角:   rounded-full

卡片阴影:     0 10px 40px -10px rgba(0,0,0,0.06),
              0 4px 16px -4px rgba(56,189,248,0.08)
              (shadow-kawaii，天蓝色弥散，"贴纸"质感)

卡片 hover:   translateY(-4px) + 阴影加深天蓝发光
按钮 hover:   translateY(-4px) scale(1.02) + 天蓝光晕 box-shadow
按钮 active:  scale(0.95) 回弹
过渡时长:     buttons/cards 统一 duration-300 ease-out
```

### 组件速查

```
品牌 logo:    style={{ background: '#29aedd url(/shuttlecock.png) center/190% no-repeat' }}
              + rounded-full；Navbar: w-8 h-8；AdminLogin: w-16 h-16
              阴影: 0 1px 3px rgba(56,189,248,0.25), 0 4px 10px rgba(56,189,248,0.18)

Navbar:       rgba(248,250,255,0.88) + backdrop-blur(20px) saturate(180%)
              底边: 1px solid rgba(56,189,248,0.14)（天蓝色细线）
              active 链接色: text-sky-500

StatusBadge:  全部 rounded-full + font-bold + 糖果色半透明背景
              confirmed  → bg-candy-mint/20   text-teal-600
              waitlisted → bg-candy-purple/20  text-purple-600
              rejected   → bg-candy-peach/20   text-rose-500
              pending    → bg-candy-yellow/30  text-amber-600

levelBadge:   bg-sky-50 text-sky-500 rounded-full（从灰色边框改为天蓝胶囊）

报名行:       正常 → bg-slate-50/70 rounded-2xl
              待确认 → bg-candy-yellow/10 border border-candy-yellow/40 rounded-2xl

候补文字色:   text-purple-400（从 purple-500 微调）
待确认标签色: text-amber-500（从 amber-600 微调）

LoadingSpinner: border-t-brand（现在 brand = #38bdf8 天蓝色）
性别图标:     ♂ text-blue-400 / ♀ text-pink-400 / <ShoppingBag strokeWidth={2.5}> text-purple-400
Icon strokeWidth: 全局公共组件 2.5（Globe / ShoppingBag 已更新）

安全区:       env(safe-area-inset-bottom) 用在主页面底部 padding
语言切换:     Navbar 右上角 <Globe size={12} strokeWidth={2.5}> + "EN"/"中" 文字按钮
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
├── tailwind.config.js            # ✅ brand=天蓝 + candy 6色 + shadow-kawaii
├── supabase/
│   └── schema.sql                # 完整建表脚本（含 RLS，已在 Supabase 执行）
└── src/
    ├── App.jsx                   # 路由配置 + RequireAuth 守卫
    ├── main.jsx                  # ✅ import './i18n' — 确保翻译配置最先加载
    ├── i18n.js                   # ✅ i18next 初始化；从 localStorage 读初始语言；fallback = 'zh'
    ├── index.css                 # ✅ Kawaii 全局样式（渐变背景 + 软糖卡片 + 胶囊按钮）
    ├── locales/
    │   ├── zh.json               # ✅ 中文字典（8 命名空间）
    │   └── en.json               # ✅ 英文字典（地道英文：RSVP / Waitlist / Spots left 等）
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
    │   │   ├── LoadingSpinner.jsx     # border-t-brand（现为天蓝）
    │   │   ├── CopyButton.jsx
    │   │   ├── QuantityStepper.jsx
    │   │   └── StatusBadge.jsx        # ✅ Kawaii 糖果色 rounded-full 徽章（4种状态）
    │   ├── event/
    │   │   ├── EventCard.jsx          # ✅ i18n；使用 .card 类（已重构为超大圆角软糖卡片）
    │   │   └── EventInfo.jsx          # ✅ i18n；formatEventDate() 本地化日期
    │   ├── registration/
    │   │   ├── RegistrationForm.jsx   # ✅ i18n；.input-field（已重构为 rounded-2xl 天蓝 focus）
    │   │   ├── PaymentStep.jsx        # ✅ i18n；Canvas 压缩集成；compressing UX
    │   │   ├── RegistrationSuccess.jsx # ✅ i18n；{{name}} 插值
    │   │   ├── ParticipantList.jsx    # ✅ Kawaii 配色；ShoppingBag strokeWidth=2.5；candy 行色
    │   │   └── BankInfo.jsx           # ✅ i18n
    │   ├── admin/
    │   │   ├── QRUpload.jsx
    │   │   ├── RegistrationDetailsModal.jsx  # ✅ 固定 Header + 可滚动 Body + 全屏截图
    │   │   └── ScreenshotModal.jsx           # ⚠️ 已废弃（无任何 import 引用），可删除
    │   └── layout/
    │       └── Navbar.jsx             # ✅ Kawaii 天蓝底边；Globe strokeWidth=2.5；active=sky-500
    └── pages/
        ├── Home.jsx                   # ✅ i18n；error state；居中 loading；重试按钮
        ├── EventPage.jsx              # ✅ i18n；pageError / notFound 双分支；居中 loading
        └── admin/
            ├── AdminLogin.jsx         # ✅ 品牌 Logo（/shuttlecock.png w-16 h-16 bg=#29aedd）
            ├── AdminEvents.jsx        # ✅ 嵌入式 registration_count；操作图标放大
            ├── AdminEventForm.jsx
            ├── AdminRegistrations.jsx # ✅ getAdminRegistrationsByEvent；Eye → RegistrationDetailsModal
            └── AdminOrganizers.jsx
```

> ⚠️ **残留旧文件**（历史遗留，未被任何 import 引用，不影响运行，可择机清理）：
> `src/components/LoadingSpinner.jsx` / `src/components/ParticipantList.jsx` /
> `src/components/EventCard.jsx` / `src/components/PaymentStep.jsx` /
> `src/components/Navbar.jsx` / `src/lib/` 目录下三个文件

---

## i18n 国际化架构

### 语言切换

- **切换按钮**：Navbar 右上角，Globe 图标（strokeWidth=2.5）+ "EN" / "中" 文字（显示"点击后切换到的语言"）
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

- **DB 动态内容不翻译**：`event.title` / `event.description` / `event.location` / `reg.name` / `reg.notes` 等直接渲染原始数据库值
- **复数处理**：`i18next` 标准后缀 `_one` / `_other`，用于 `event.spotsLeft` / `participants.waitlist` 等
- **Admin 后台暂不翻译**：Admin 页面仍使用中文硬编码，受众固定

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
- `extractFilePathFromUrl(url)` 专门解析 `/storage/v1/object/public/payment_screenshots/` 路径；base64 dataURL 直接跳过（返回 null）
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
| title | TEXT | |
| description | TEXT | |
| date | DATE | |
| start_time | TIME | |
| end_time | TIME | |
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
  - 居中 LoadingSpinner（`min-h-[50vh]`）+ error state + 重试按钮
  - ✅ **中英双语**（`useTranslation`）
  - ✅ **Kawaii 卡片**（超大圆角 + 天蓝弥散阴影 + hover 上浮）
- [x] 活动详情 `/events/:id`
  - Step 1：填写名字 / 性别 / 等级 / 人数 / 备注
  - Step 2：支付（微信 QR + wechat_note / 银行转账 / 免费直接确认）；多支付方式二选一
  - Step 3：成功 or 候补提示
  - 居中 LoadingSpinner（`min-h-[70vh]`）+ 网络错误 / 活动不存在 双分支
  - ✅ **中英双语**（全流程：报名 → 付款 → 成功）
- [x] **候补队列**：名额满时跳过付款直接提交 `waitlisted`；成功页显示候补专属提示
- [x] 报名名单：
  - GenderIcon h-6 固定高度容器对齐（♂ ♀ ShoppingBag strokeWidth=2.5）
  - 候补独立展示，不计入已报名人数
  - ✅ **中英双语**（含性别标签 M/F vs 男/女，复数 waitlist）
  - ✅ **Kawaii 配色**（candy 糖果色行背景 + 天蓝 level 胶囊）

### 管理后台 `/admin`（**暂未翻译，中文固定**）
- [x] **登录页**：品牌 Logo（`/shuttlecock.png` w-16 h-16 bg=`#29aedd`）居中；密码唯一标识
- [x] **super（超管）**：全站活动 + 报名；组织者管理页
- [x] **organizer（组织者）**：仅自己活动（`organizer_id` 过滤）；最多 3 个 active
- [x] **组织者管理** `/admin/organizers`（超管专属）：新增 / 改密码 / 删除（有活动时拦截）
- [x] 活动管理（`AdminEvents`）：嵌入式 `registration_count`（无 N+1）；`overflow-x-auto` 防移动端破版
- [x] 报名管理（`AdminRegistrations`）：Eye 按钮 → RegistrationDetailsModal；确认/驳回/删除/候补转正/导出 CSV
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

展示字段：姓名 / 性别（中文）/ 中羽等级 / 报名人数 / 当前状态 / 备注留言 / 付款截图  
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
createEvent(event, user)             // 含配额检查
updateEvent(id, updates)
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
feat: Kawaii UI redesign — candy colors, soft shadows, bouncy interactions
feat: add i18n with zh/en dictionaries, navbar toggle, and locale-aware dates
perf: eliminate N+1 queries, add image compression, and fix icon alignment
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
| LoadingSpinner 去掉内置 `py-24` | 调用方按语境自定义间距，组件更通用 |
| GenderIcon `h-6` 固定高度容器 | 绝对高度 + `items-center` 锁死 SVG 与文字基线，无需任何 `translate-y` 光学修正 |
| `border-t-brand` 用于 spinner | Tailwind v3 支持方向性 border color，JSX 中可用自定义 token（现为天蓝 #38bdf8） |
| 嵌入式 `registrations` 子查询 | 一次 Supabase 请求拿全部数据，彻底消灭主页/管理页 N+1 |
| 公开/管理员两版 `getRegistrationsByEvent` | 公开版排除 `payment_screenshot`（隐私 + 减少传输）；管理版 `select('*')` |
| Storage GC 非致命 | 截图删除失败不应阻断 DB 操作；仅 `console.warn` |
| Canvas 压缩后存 base64 | 无需 Storage bucket 权限配置；`extractFilePathFromUrl` 可区分两种格式兼容旧数据 |
| i18next 不用 browser-languagedetector | 产品受众以中文为主，默认 `zh` 优先于 navigator.language；逻辑更可控 |
| Admin 后台暂不翻译 | 组织者均为中文用户，翻译收益低；减少 i18n 维护面 |
| `formatDate.js` 独立工具函数 | 非 hook，可在任意上下文调用，传入 `i18n.language` 字符串即可 |
| localStorage key `'duoduo-lang'` | 项目专属命名空间，避免与其他应用冲突 |
| brand 色从 `#1a3255` 改为 `#38bdf8` | 视觉重构：从严肃深海军蓝转向轻盈马卡龙天蓝，配合 Kawaii + Minimal 设计语言 |
| Kawaii 阴影用 raw CSS 而非 `@apply shadow-kawaii` | Tailwind 自定义 token 在 @layer components 的 @apply 中不可靠；box-shadow 直接写 raw 值更稳定 |
| 按钮 hover 效果用 raw CSS 而非 `@apply hover:*` | 需要 `:not(:disabled)` 精确排除禁用态，raw CSS 选择器优先级更可控 |
| Icon `strokeWidth={2.5}` | 配合软糖质感，线条更饱满圆润；仅更新公共组件（Globe/ShoppingBag），Admin 图标暂不变 |
| candy 色用 Tailwind opacity 修饰符（如 `bg-candy-mint/20`） | 自定义颜色在 JSX 中支持 `/[opacity]` 写法，生成半透明背景，无需手动写 rgba |

---

## 待办 / TODO

- [ ] 清理旧版残留文件（`src/components/*.jsx` 根目录、`src/lib/` 目录）
- [ ] 删除已废弃的 `src/components/admin/ScreenshotModal.jsx`
- [ ] Supabase Auth（替换明文密码 + anon key 登录）
- [ ] RLS 按角色收紧各表读写权限（目前 anon 全开放）
- [ ] `promoteWaitlistedRegistration` 换 Postgres RPC 保证原子性
- [ ] Admin 后台 i18n（目前中文硬编码，如有海外组织者需求再做）
- [ ] i18next 懒加载（当前全量打包；字典小可接受，未来按需可拆分）
- [ ] Admin 后台 UI 同步 Kawaii 风格（当前仍为旧 Apple 灰白，受众固定暂缓）
