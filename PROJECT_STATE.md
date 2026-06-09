# Duoduo Badminton — Project State

> 新对话开始前先读这个文件，可以节省大量 context。  
> 最后更新：2026-06-09（用户档案系统 + Navbar Auth + 我的门票 + 注册 user_id 关联）

---

## 当前状态

| 项目 | 状态 |
|------|------|
| 数据层 | ✅ **真实 Supabase**（`dataService.js` 纯 Supabase，无 Mock 逻辑，无 setTimeout） |
| Supabase 项目 | `bpkysafwfdtrolztaxuz.supabase.co`（Sydney 区域） |
| 数据库表 | ✅ `organizers` / `events` / `registrations` / `user_profiles`（已在 Supabase 跑过 schema.sql） |
| 管理员认证 | ✅ `AdminLogin` → `adminLogin()` → 查 `organizers` 表密码匹配（sessionStorage） |
| 用户认证 | ✅ **Supabase Auth**（Google OAuth / 邮箱登录）；`user_profiles` 自动创建触发器 |
| 本地开发 | `localhost:5173`（`npm run dev`） |
| Git 仓库 | ✅ 已推送：https://github.com/RainONtime/Sydney-Badminton.git |
| 部署 | ✅ **已上线 Vercel**（GitHub 直连自动部署，`vercel.json` 已配置 SPA rewrites） |
| 国际化 | ✅ **全站中英双语**（公开页面 + 全部 Admin 后台，i18next，Navbar 切换，localStorage 持久化） |
| UI 风格 | ✅ **MochiUI 治愈系**（暖奶油渐变背景、紫粉渐变、白色浮动卡片、胶囊按钮） |
| 移动端适配 | ✅ **移动端响应式修复**（Navbar 品牌文字隐藏、AdminRegistrations 横向滚动） |
| 性能优化 | ✅ **代码分割**（React.lazy() 管理员路由 + Profile 路由懒加载 + Vite manualChunks 供应商分包） |
| 废弃文件 | ✅ **已清理**（旧版 `src/components/*.jsx` 根目录文件、`src/lib/` 目录、`ScreenshotModal.jsx` 已物理删除） |
| 用户档案 | ✅ **Profile 页面**（`/profile`，MochiUI 风格，display_name / gender / skill_level / contact_info） |
| 报名身份卡 | ✅ **已登录用户身份摘要**（RegistrationForm 中 `bg-violet-50` 卡片替代重复填表） |
| 我的门票 | ✅ **已报名用户票卡**（EventPage 中绿色 Check 头部 + StatusBadge + 取消报名） |
| 双语活动内容 | ⚠️ **需 Supabase 建列**：`ALTER TABLE events ADD COLUMN title_en TEXT; ADD COLUMN description_en TEXT;` |
| registrations.user_id | ⚠️ **需 Supabase 执行迁移**（见下方「待办 / TODO」） |

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
| @supabase/supabase-js | latest | 数据库客户端 + Auth（已激活） |
| i18next | latest | i18n 核心 |
| react-i18next | latest | React 绑定，`useTranslation()` hook |

**已知 Tailwind 限制**：自定义颜色 token（如 `bg-brand`）**不能**在 CSS 文件 `@layer components` 的 `@apply` 里使用，会报错。只能在 JSX className 中使用。阴影 token 同理，CSS 内直接写 raw `box-shadow` 值。

---

## 双认证系统架构（重要）

本项目同时存在两套互不干扰的认证系统：

| 维度 | 管理员认证 | 公开用户认证 |
|------|-----------|------------|
| 实现 | `sessionStorage` 存 `admin_user` 对象 | Supabase Auth `session` |
| 登录入口 | `/admin/login` → 查 `organizers` 表 | `/login` → Supabase Auth UI |
| 状态读取 | `getAdminUser()` 同步读 sessionStorage | `supabase.auth.getSession()` 异步 |
| 状态监听 | — | `supabase.auth.onAuthStateChange()` |
| 关联表 | `organizers` 表 | `auth.users` + `user_profiles` 表 |
| 路由守卫 | `<RequireAuth>` 组件 | 无强制（Profile 页未登录时显示提示卡） |

**Navbar 三分支渲染**：
1. `isAdmin` → 原有管理员导航（零改动）
2. `session`（已登录公开用户）→ Profile 链接 + 软登出按钮（`color: #C4B5FD`）+ 分隔符 + 管理员登录链接
3. `!session`（访客）→ 渐变 Login 胶囊按钮 + 管理员登录幽灵链接

---

## 设计系统速查（MochiUI）

### 色彩体系

```
全局背景:     linear-gradient(135deg, #FFF6F6 0%, #FDF4F8 50%, #F4F6FF 100%)
              background-attachment: fixed（滚动时背景固定）

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

门票卡:       bg-white rounded-[2rem]
              border: 1px solid rgba(134,239,172,0.3)（淡绿描边，区别普通卡片）
              绿色 Check 圆形头部: linear-gradient(135deg, #86efac, #34d399)

按钮（主）:   rounded-full + linear-gradient(to right, #A88BFA, #F472B6)
按钮（次）:   bg-white rounded-full border-violet-100

输入框:       bg-rgba(250,248,255,0.85) rounded-2xl border-#EDE9FE
              focus: border-rgba(168,139,250,0.6) + ring rgba(168,139,250,0.1)

EventInfo 卡片: bg-white rounded-[2rem] p-6
组织者区块:   bg-amber-50 rounded-2xl
分割线:       border-violet-100/60
身份摘要卡:   bg-violet-50 rounded-2xl px-4 py-3.5（RegistrationForm + 我的门票）
取消报名按钮: bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100
取消确认区:   rounded-2xl border border-rose-100 bg-rose-50/40 px-4 py-4
```

### 组件速查

```
Logo:         <img src="/logo.png" />
              Navbar: w-9 h-9 shrink-0 hover:scale-110
              AdminLogin: w-24 h-24 mx-auto hover:scale-105

Navbar:       bg rgba(252,250,250,0.90) + backdrop-blur(20px)
              底边: 1px solid rgba(168,139,250,0.14)
              品牌文字: hidden sm:block（移动端隐藏）
              Login 胶囊: linear-gradient(to right, #A88BFA, #F472B6) + rounded-full
              软登出: color #C4B5FD（浅紫）

StatusBadge:  全部 rounded-full + font-bold + 糖果色半透明背景
              confirmed  → bg-candy-mint/20   text-teal-600
              waitlisted → bg-candy-purple/20  text-purple-600
              rejected   → bg-candy-peach/20   text-rose-500
              pending    → bg-candy-yellow/30  text-amber-600

Hero Banner:  linear-gradient(135deg, #A88BFA 0%, #F472B6 100%)
              全出血（w-full，无侧边距），底部圆角 rounded-b-[2.5rem]
              内容区 max-w-4xl mx-auto 对齐下方卡片网格

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
├── vite.config.js                # ✅ manualChunks: vendor-react + vendor-supabase
├── supabase/
│   └── schema.sql                # 完整建表脚本（含 RLS + user_profiles + 迁移块）
└── src/
    ├── App.jsx                   # ✅ 路由配置 + RequireAuth 守卫 + React.lazy() 管理员路由 + Profile 路由
    ├── main.jsx                  # ✅ import './i18n' — 确保翻译配置最先加载
    ├── i18n.js                   # ✅ i18next 初始化；从 localStorage 读初始语言；fallback = 'zh'
    ├── index.css                 # ✅ MochiUI 全局样式
    ├── locales/
    │   ├── zh.json               # ✅ 中文字典（10 命名空间，含 admin + profile）
    │   └── en.json               # ✅ 英文字典（10 命名空间，含 admin + profile）
    ├── types/
    │   └── index.js              # JSDoc 类型
    ├── data/
    │   └── mockData.js           # 仅供 AdminLogin 无 .env 时降级使用
    ├── services/
    │   ├── supabase.js           # createClient
    │   ├── authService.js        # getAdminUser / setAdminUser / clearAdminUser（sessionStorage）；getSession（Supabase Auth）
    │   └── dataService.js        # ✅ N+1 消除；Storage GC；公开/管理员双版本报名查询；用户档案函数；user_id 自动挂载
    ├── utils/
    │   ├── imageUtils.js         # ✅ Canvas 图片压缩（max 800px, JPEG q=0.7）
    │   └── formatDate.js         # ✅ 语言感知日期格式（zhCN/enUS）
    ├── components/
    │   ├── ui/
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── CopyButton.jsx
    │   │   ├── QuantityStepper.jsx
    │   │   └── StatusBadge.jsx        # ✅ MochiUI 糖果色 rounded-full 徽章（4种状态）
    │   ├── event/
    │   │   ├── EventCard.jsx          # ✅ i18n + bilingual title；pill 组织者徽章
    │   │   └── EventInfo.jsx          # ✅ i18n + bilingual title/desc；白色浮动卡片
    │   ├── registration/
    │   │   ├── RegistrationForm.jsx   # ✅ profile prop → 身份摘要卡；无 profile 时显示完整表单
    │   │   ├── PaymentStep.jsx        # ✅ i18n；Canvas 压缩集成
    │   │   ├── RegistrationSuccess.jsx # ✅ i18n；{{name}} 插值
    │   │   ├── ParticipantList.jsx    # ✅ 性别色；candy 行背景
    │   │   └── BankInfo.jsx           # ✅ i18n
    │   ├── admin/
    │   │   ├── QRUpload.jsx
    │   │   └── RegistrationDetailsModal.jsx  # ✅ 固定 Header + 可滚动 Body + 全屏截图
    │   └── layout/
    │       └── Navbar.jsx             # ✅ Supabase session 监听；三分支渲染（admin/user/guest）；Login 胶囊；软登出
    └── pages/
        ├── Home.jsx                   # ✅ Hero Banner 全出血（w-full rounded-b-[2.5rem]）
        ├── EventPage.jsx              # ✅ 并行加载 session/profile/myRegistration；我的门票卡；formFromProfile 助手
        ├── Profile.jsx                # ✅ MochiUI 个人档案编辑页（/profile）
        ├── Login.jsx                  # ✅ Supabase Auth 登录页（/login）
        └── admin/                     # ✅ 全部路由 React.lazy() + Suspense 懒加载
            ├── AdminLogin.jsx
            ├── AdminEvents.jsx
            ├── AdminEventForm.jsx     # ✅ title_en / description_en 双语选填字段
            ├── AdminRegistrations.jsx # ✅ overflow-x-auto + min-w-[600px] 移动端横滑
            └── AdminOrganizers.jsx
```

---

## i18n 国际化架构

### 语言切换

- **切换按钮**：Navbar 右上角，Globe 图标（strokeWidth=2.5）+ "EN" / "中"
- **持久化**：`localStorage.setItem('duoduo-lang', 'en' | 'zh')`
- **初始化**：`src/i18n.js` 在 `main.jsx` 最先 import，从 `localStorage` 读初始值，`fallbackLng: 'zh'`

### 翻译字典结构（`src/locales/*.json`）

| 命名空间 | 内容 |
|----------|------|
| `common` | retry / free / perPerson / submitting / back |
| `nav` | Navbar 所有文字（含 `login` / `myProfile`） |
| `home` | 首页标题 / 副标题 / 加载 / 错误 / 空状态 |
| `event` | 活动详情标签 / 满员 / 剩余名额（含复数）/ 错误信息 |
| `form` | 报名表单（含性别选项、等级、人数）/ 验证错误 |
| `success` | 成功页 / 候补页（含 `{{name}}` 插值） |
| `participants` | 报名名单统计 / 候补提示（含复数） |
| `payment` | 支付步骤所有文字 |
| `admin` | **Admin 后台全部文字**（roles / events / registrations / organizers 四个子对象） |
| `profile` | **用户档案页**（title / subtitle / displayName / gender / skillLevel / contactInfo / save / saving / saveSuccess / saveError / notLoggedIn / notLoggedInHint / loading / loadError / backToHome） |

### 新增 nav key（zh.json + en.json）

```json
"nav": {
  "login":     "登录",   // "Login"
  "myProfile": "主页"    // "Profile"
}
```

### 双语活动内容（`title_en` / `description_en`）

```js
// EventCard.jsx & EventInfo.jsx 的兜底逻辑：
const displayTitle = (i18n.language === 'en' && event.title_en) ? event.title_en : event.title
const displayDesc  = (i18n.language === 'en' && event.description_en) ? event.description_en : event.description
```

**⚠️ 需在 Supabase 执行的迁移 SQL：**
```sql
ALTER TABLE events ADD COLUMN title_en TEXT;
ALTER TABLE events ADD COLUMN description_en TEXT;
```

### 日期本地化（`src/utils/formatDate.js`）

```js
// zh → "2025年6月14日 星期六" / en → "Saturday, June 14, 2025"
formatEventDate(dateStr, i18n.language)
// zh → { weekday: "周六", monthDay: "6月14日" } / en → { weekday: "Sat", monthDay: "Jun 14" }
formatCardDate(dateStr, i18n.language)
```

---

## 性能优化记录

### N+1 查询消除

```js
.select('*, registrations(id, quantity, payment_status)')
```

`registration_count` 在 JS 侧计算（排除 `rejected` + `waitlisted`），一次请求搞定。

### 路由懒加载（React.lazy + Suspense）

```js
const AdminLogin         = lazy(() => import('./pages/admin/AdminLogin'))
const AdminEvents        = lazy(() => import('./pages/admin/AdminEvents'))
const AdminEventForm     = lazy(() => import('./pages/admin/AdminEventForm'))
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'))
const AdminOrganizers    = lazy(() => import('./pages/admin/AdminOrganizers'))
const Profile            = lazy(() => import('./pages/Profile'))
```

### Vite Vendor Chunk 分包（`vite.config.js`）

```js
manualChunks: {
  'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
  'vendor-supabase': ['@supabase/supabase-js'],
}
```

- `vendor-react`：~140 kB / `vendor-supabase`：~80 kB（长期缓存）
- 各 admin 页面：2–15 kB（按需加载）
- 主入口 `index.js`：~30 kB

### Storage GC + 图片压缩

- `deleteRegistration` / `deleteEvent` 自动清理 Supabase Storage 截图（非致命，仅 `console.warn`）
- `compressImage(file, { maxWidth: 800, quality: 0.7 })` → Canvas JPEG，减少 60-80%

---

## 数据模型

### `organizers` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| name | TEXT | |
| password | TEXT | 明文（MVP） |
| role | `'super'`\|`'organizer'` | |
| created_at | TIMESTAMPTZ | |

### `events` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| organizer_id | UUID | FK → organizers.id（ON DELETE SET NULL） |
| title | TEXT | 中文标题 |
| title_en | TEXT | ⚠️ 英文标题（需 ALTER TABLE） |
| description | TEXT | |
| description_en | TEXT | ⚠️ 英文描述（需 ALTER TABLE） |
| date | DATE | |
| start_time | TIME | 前端 `.slice(0,5)` 显示 HH:mm |
| end_time | TIME | |
| location | TEXT | |
| max_participants | INTEGER | |
| price | NUMERIC(10,2) | 0 = 免费 |
| organizer | TEXT | 冗余展示名 |
| organizer_wechat | TEXT | |
| payment_methods | TEXT[] | `[]`=免费，`['wechat']`，`['bank']`，`['wechat','bank']` |
| wechat_qr | TEXT | Storage URL |
| wechat_note | TEXT | |
| payid / account_name / bsb / account_number | TEXT | 银行信息 |
| status | `'active'`\|`'completed'`\|`'cancelled'` | |
| created_at | TIMESTAMPTZ | |

### `registrations` 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK |
| event_id | UUID | FK → events.id（ON DELETE CASCADE） |
| user_id | UUID | FK → auth.users(id)（ON DELETE SET NULL）；游客为 NULL |
| name | TEXT | |
| gender | `'male'`\|`'female'`\|`'other'` | |
| skill_level | TEXT | `'1'`–`'6'`，可为空 |
| quantity | INTEGER | 1–3 |
| notes | TEXT | |
| payment_status | `'pending'`\|`'confirmed'`\|`'rejected'`\|`'waitlisted'` | |
| payment_screenshot | TEXT | base64 或 Storage URL |
| created_at | TIMESTAMPTZ | |

### `user_profiles` 表（新增）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | PK，FK → auth.users(id)（ON DELETE CASCADE） |
| display_name | TEXT | OAuth 注册时自动填充 |
| avatar_url | TEXT | OAuth 头像 URL |
| gender | `'male'`\|`'female'`\|`'other'` | |
| contact_info | TEXT | 微信号/手机等 |
| skill_level | TEXT | `'1'`–`'6'` |
| created_at | TIMESTAMPTZ | |

触发器：`handle_new_user()` — auth.users 新增行时自动创建对应 user_profiles 行，填充 display_name 和 avatar_url。

---

## 功能完成清单

### 公开页面
- [x] 首页 `/` — 活动列表卡片，名额进度条，组织者信息
  - ✅ **Hero Banner 全出血**（`w-full rounded-b-[2.5rem]`，内容区 `max-w-4xl mx-auto`）
  - ✅ **中英双语** / MochiUI 卡片 / error state + 重试
- [x] 活动详情 `/events/:id`
  - ✅ **并行加载**：session + event + registrations 第一层；profile + myRegistration 第二层（仅已登录）
  - ✅ **我的门票卡**：绿色 Check 圆形 + StatusBadge + 报名详情（violet-50 块）+ 取消报名
  - ✅ **内联取消确认**：`confirmCancel` 状态切换两按钮行，无 `window.confirm()`
  - ✅ **RegistrationForm 身份摘要卡**：profile 完整时显示 `bg-violet-50` 卡，跳过重复填表
  - ✅ **游客向后兼容**：无 session 时显示完整表单，`user_id` 静默 null
  - ✅ **成功即更新 myRegistration**：注册成功后门票卡立即出现
  - ✅ 候补队列 / 中英双语 / 支付步骤
- [x] 用户档案 `/profile`
  - ✅ display_name / gender / skill_level / contact_info 编辑
  - ✅ 未登录提示卡（不强制重定向）
  - ✅ 保存 saving spinner + success/error feedback
  - ✅ `t('profile.*')` 全 i18n；MochiUI 风格
- [x] 登录 `/login` — Supabase Auth UI

### Navbar（已更新）
- [x] Supabase session 监听（`onAuthStateChange`）
- [x] 三分支渲染：isAdmin / session（已登录）/ 访客
- [x] Login 渐变胶囊 / Profile 链接 / 软登出（#C4B5FD）
- [x] 管理员导航分支完全保留（零改动）
- [x] 移动端：品牌文字 `hidden sm:block`，按钮间距紧凑

### 管理后台 `/admin`
- [x] 登录 / super + organizer 权限 / 组织者管理 / 活动管理 / 报名管理
- [x] 全面国际化（zh/en）
- [x] `AdminEventForm` 含 `title_en` / `description_en` 双语字段
- [x] `AdminRegistrations` 移动端横向滑动

### 性能优化
- [x] 废弃文件清理 / React.lazy() 6条路由 / Vite vendor chunk 分包
- [x] N+1 消除 / 图片压缩 / Storage GC

---

## EventPage 关键设计

### formFromProfile 助手

```js
function formFromProfile(profile) {
  if (!profile) return EMPTY_FORM
  return {
    name:     profile.display_name || '',
    gender:   profile.gender       || '',
    level:    profile.skill_level  || '',
    notes:    profile.contact_info ? `联系方式: ${profile.contact_info}` : '',
    quantity: 1,
  }
}
```

三处复用：初始加载、`handleReset`（step 3 重新开始）、取消报名后。

### 我的门票渲染优先级

```
myRegistration 存在 → 「我的门票」卡
↓ 否则
step === 3 → RegistrationSuccess
↓ 否则
step === 1 → RegistrationForm（带 profile prop）
↓ 否则
step === 2 → PaymentStep
```

---

## RegistrationDetailsModal

```
fixed backdrop（z-50）
└── 卡片（max-h-[90vh] flex flex-col overflow-hidden）
    ├── Header（shrink-0）— 永不随内容滚动
    └── Body（flex-1 overflow-y-auto）
        └── 点击截图 → 全屏 overlay（z-[60]）；fixed X 按钮（z-[61]）
```

---

## dataService.js 暴露的所有函数

```js
// 活动（公开）
getEvents()
getEventById(id)

// 活动（管理后台）
getAdminEvents(user)
getAllEvents()
getOrganizerActiveCount(organizerId)
createEvent(event, user)
updateEvent(id, updates)
deleteEvent(id)                      // ✅ 自动清理 Storage 截图

// 组织者管理
getOrganizers()
addOrganizer({ name, password })
deleteOrganizer(id)
updateOrganizerPassword(id, newPassword)
adminLogin(password)

// 报名
getRegistrationsByEvent(eventId)          // 公开版：排除 payment_screenshot
getAdminRegistrationsByEvent(eventId)     // 管理版：select('*')
getRegistrationCount(eventId)
createRegistration(registration)          // ✅ 自动从 session 挂载 user_id（游客 null）
updateRegistrationStatus(id, eventId, status)
updateRegistrationQuantity(id, eventId, newQuantity)
deleteRegistration(id)                    // ✅ 自动清理 Storage 截图
promoteWaitlistedRegistration(id, eventId)

// 用户档案（新增）
getUserProfile(userId)                    // maybeSingle()，无记录返回 null
updateUserProfile(userId, updates)
getUserRegistrationForEvent(eventId, userId)  // 排除 rejected，maybeSingle()
```

`getUserRegistrationForEvent` 关键细节：`.neq('payment_status', 'rejected')` — 被驳回后允许重新报名。

---

## .env 配置（本地，勿提交）

```
VITE_SUPABASE_URL=https://bpkysafwfdtrolztaxuz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_LPAh9po7pcbNDaXeetVTQA_S8bErK1R
```

---

## Vercel 部署

已上线，GitHub `master` 分支直连，push 后自动重新部署。

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Git 提交记录

```
af9cd14  perf: remove dead files, lazy-load admin routes, split vendor chunks
0dd1642  fix: mobile responsive — hide brand text on narrow screens, fix table scroll
f3dad1d  docs: update PROJECT_STATE.md — MochiUI redesign, full i18n, bilingual content
3ebacd5  feat: MochiUI redesign, full i18n (zh/en), and bilingual event content
7d69da3  perf: eliminate N+1 queries, add image compression, and fix icon alignment
45c38fe  docs: update PROJECT_STATE.md with latest iteration progress and deployment status
61f6144  fix: improve loading UX, error handling, and gender icon alignment
f8fc349  fix: SPA routing, registration details modal, and UI polish
cf7644e  docs: update PROJECT_STATE.md to reflect Supabase migration and GitHub push
ee511e9  Initial commit: Duoduo Badminton full-stack MVP

[ 本地未提交（待 commit + push → 触发 Vercel 部署）]
  - feat: user profiles, navbar auth, ticket card, identity summary, registrations.user_id
```

---

## 技术决策记录

| 决策 | 原因 |
|------|------|
| `payment_methods TEXT[]` | 支持微信 + 银行两种方式，报名者二选一 |
| `waitlisted` 状态独立 | 语义清晰；不占名额；管理员精确控制何时转正 |
| `sessionStorage` 存 admin_user | 关浏览器即失效；切 Auth 只改 authService.js |
| `vercel.json` rewrites | Vite SPA 在 Vercel 刷新路由 404，rewrites 一行修复 |
| RegistrationDetailsModal Header `shrink-0` | 长截图不会把关闭按钮推出屏幕外 |
| 嵌入式 `registrations` 子查询 | 彻底消灭主页/管理页 N+1 |
| 公开/管理员两版 `getRegistrationsByEvent` | 公开版排除 `payment_screenshot` |
| Storage GC 非致命 | 截图删除失败不应阻断 DB 操作；仅 `console.warn` |
| i18next 不用 browser-languagedetector | 产品受众以中文为主，默认 `zh` |
| MochiUI 品牌色紫粉 | 从 Kawaii 天蓝升级为暖系 Mochi 紫 + 粉，贴合女性活力运动定位 |
| 双认证系统并存 | Admin 用 sessionStorage 同步读取；公开用户用 Supabase Auth 异步监听；Navbar 三分支 JSX 互不干扰 |
| `registrations.user_id ON DELETE SET NULL` | 删除账号时注册记录保留；游客注册 null 透明向后兼容 |
| `getUserRegistrationForEvent` 排除 rejected | 被驳回后允许重新报名，不因旧记录误判为"已报名" |
| `.maybeSingle()` 替代 `.single()` | 无记录时返回 null 而非抛错 |
| `formFromProfile` 单一映射来源 | 初始加载 / 取消报名 / handleReset 三处复用，避免映射逻辑分叉 |
| RegistrationForm 接受 `profile` prop | EventPage 已负责 session/profile 加载，下传 prop 避免重复 fetch |
| Hero Banner 全出血 | `w-full rounded-b-[2.5rem]` 视觉冲击更强；内容文字仍用 `max-w-4xl mx-auto` 对齐 |
| 取消报名内联二次确认 | 避免 `window.confirm()` 浏览器弹窗；`confirmCancel` state 切换两按钮行 |
| Profile 页未登录显示提示卡而非重定向 | 未登录访问 /profile 给出友好提示，不强制跳转 |
| Navbar 软登出颜色 #C4B5FD | 浅紫而非红色，视觉上表达"离开"而非"危险操作" |
| React.lazy() 每条路由独立 | 各页面独立 chunk，公开用户零 admin 代码下载 |
| Vite `manualChunks` 分离 vendor | React/Supabase 版本稳定，分包后浏览器长期缓存 |

---

## 待办 / TODO

- [ ] **⚠️ Supabase 迁移（必须执行）**：`registrations.user_id` FK  
  在 Supabase SQL Editor 执行：
  ```sql
  ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations (user_id);
  ```
- [ ] **⚠️ Supabase 迁移（必须执行）**：双语活动字段  
  ```sql
  ALTER TABLE events ADD COLUMN title_en TEXT;
  ALTER TABLE events ADD COLUMN description_en TEXT;
  ```
- [ ] **Git commit + push**：将本次所有功能变更提交并推送到 GitHub（触发 Vercel 自动部署）
- [ ] RLS 按角色收紧：`user_profiles` 已有 authenticated-only 策略；`registrations` 仍 anon 全开放
- [ ] `promoteWaitlistedRegistration` 换 Postgres RPC 保证原子性
- [ ] i18next 懒加载（字典小可接受，未来按需可拆分）
- [ ] Admin 后台 UI 同步 MochiUI 风格（当前仍为灰白，功能优先暂缓）
- [ ] Profile 页：渲染 `avatar_url` Google 头像（字段已存，前端未展示）
- [ ] 我的门票卡：考虑加入凭证二维码 / 截图功能，方便现场出示
