# Duoduo Badminton — Project State

> 新对话开始前先读这个文件，可以节省大量 context。  
> 最后更新：2026-05-27（Supabase 已接通 + 推送 GitHub）

---

## 当前状态

| 项目 | 状态 |
|------|------|
| 数据层 | ✅ **真实 Supabase**（`dataService.js` 已全部切换，Mock 逻辑已移除） |
| Supabase 项目 | `bpkysafwfdtrolztaxuz.supabase.co`（Sydney 区域） |
| 数据库表 | ✅ `organizers` / `events` / `registrations`（已在 Supabase 跑过 schema.sql） |
| 认证 | ✅ `AdminLogin` → `adminLogin()` → 查 `organizers` 表密码匹配 |
| 本地开发 | `localhost:5173`（`npm run dev`） |
| Git 仓库 | ✅ 已推送：https://github.com/RainONtime/Sydney-Badminton.git |
| 部署 | ⏳ 代码已就绪，待部署至 Vercel / Netlify |

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

---

## 目录结构

```
badminton-app/
├── .env                          # 🔒 本地密钥（已加入 .gitignore，勿提交）
├── .env.example                  # 模板（无密钥，已提交到 Git）
├── .gitignore
├── supabase/
│   └── schema.sql                # 完整建表脚本（含 RLS，已在 Supabase 执行）
└── src/
    ├── App.jsx                   # 路由配置 + RequireAuth 守卫
    ├── main.jsx
    ├── index.css                 # Tailwind + 自定义设计 token
    ├── types/
    │   └── index.js              # JSDoc 类型（BadmintonEvent / Registration / OrganizerAccount）
    ├── data/
    │   └── mockData.js           # 保留供 AdminLogin Mock 分支使用（本地开发无 .env 时）
    ├── services/
    │   ├── supabase.js           # createClient（读取 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）
    │   ├── authService.js        # getAdminUser / setAdminUser / clearAdminUser（sessionStorage）
    │   └── dataService.js        # 所有 CRUD — 纯 Supabase，无 Mock 逻辑
    ├── components/
    │   ├── ui/
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── CopyButton.jsx
    │   │   ├── QuantityStepper.jsx
    │   │   └── StatusBadge.jsx   # confirmed / pending / waitlisted / rejected
    │   ├── event/
    │   │   ├── EventCard.jsx
    │   │   └── EventInfo.jsx
    │   ├── registration/
    │   │   ├── RegistrationForm.jsx    # Step 1（支持 isWaitlisted / isSubmitting）
    │   │   ├── PaymentStep.jsx         # Step 2（wechat_note 大字高亮 + 多支付方式）
    │   │   ├── RegistrationSuccess.jsx # Step 3（普通 / 候补 两种提示）
    │   │   ├── ParticipantList.jsx     # 候补名单独立展示
    │   │   └── BankInfo.jsx
    │   ├── admin/
    │   │   ├── QRUpload.jsx
    │   │   └── ScreenshotModal.jsx
    │   └── layout/
    │       └── Navbar.jsx
    └── pages/
        ├── Home.jsx
        ├── EventPage.jsx               # 含 wasWaitlisted 状态 + 候补路径
        └── admin/
            ├── AdminLogin.jsx          # 密码唯一标识 + adminLogin() Supabase 查表
            ├── AdminEvents.jsx         # 含配额进度 + 组织者列（super 可见）
            ├── AdminEventForm.jsx      # 含 payment_methods / wechat_note / QR 上传
            ├── AdminRegistrations.jsx  # 含候补转正 + 导出 CSV
            └── AdminOrganizers.jsx     # 超管专属：CRUD 组织者账号
```

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
| wechat_note | TEXT | 付款页大字高亮显示（RMB 金额 / 转账备注） |
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
| skill_level | TEXT | `'1'`–`'6'`（中羽等级），可为空 |
| quantity | INTEGER | 1–3 |
| notes | TEXT | |
| payment_status | `'pending'`\|`'confirmed'`\|`'rejected'`\|`'waitlisted'` | |
| payment_screenshot | TEXT | Storage URL |
| created_at | TIMESTAMPTZ | |

---

## 功能完成清单

### 公开页面
- [x] 首页 `/` — 活动列表卡片，名额进度条，组织者信息
- [x] 活动详情 `/events/:id`
  - Step 1：填写名字 / 性别 / 等级 / 人数 / 备注
  - Step 2：支付（微信 QR + wechat_note 大字 / 银行转账 / 免费直接确认）；多支付方式时用户二选一
  - Step 3：成功 or 待确认提示
- [x] **候补队列**：名额满时按钮变为「名额已满，加入候补」；跳过付款步骤直接提交 `waitlisted`；成功页显示候补专属提示
- [x] 报名名单：候补条目独立显示，不计入已报名人数统计

### 管理后台 `/admin`
- [x] **登录**：纯密码（密码即身份）；Supabase 模式查 `organizers` 表；Mock 模式走 `mockUsers`；600ms loading 动画
- [x] **super（超管）**：管理全站所有活动 + 报名；无配额限制；可进入组织者管理页
- [x] **organizer（组织者）**：仅看自己活动（`organizer_id` 过滤）；最多 3 个 active 活动
- [x] **组织者管理页** `/admin/organizers`（超管专属）：新增 / 修改密码 / 删除（有 active 活动时拦截）
- [x] 活动表单：完整字段编辑；组织者角色名字自动锁定；配额超限时按钮置灰
- [x] 报名管理：确认 / 驳回 / 删除 / 查看截图 / 修改人数（只减不增）/ **候补转正**（自动检查名额）/ 导出 CSV
- [x] **全局提交锁**：所有变更按钮带 loading spinner，防止重复点击

---

## dataService.js 暴露的所有函数

```js
// 活动（公开）
getEvents()
getEventById(id)

// 活动（管理后台）
getAdminEvents(user)          // 按 role 过滤
getAllEvents()                 // 全量（legacy）
getOrganizerActiveCount(organizerId)
createEvent(event, user)      // 含配额检查
updateEvent(id, updates)
deleteEvent(id)

// 组织者管理（超管专属）
getOrganizers()
addOrganizer({ name, password })
deleteOrganizer(id)           // HAS_ACTIVE_EVENTS 时返回错误
updateOrganizerPassword(id, newPassword)
adminLogin(password)          // 查 organizers 表，返回 { id, name, role }

// 报名
getRegistrationsByEvent(eventId)
getRegistrationCount(eventId) // 排除 rejected + waitlisted
createRegistration(registration)
updateRegistrationStatus(id, eventId, status)
updateRegistrationQuantity(id, eventId, newQuantity)
deleteRegistration(id)
promoteWaitlistedRegistration(id, eventId)  // NO_SPOTS_AVAILABLE 时返回错误
```

所有函数返回 `{ data, error }` 或 `{ count, error }`，格式与 Mock 时代完全一致。

---

## .env 配置（本地，勿提交）

```
VITE_SUPABASE_URL=https://bpkysafwfdtrolztaxuz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_LPAh9po7pcbNDaXeetVTQA_S8bErK1R
VITE_ADMIN_PASSWORD=admin123   # 已废弃，AdminLogin 现在查 organizers 表
```

---

## 设计系统速查

```
背景色:     #f5f5f7（Apple 灰，非 Tailwind gray-50）
品牌色:     #29aedd（token: bg-brand / text-brand / border-brand）
卡片:       .card（white + multi-layer box-shadow + 1px rgba border）
主按钮:     .btn-primary（min-h 44px，touch-manipulation）
次按钮:     .btn-secondary
输入框:     .input-field（font-size 16px，防 iOS 自动缩放）
Navbar:     rgba(245,245,247,0.85) + backdrop-blur(20px) saturate(180%)
品牌 logo:  #29aedd url(/shuttlecock.png) center/190% no-repeat，rounded-full w-8 h-8
安全区:     env(safe-area-inset-bottom) 用在主页面底部 padding
候补色:     purple-50 / purple-100 / text-purple-600（StatusBadge + 行背景 + 候补计数）
```

---

## 部署（下一步）

推荐 **Vercel**（与 GitHub 仓库直连，最简单）：

1. 打开 [vercel.com](https://vercel.com) → Import Project → 选 `Sydney-Badminton`
2. Framework 自动识别为 **Vite**
3. 在 Environment Variables 里填入：
   ```
   VITE_SUPABASE_URL     = https://bpkysafwfdtrolztaxuz.supabase.co
   VITE_SUPABASE_ANON_KEY = sb_publishable_LPAh9po7pcbNDaXeetVTQA_S8bErK1R
   ```
4. 点 Deploy，完成 ✅

---

## 技术决策记录

| 决策 | 原因 |
|------|------|
| `payment_methods TEXT[]`（数组）替代旧 `payment_method TEXT` | 支持同时开放微信 + 银行两种方式，报名者二选一 |
| `wechat_note` 在付款页大字高亮 | 微信转账需要明确金额和备注，降低操作错误率 |
| 密码即身份（单字段登录） | 无用户枚举风险；每个密码全局唯一（DB 有 unique index） |
| `waitlisted` 状态独立于 `pending` | 语义清晰；不占名额；管理员可精确控制何时转正 |
| `adminLogin()` 在 dataService 内查 DB | 保持与其他 CRUD 一致的接口风格；Mock 模式降级由 AdminLogin 自身处理 |
| `dataService.js` 纯 Supabase，无 useMock | 双模式逻辑已无必要；Mock 路径仅剩 AdminLogin 本身（本地无 .env 时） |
| `promoteWaitlistedRegistration` 用 read-then-write | 简单够用；TODO：生产高并发时换 Postgres RPC 保证原子性 |
| RLS 当前全开放给 anon | 尚未接入 Supabase Auth；TODO：上线后按角色收紧各表权限 |
| Tailwind 自定义 token 只在 JSX 用 | v3 `@apply` 在 `@layer components` 内不解析扩展 token |
| `sessionStorage` 存 admin_user | 关浏览器即失效，简单安全；切 Supabase Auth 时只需改 authService.js |
| `organizer` 字段冗余存名字 | 避免 events 列表每次 JOIN organizers；数据量小，冗余可接受 |
