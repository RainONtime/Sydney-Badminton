# Duoduo Badminton — Project State

> 新对话开始前先读这个文件，可以节省大量 context。  
> 最后更新：2026-05-27（多租户权限体系）

---

## 当前状态

| 项目 | 状态 |
|------|------|
| 数据层 | Mock 模式（`src/data/mockData.js`） |
| Supabase | 代码已就绪，填 `.env` 即可切换 |
| 工程化 | ✅ 已完成目录重组 + 组件拆分 |
| 权限体系 | ✅ 多租户：super / organizer 双角色，配额限制 |
| 部署 | 本地开发，`localhost:5173` |

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | |
| Vite | 5 | dev server |
| React Router | v6 | SPA 路由 |
| Tailwind CSS | v3.4 | ⚠️ 见"已知限制" |
| date-fns | v3 | zhCN locale |
| lucide-react | latest | 图标 |
| @supabase/supabase-js | latest | 数据库客户端（待激活） |

**已知 Tailwind 限制**：自定义扩展 token（如 `rounded-btn`）**不能**在 `@layer components` 的 `@apply` 里用，会报错。只能在 JSX className 中使用。CSS 文件里用 arbitrary values（如 `rounded-[10px]`）。

---

## 目录结构

```
src/
├── components/
│   ├── ui/                      # 通用原子组件（跨页面复用）
│   │   ├── LoadingSpinner.jsx
│   │   ├── CopyButton.jsx
│   │   ├── QuantityStepper.jsx
│   │   └── StatusBadge.jsx
│   ├── event/                   # 活动展示
│   │   ├── EventCard.jsx        # 首页卡片（含 organizer 字段）
│   │   └── EventInfo.jsx        # 详情页活动信息块
│   ├── registration/            # 报名流程
│   │   ├── RegistrationForm.jsx # Step 1：填写信息
│   │   ├── RegistrationSuccess.jsx # Step 3：成功/待确认
│   │   ├── PaymentStep.jsx      # Step 2：付款（含 wechat_note）
│   │   ├── BankInfo.jsx         # 银行信息展示 + 复制
│   │   └── ParticipantList.jsx  # 公开报名名单
│   ├── admin/                   # 管理后台专属
│   │   ├── QRUpload.jsx         # 微信二维码上传
│   │   └── ScreenshotModal.jsx  # 付款截图全屏预览
│   └── layout/
│       └── Navbar.jsx           # 顶部导航（iOS 毛玻璃效果）
├── pages/
│   ├── Home.jsx                 # 首页活动列表
│   ├── EventPage.jsx            # 活动详情 + 报名（~100行，已瘦身）
│   └── admin/
│       ├── AdminLogin.jsx
│       ├── AdminEvents.jsx
│       ├── AdminEventForm.jsx   # 含 organizer / wechat_note 字段
│       └── AdminRegistrations.jsx
├── services/                    # 数据访问层
│   ├── dataService.js           # 统一 API（mock/supabase 自动切换）
│   ├── authService.js           # 会话读写工具（getAdminUser / setAdminUser / clearAdminUser）
│   └── supabase.js              # Supabase 客户端
├── data/
│   └── mockData.js              # 本地 mock 数据（含最新字段）
└── types/
    └── index.js                 # JSDoc 类型定义（BadmintonEvent / Registration）
```

---

## 数据模型

### `BadmintonEvent`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | PK |
| title | string | ✅ | 活动名称 |
| description | string | — | 描述 |
| date | string | ✅ | YYYY-MM-DD |
| start_time | string | ✅ | HH:mm |
| end_time | string | — | HH:mm |
| location | string | ✅ | 地点 |
| max_participants | number | ✅ | 最大人数 |
| price | number | ✅ | AUD$，0 = 免费 |
| payment_method | 'free'\|'wechat'\|'bank' | ✅ | |
| **organizer_id** | string | — | FK → mockUsers.id（多租户归属） |
| **organizer** | string | — | 组织者名字（冗余展示用） |
| **organizer_wechat** | string | — | 组织者微信号（取消退款联系方式） |
| wechat_qr | string | — | base64 或 URL |
| **wechat_note** | string | — | 微信转账备注提示 |
| payid | string | — | |
| account_name | string | — | |
| bsb | string | — | |
| account_number | string | — | |
| status | 'active'\|'completed'\|'cancelled' | ✅ | |
| created_at | ISO 8601 | ✅ | |

### `Registration`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✅ | PK |
| event_id | string | ✅ | FK → events.id |
| name | string | ✅ | 微信名 |
| gender | 'male'\|'female'\|'other' | ✅ | |
| skill_level | string | — | '1'–'6'（中羽等级） |
| quantity | number | ✅ | 1–3 |
| notes | string | — | 备注 |
| payment_status | 'pending'\|'confirmed'\|'rejected' | ✅ | |
| payment_screenshot | string | — | base64 或 URL |
| created_at | ISO 8601 | ✅ | |

---

## 功能完成清单

### 公开页面
- [x] 首页 `/` — 活动列表卡片，名额进度条，显示组织者
- [x] 活动详情 `/events/:id`
  - Step 1：填写名字 / 性别 / 等级 / 人数（1–3）/ 备注
  - Step 2：微信二维码（含转账备注）/ 银行转账 / 免费直接确认
  - Step 3：成功 or 等待确认提示
- [x] 报名名单（公开可见，自动隐藏被驳回记录，按性别统计）

### 管理后台 `/admin`
- [x] 登录（密码存 `sessionStorage`，env 可配置）
- [x] **多账号多角色**：`mockUsers` 列表；登录成功存 `{ id, name, role }` 至 `admin_user`
- [x] **super（超管）**：查看 / 编辑 / 删除全站所有活动及报名；无配额限制
- [x] **organizer（组织者）**：仅看到自己的活动（按 `organizer_id` 过滤）；最多同时 3 个 active 活动
- [x] 登录页显示开发模式账号速查表（生产环境可移除）
- [x] 退出登录按钮（清除 `admin_user`）
- [x] 活动列表 — 超管列额外显示「组织者」列；进行中配额进度 `N/3`
- [x] 活动表单 — organizer / organizer_wechat / wechat_note / 三种付款方式 / 微信二维码上传
  - 组织者角色：组织者名字自动锁定（只读），`organizer_id` 自动写入
  - 超管角色：可自由填写组织者名字
  - 新建时：如组织者已达配额，按钮置灰并显示提示
- [x] 报名管理 — 确认 / 驳回 / 删除 / 查看截图 / 导出 CSV / **修改人数**（内联，只减不增）
  - 越权防护：组织者访问不属于自己的活动报名页时，自动跳回活动列表

---

## 设计系统速查

```
背景色:     #f5f5f7（Apple 灰，非 Tailwind gray-50）
品牌色:     #29aedd（Tailwind token: bg-brand / text-brand）
卡片:       .card（white + multi-layer box-shadow + 1px rgba border）
主按钮:     .btn-primary（min-h 44px，touch-manipulation）
次按钮:     .btn-secondary
幽灵按钮:   .btn-ghost
输入框:     .input-field（font-size 16px，防 iOS 自动缩放）
Navbar:     rgba(245,245,247,0.85) + backdrop-blur(20px) saturate(180%)
品牌 logo:  #29aedd url(/shuttlecock.png) center/190% no-repeat，rounded-full w-8 h-8
安全区:     env(safe-area-inset-bottom) 用在主页面底部 padding
```

---

## 下一步：接入 Supabase

**状态**：等待用户提供 Supabase 凭据

**步骤**：
1. 注册 [supabase.com](https://supabase.com)，新建项目（推荐：Singapore 区域）
2. SQL Editor 运行 `supabase/schema.sql`（需同步新增 `organizer` / `wechat_note` 列）
3. 填写 `.env`：
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. 重启 dev server — mock 自动停用

⚠️ `supabase/schema.sql` 需补充以下字段，接 Supabase 时一并处理：
- `events` 表：`organizer`, `organizer_wechat`, `wechat_note`
- `registrations` 表：`quantity`（应已存在，确认无误）

---

## 技术决策记录

| 决策 | 原因 |
|------|------|
| Tailwind 自定义 token 只在 JSX 用，不在 `@apply` 里用 | v3 `@layer components` 内 `@apply` 不解析扩展 token |
| Mock 数据用 module-level 可变对象 | 模拟真实 DB mutation，session 内持久化 |
| 付款截图存 base64 | MVP 无需额外存储服务；接 Supabase Storage 时换 URL |
| `sessionStorage` 存 admin auth | 单管理员，关浏览器即失效，简单够用 |
| `services/dataService.js` 统一封装 | mock/supabase 切换只改 `.env`，页面代码零改动 |
| `authService.js` 单独抽离 | session 读写集中管理，切换 Supabase Auth 时只改此文件 |
| `getAdminEvents(user)` 在 dataService 内过滤 | 业务逻辑不散落在组件层；日后 RLS 上线后可无缝平替 |
| 配额检查在 `createEvent` 内执行 | mock 和 Supabase 模式均有客户端校验；Supabase 侧可加触发器双保险 |
| mock 登录页显示账号速查表 | 开发调试方便；生产部署前删掉该 `{useMock && ...}` 块即可 |
