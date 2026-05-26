/**
 * Mock organizer accounts.
 * In Supabase mode these will be replaced by Supabase Auth users.
 * role: 'super'     → full access, no quota limit
 * role: 'organizer' → can only see/edit own events, max 3 active at once
 *
 * Passwords must be unique — login lookup uses find-by-password.
 *
 * @type {import('../types').OrganizerAccount[]}
 */
export const mockUsers = [
  { id: 'super_1', name: '超级管理员', password: 'super2024', role: 'super' },
  { id: 'org_1',   name: '小明',       password: 'ming123',   role: 'organizer' },
  { id: 'org_2',   name: '小红',       password: 'hong123',   role: 'organizer' },
  { id: 'org_3',   name: '阿杰',       password: 'jie123',    role: 'organizer' },
]

/** @type {import('../types').BadmintonEvent[]} */
export const mockEvents = [
  {
    id: '1',
    organizer_id: 'org_1',
    title: '周六混双友谊赛',
    description: '以双打练习为主，欢迎新朋友加入！赛后一起吃饭。',
    date: '2026-06-07',
    start_time: '09:00',
    end_time: '12:00',
    location: '阳光体育中心 3号馆',
    max_participants: 4,
    price: 30,
    status: 'active',
    organizer: '小明',
    organizer_wechat: 'MingBadminton',
    // Both wechat + bank enabled → registrant picks one at checkout (demo of multi-method)
    payment_methods: ['wechat', 'bank'],
    wechat_qr: null,
    wechat_note: '¥138（约 AUD$30，请备注：周六羽毛球 + 你的名字）',
    payid: 'ming@email.com',
    account_name: 'Ming Chen',
    bsb: '063-000',
    account_number: '9876 5432',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    organizer_id: 'org_2',
    title: '初学者入门训练营',
    description: '专为零基础球友设计，有专业教练指导握拍、步伐和基本技术。',
    date: '2026-06-08',
    start_time: '14:00',
    end_time: '16:00',
    location: '城北羽毛球馆',
    max_participants: 12,
    price: 50,
    status: 'active',
    organizer: '小红',
    organizer_wechat: 'HongCoach',
    payment_methods: ['bank'],
    wechat_qr: null,
    wechat_note: '',
    payid: 'duoduo@email.com',
    account_name: 'Duo Duo Sports',
    bsb: '063-000',
    account_number: '1234 5678',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    organizer_id: 'org_3',
    title: '周日自由拍练',
    description: '无固定安排，大家自由对打，平摊场地费即可。',
    date: '2026-06-14',
    start_time: '19:00',
    end_time: '21:30',
    location: '汇德羽毛球俱乐部',
    max_participants: 20,
    price: 25,
    status: 'active',
    organizer: '阿杰',
    organizer_wechat: 'JieBadminton',
    payment_methods: ['wechat'],
    wechat_qr: null,
    wechat_note: '¥115（约 AUD$25）',
    payid: '',
    account_name: '',
    bsb: '',
    account_number: '',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    organizer_id: 'org_3',
    title: '高水平单打挑战赛',
    description: '单打对抗，积分制赛制，胜者组和败者组双循环。',
    date: '2026-06-15',
    start_time: '10:00',
    end_time: '14:00',
    location: '精英体育馆 VIP馆',
    max_participants: 8,
    price: 0,
    status: 'active',
    organizer: '阿杰',
    organizer_wechat: 'JieBadminton',
    payment_methods: [],        // price = 0 → free, no payment method needed
    wechat_qr: null,
    wechat_note: '',
    payid: '',
    account_name: '',
    bsb: '',
    account_number: '',
    created_at: new Date().toISOString(),
  },
]

/** @type {Record<string, import('../types').Registration[]>} */
export const mockRegistrations = {
  '1': [
    { id: 'r1', event_id: '1', name: '小明',  gender: 'male',   skill_level: '4', quantity: 1, notes: '',         payment_status: 'confirmed',  payment_screenshot: null, created_at: new Date().toISOString() },
    { id: 'r2', event_id: '1', name: '阿杰',  gender: 'male',   skill_level: '5', quantity: 2, notes: '带朋友一起', payment_status: 'confirmed',  payment_screenshot: null, created_at: new Date().toISOString() },
    { id: 'r3', event_id: '1', name: '晓燕',  gender: 'female', skill_level: '3', quantity: 1, notes: '',         payment_status: 'pending',    payment_screenshot: null, created_at: new Date().toISOString() },
    { id: 'r_w1', event_id: '1', name: '大壮', gender: 'male',  skill_level: '4', quantity: 1, notes: '',         payment_status: 'waitlisted', payment_screenshot: null, created_at: new Date().toISOString() },
  ],
  '2': [
    { id: 'r4', event_id: '2', name: '小红',  gender: 'female', skill_level: '1', quantity: 1, notes: '完全零基础', payment_status: 'confirmed', payment_screenshot: null, created_at: new Date().toISOString() },
  ],
  '3': [],
  '4': [
    { id: 'r5', event_id: '4', name: '阿强',  gender: 'male',   skill_level: '6', quantity: 1, notes: '', payment_status: 'confirmed', payment_screenshot: null, created_at: new Date().toISOString() },
    { id: 'r6', event_id: '4', name: '小明',  gender: 'male',   skill_level: '6', quantity: 1, notes: '', payment_status: 'pending',   payment_screenshot: null, created_at: new Date().toISOString() },
  ],
}
