/**
 * @typedef {'wechat' | 'bank'} PaymentMethod
 *   'free' is no longer a PaymentMethod value.
 *   A free event is identified by price === 0 (payment_methods can be empty).
 *
 * @typedef {'pending' | 'confirmed' | 'rejected' | 'waitlisted'} PaymentStatus
 * @typedef {'active' | 'completed' | 'cancelled'} EventStatus
 * @typedef {'male' | 'female' | 'other'} Gender
 */

/**
 * Admin organizer account.
 * In Supabase mode this maps to Supabase Auth users + a profiles/roles table.
 *
 * @typedef {Object} OrganizerAccount
 * @property {string} id
 * @property {string} name           - display name shown to registrants
 * @property {string} password       - plaintext (mock only; use hashed in Supabase)
 * @property {'super'|'organizer'} role
 */

/**
 * @typedef {Object} BadmintonEvent
 * @property {string}  id
 * @property {string}  [organizer_id]      - FK → OrganizerAccount.id
 * @property {string}  title
 * @property {string}  [description]
 * @property {string}  date               - YYYY-MM-DD
 * @property {string}  start_time         - HH:mm
 * @property {string}  [end_time]         - HH:mm
 * @property {string}  location
 * @property {number}  max_participants
 * @property {number}  price              - AUD$; 0 = free (no payment needed)
 * @property {PaymentMethod[]} payment_methods
 *   Enabled payment options. Empty array = free event.
 *   Length > 1 = registrant picks one at checkout.
 * @property {string}  [organizer]        - organizer display name (denormalized)
 * @property {string}  [organizer_wechat] - WeChat ID for cancellation contact
 * @property {string}  [wechat_qr]        - base64 or URL
 * @property {string}  [wechat_note]
 *   WeChat transfer note / RMB amount hint.
 *   Displayed PROMINENTLY (large, bold) on the registrant payment screen.
 * @property {string}  [payid]
 * @property {string}  [account_name]
 * @property {string}  [bsb]
 * @property {string}  [account_number]
 * @property {EventStatus} status
 * @property {string}  created_at         - ISO 8601
 */

/**
 * @typedef {Object} Registration
 * @property {string} id
 * @property {string} event_id
 * @property {string} name
 * @property {Gender} gender
 * @property {string} [skill_level]        - '1' – '6'
 * @property {number} quantity             - 1–3
 * @property {string} [notes]
 * @property {PaymentStatus} payment_status
 * @property {string} [payment_screenshot] - base64 or URL
 * @property {string} created_at           - ISO 8601
 */

/**
 * @typedef {{ data: any, error: { message: string } | null }} ServiceResult
 */

export {}
