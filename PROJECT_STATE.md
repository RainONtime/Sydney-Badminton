# Duoduo Badminton — Project State

> 新对话开始前先读这个文件，可以节省大量 context。  
> 最后更新：2026-05-27（已部署 Vercel + 两轮功能迭代完成）

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

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | |
| Vite | 5 | dev server + build |
| React Router | v6 | SPA 路由 |
| Tailwind CSS | v3.4 | ⚠️ 见「已知限制」 |
| date-fns | v3 | |
| lucide-react | latest | 图标 |
| @supabase/supabase-js | latest | 数据库客户端（已激活） |

**已知 Tailwind 限制**：自定义 token（如 `bg-brand`）**不能**在 CSS 文件 `@layer components` 的 `@apply` 里使用，会报错。只能在 JSX className 中使用。

**品牌色**：`brand.DEFAULT = #1a3255`（深海军蓝，用于按钮、spinner 等）；logo 背景色 `#29aedd`（品牌青色，仅在内联 style 中使用）。

---

## 目录结构

```
badminton-app/
├── .env                          # 🔒 本地密钥（已加入 .gitignore，勿提交）
├── .env.example                  # 模板（无密钥，已提交到 Git）
├── .gitignore
├── vercel.json                   # ✅ SPA rewrites（修复 Vercel 刷新 404）
├── tailwind.config.js
├── supabase/
│   └── schema.sql                # 完整建表脚本（含 RLS，已在 Supabase 执行）
└── src/
    ├── App.jsx                   # 路由配置 + RequireAuth 守卫
    ├── main.jsx
    ├── index.css                 # Tailwind + 自定义设计 token
    ├── types/
    │   └── index.js              # JSDoc 类型
    ├── data/
    │   └── mockData.js           # 仅供 AdminLogin 无 .env 时降级使用
    ├── services/
    │   ├── supabase.js           # createClient
    │   ├── authService.js        # getAdminUser / setAdminUser / clearAdminUser（sessionStorage）
    │   └── dataService.js        # 所有 CRUD — 纯 Supabase，无 Mock，无延迟
    ├── components/
    │   ├── ui/
    │   │   ├── LoadingSpinner.jsx     # ✅ 品牌色 border-t-brand；spacing 由调用方控制
    │   │   ├── CopyButton.jsx
    │   │   ├── QuantityStepper.jsx
    │   │   └── StatusBadge.jsx        # confirmed / pending / waitlisted / rejected
    │   ├── event/
    │   │   ├── EventCard.jsx
    │   │   └── EventInfo.jsx
    │   ├── registration/
    │   │   ├── RegistrationForm.jsx
    │   │   ├── PaymentStep.jsx
    │   │   ├── RegistrationSuccess.jsx
    │   │   ├── ParticipantList.jsx    # ✅ GenderIcon 组件；ShoppingBag for 'other'；-translate-y 对齐
    │   │   └── BankInfo.jsx
    │   ├── admin/
    │   │   ├── QRUpload.jsx
    │   │   ├── RegistrationDetailsModal.jsx  # ✅ 新建：固定 Header + 可滚动 Body + 全屏截图
    │   │   └── ScreenshotModal.jsx           # ⚠️ 已废弃（无任何 import 引用），可删除
    │   └── layout/
    │       └── Navbar.jsx
    └── pages/
        ├── Home.jsx                   # ✅ error state + 居中 loading + 重试按钮
        ├── EventPage.jsx              # ✅ pageError / notFound 双分支 + 居中 loading
        └── admin/
            ├── AdminLogin.jsx         # ✅ 品牌 Logo（/shuttlecock.png w-16 h-16 bg-brand）
            ├── AdminEvents.jsx        # ✅ 移除预览按钮；操作图标放大（size 16-17，p-2）
            ├── AdminEventForm.jsx
            ├── AdminRegistrations.jsx # ✅ Eye 按钮（始终可见）→ RegistrationDetailsModal
            └── AdminOrganizers.jsx
```

> ⚠️ **残留旧文件**（历史遗留，未被任何 import 引用，不影响运行，可择机清理）：
> `src/components/LoadingSpinner.jsx` / `src/components/ParticipantList.jsx` /
> `src/components/EventCard.jsx` / `src/components/PaymentStep.jsx` /
> `src/components/Navbar.jsx` / `src/lib/` 目录下三个文件

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
| payment_screenshot | TEXT | Storage URL |
| created_at | TIMESTAMPTZ | |

---

## 功能完成清单

### 公开页面
- [x] 首页 `/` — 活动列表卡片，名额进度条，组织者信息
  - 居中 LoadingSpinner（`min-h-[50vh]`）+ error state + 重试按钮
- [x] 活动详情 `/events/:id`
  - Step 1：填写名字 / 性别 / 等级 / 人数 / 备注
  - Step 2：支付（微信 QR + wechat_note / 银行转账 / 免费直接确认）；多支付方式二选一
  - Step 3：成功 or 候补提示
  - 居中 LoadingSpinner（`min-h-[70vh]`）+ 网络错误 / 活动不存在 双分支
- [x] **候补队列**：名额满时跳过付款直接提交 `waitlisted`；成功页显示候补专属提示
- [x] 报名名单：
  - 性别图标（♂ ♀ ShoppingBag）`-translate-y-[1px]` 光学对齐
  - 候补独立展示，不计入已报名人数

### 管理后台 `/admin`
- [x] **登录页**：品牌 Logo（`/shuttlecock.png` w-16 h-16 `bg-brand`）居中；密码唯一标识
- [x] **super（超管）**：全站活动 + 报名；组织者管理页
- [x] **organizer（组织者）**：仅自己活动（`organizer_id` 过滤）；最多 3 个 active
- [x] **组织者管理** `/admin/organizers`（超管专属）：新增 / 改密码 / 删除（有活动时拦截）
- [x] 活动管理（`AdminEvents`）：
  - 移除"前台预览"按钮
  - 操作按钮放大（icon size 16-17，`p-2`，`gap-2`）
  - 表格 `overflow-x-auto` 防移动端破版
- [x] 报名管理（`AdminRegistrations`）：
  - **Eye 按钮**（始终可见，任何状态均显示）→ RegistrationDetailsModal
  - 确认 / 驳回 / 删除 / 修改人数 / 候补转正 / 导出 CSV
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
getEvents()
getEventById(id)

// 活动（管理后台）
getAdminEvents(user)               // 按 role 过滤
getAllEvents()                      // 全量（legacy）
getOrganizerActiveCount(organizerId)
createEvent(event, user)           // 含配额检查
updateEvent(id, updates)
deleteEvent(id)

// 组织者管理（超管专属）
getOrganizers()
addOrganizer({ name, password })
deleteOrganizer(id)                // HAS_ACTIVE_EVENTS 时返回错误
updateOrganizerPassword(id, newPassword)
adminLogin(password)               // 查 organizers 表，返回 { id, name, role }

// 报名
getRegistrationsByEvent(eventId)
getRegistrationCount(eventId)      // 排除 rejected + waitlisted
createRegistration(registration)
updateRegistrationStatus(id, eventId, status)
updateRegistrationQuantity(id, eventId, newQuantity)
deleteRegistration(id)
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

## 设计系统速查

```
背景色:       #f5f5f7（Apple 灰，非 Tailwind gray-50）
品牌主色:     #1a3255（brand.DEFAULT；按钮 bg、spinner border-t-brand）
品牌青色:     #29aedd（logo 背景，内联 style 使用，非 Tailwind token）
卡片:         .card（white + multi-layer shadow + 1px rgba border）
主按钮:       .btn-primary（min-h 44px，touch-manipulation）
次按钮:       .btn-secondary
输入框:       .input-field（font-size 16px，防 iOS 自动缩放）
Navbar:       rgba(245,245,247,0.85) + backdrop-blur(20px) saturate(180%)
品牌 logo:    style={{ background: '#29aedd url(/shuttlecock.png) center/190% no-repeat' }}
              + rounded-full；Navbar: w-8 h-8；AdminLogin: w-16 h-16
安全区:       env(safe-area-inset-bottom) 用在主页面底部 padding
候补色:       purple-50 / purple-100 / text-purple-600
LoadingSpinner: border-t-brand；调用方负责外层间距（min-h-[50vh] / py-20 等）
性别图标:     ♂ text-blue-500 / ♀ text-pink-500 / <ShoppingBag> text-purple-500
              统一 text-sm + -translate-y-[1px] + leading-none 光学对齐
```

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
61f6144  fix: improve loading UX, error handling, and gender icon alignment
f8fc349  fix: SPA routing, registration details modal, and UI polish
cf7644e  docs: update PROJECT_STATE.md to reflect Supabase migration
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
| GenderIcon 提取为独立组件 | ♂ ♀ ShoppingBag 三种图标复用同一对齐逻辑 |
| `border-t-brand` 用于 spinner | Tailwind v3 支持方向性 border color，JSX 中可用自定义 token |

---

## 待办 / TODO

- [ ] 清理旧版残留文件（`src/components/*.jsx` 根目录、`src/lib/` 目录）
- [ ] 删除已废弃的 `src/components/admin/ScreenshotModal.jsx`
- [ ] Supabase Auth（替换明文密码 + anon key 登录）
- [ ] RLS 按角色收紧各表读写权限（目前 anon 全开放）
- [ ] `promoteWaitlistedRegistration` 换 Postgres RPC 保证原子性
