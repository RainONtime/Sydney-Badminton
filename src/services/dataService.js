import { supabase } from './supabase'

// ── helpers ───────────────────────────────────────────────────────────────────

/** Normalise a Supabase error into the { message } shape the app expects. */
function toAppError(sbError) {
  return sbError ? { message: sbError.message || String(sbError) } : null
}

// ── Events (public) ───────────────────────────────────────────────────────────

/** @returns {Promise<import('../types').ServiceResult>} */
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'active')
    .order('date', { ascending: true })
  return { data: data || [], error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) return { data: null, error: toAppError(error) }
  if (!data) return { data: null, error: { message: '活动不存在' } }
  return { data, error: null }
}

// ── Events (admin) ────────────────────────────────────────────────────────────

/**
 * Fetch events for the admin panel, scoped by role.
 * - super: all events
 * - organizer: only events where organizer_id === user.id
 *
 * NOTE: In Supabase this is enforced client-side (anon key).
 * Once Supabase Auth is wired up, add a matching RLS policy so
 * the server also enforces it.
 *
 * @param {{ id: string, role: 'super'|'organizer' }|null} user
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getAdminEvents(user) {
  let query = supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })

  if (user?.role === 'organizer') {
    query = query.eq('organizer_id', user.id)
  }

  const { data, error } = await query
  return { data: data || [], error: toAppError(error) }
}

/** Legacy — prefer getAdminEvents(user) in admin pages. */
export async function getAllEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false })
  return { data: data || [], error: toAppError(error) }
}

/**
 * Count of active events for a given organizer (quota enforcement).
 * @param {string} organizerId
 * @returns {Promise<{ count: number, error: any }>}
 */
export async function getOrganizerActiveCount(organizerId) {
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organizer_id', organizerId)
    .eq('status', 'active')
  return { count: count ?? 0, error: toAppError(error) }
}

/**
 * Create a new event.
 * For organizer role, enforces a max of 3 simultaneous active events.
 * @param {object} event
 * @param {{ id: string, role: 'super'|'organizer' }|null} [user]
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function createEvent(event, user = null) {
  if (user?.role === 'organizer') {
    const { count } = await getOrganizerActiveCount(user.id)
    if (count >= 3) return { data: null, error: { message: 'QUOTA_EXCEEDED' } }
  }

  const payload = {
    ...event,
    organizer_id: user?.role === 'organizer' ? user.id : (event.organizer_id || null),
  }
  // Strip client-side-only fields that aren't in the DB schema
  delete payload.id
  delete payload.created_at

  const { data, error } = await supabase
    .from('events')
    .insert([payload])
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function updateEvent(id, updates) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function deleteEvent(id) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  return { error: toAppError(error) }
}

// ── Organizer management (super admin only) ───────────────────────────────────

/**
 * List all organizer accounts (role === 'organizer').
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getOrganizers() {
  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, password, role')
    .eq('role', 'organizer')
    .order('created_at', { ascending: true })
  return { data: data || [], error: toAppError(error) }
}

/**
 * Add a new organizer account.
 * Enforces unique passwords (required for password-based login lookup).
 * @param {{ name: string, password: string }} param0
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function addOrganizer({ name, password }) {
  if (!name?.trim())     return { data: null, error: { message: '名字不能为空' } }
  if (!password?.trim()) return { data: null, error: { message: '密码不能为空' } }

  // Duplicate-password check (unique index also enforces this server-side)
  const { data: existing } = await supabase
    .from('organizers')
    .select('id')
    .eq('password', password)
    .maybeSingle()
  if (existing) return { data: null, error: { message: '该密码已被其他账号使用，请换一个' } }

  const { data, error } = await supabase
    .from('organizers')
    .insert([{ name: name.trim(), password: password.trim(), role: 'organizer' }])
    .select('id, name, password, role')
    .single()
  return { data: data || null, error: toAppError(error) }
}

/**
 * Delete an organizer account.
 * Blocked if the organizer still has active events.
 * Returns { error: { message: 'HAS_ACTIVE_EVENTS', count: N } } when blocked.
 * @param {string} id
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function deleteOrganizer(id) {
  const { count, error: countErr } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organizer_id', id)
    .eq('status', 'active')
  if (countErr) return { error: toAppError(countErr) }
  if (count > 0) return { error: { message: 'HAS_ACTIVE_EVENTS', count } }

  const { error } = await supabase.from('organizers').delete().eq('id', id)
  return { error: toAppError(error) }
}

/**
 * Update an organizer's login password.
 * Enforces unique passwords across all accounts.
 * @param {string} id
 * @param {string} newPassword
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function updateOrganizerPassword(id, newPassword) {
  if (!newPassword?.trim()) return { error: { message: '密码不能为空' } }

  const { data: conflict } = await supabase
    .from('organizers')
    .select('id')
    .eq('password', newPassword)
    .neq('id', id)
    .maybeSingle()
  if (conflict) return { error: { message: '该密码已被其他账号使用，请换一个' } }

  const { error } = await supabase
    .from('organizers')
    .update({ password: newPassword.trim() })
    .eq('id', id)
  return { error: toAppError(error) }
}

/**
 * Look up an organizer by password (client-side auth).
 * Returns { data: { id, name, role }, error }.
 *
 * Called by AdminLogin.jsx in Supabase mode instead of the mock mockUsers.find().
 * Wire it up in AdminLogin's non-mock branch:
 *   const { data, error } = await adminLogin(password)
 *
 * TODO: Replace with Supabase Auth (email + hashed password) before
 * going live. Plaintext passwords + anon key = anyone can read all passwords.
 *
 * @param {string} password
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function adminLogin(password) {
  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, role')
    .eq('password', password)
    .maybeSingle()
  if (error)  return { data: null, error: toAppError(error) }
  if (!data)  return { data: null, error: { message: 'INVALID_PASSWORD' } }
  return { data: { id: data.id, name: data.name, role: data.role }, error: null }
}

// ── Registrations ─────────────────────────────────────────────────────────────

/** @returns {Promise<import('../types').ServiceResult>} */
export async function getRegistrationsByEvent(eventId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  return { data: data || [], error: toAppError(error) }
}

/**
 * Total booked spots for an event (excludes rejected + waitlisted).
 * @returns {Promise<{ count: number, error: any }>}
 */
export async function getRegistrationCount(eventId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('quantity')
    .eq('event_id', eventId)
    .neq('payment_status', 'rejected')
    .neq('payment_status', 'waitlisted')
  const count = error ? 0 : data.reduce((sum, r) => sum + (r.quantity || 1), 0)
  return { count, error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function createRegistration(registration) {
  const { data, error } = await supabase
    .from('registrations')
    .insert([{
      ...registration,
      payment_status: registration.payment_status || 'pending',
    }])
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/**
 * Update a registration's payment_status.
 * eventId param is kept for API compatibility with the mock version.
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function updateRegistrationStatus(id, _eventId, status) {
  const { data, error } = await supabase
    .from('registrations')
    .update({ payment_status: status })
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/**
 * Reduce a registration's quantity (partial cancellation).
 * newQuantity must be ≥ 1; use deleteRegistration for full cancellation.
 * eventId param is kept for API compatibility with the mock version.
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function updateRegistrationQuantity(id, _eventId, newQuantity) {
  const { data, error } = await supabase
    .from('registrations')
    .update({ quantity: newQuantity })
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function deleteRegistration(id) {
  const { error } = await supabase.from('registrations').delete().eq('id', id)
  return { error: toAppError(error) }
}

/**
 * Promote a waitlisted registration to 'pending'.
 * Validates that the event still has available spots before promoting.
 * Returns { error: { message: 'NO_SPOTS_AVAILABLE' } } if the event is full.
 *
 * Note: this is a read-then-write sequence, not an atomic transaction.
 * For a fully race-safe implementation, use a Postgres function (RPC) instead.
 * TODO: replace with supabase.rpc('promote_waitlisted', { reg_id, event_id })
 *
 * @param {string} id        - registration id to promote
 * @param {string} eventId
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function promoteWaitlistedRegistration(id, eventId) {
  // 1. Fetch event capacity
  const { data: event, error: evErr } = await supabase
    .from('events')
    .select('max_participants')
    .eq('id', eventId)
    .single()
  if (evErr) return { data: null, error: toAppError(evErr) }

  // 2. Fetch the target registration's quantity
  const { data: reg, error: regErr } = await supabase
    .from('registrations')
    .select('quantity')
    .eq('id', id)
    .single()
  if (regErr) return { data: null, error: toAppError(regErr) }

  // 3. Count currently booked spots (exclude rejected + waitlisted)
  const { data: booked, error: bookErr } = await supabase
    .from('registrations')
    .select('quantity')
    .eq('event_id', eventId)
    .neq('payment_status', 'rejected')
    .neq('payment_status', 'waitlisted')
  if (bookErr) return { data: null, error: toAppError(bookErr) }

  const bookedCount = booked.reduce((sum, r) => sum + (r.quantity || 1), 0)
  if (bookedCount + (reg.quantity || 1) > event.max_participants) {
    return { data: null, error: { message: 'NO_SPOTS_AVAILABLE' } }
  }

  // 4. Promote
  const { data, error } = await supabase
    .from('registrations')
    .update({ payment_status: 'pending' })
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}
