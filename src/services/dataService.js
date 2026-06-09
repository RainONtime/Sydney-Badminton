import { supabase } from './supabase'

// ── helpers ───────────────────────────────────────────────────────────────────

/** Normalise a Supabase error into the { message } shape the app expects. */
function toAppError(sbError) {
  return sbError ? { message: sbError.message || String(sbError) } : null
}

/**
 * Extract the relative file path inside the `payment_screenshots` bucket
 * from a Supabase Storage public URL.
 * Returns null for base64 data URLs, non-storage URLs, or any parse failure.
 */
function extractFilePathFromUrl(url) {
  if (!url || typeof url !== 'string' || url.startsWith('data:')) return null
  try {
    const marker = '/storage/v1/object/public/payment_screenshots/'
    const idx = url.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.slice(idx + marker.length))
  } catch {
    return null
  }
}

/**
 * Attempt to delete a single file from Supabase Storage.
 * Errors are logged as warnings and never re-thrown — they must not block DB ops.
 */
async function deleteStorageFile(url) {
  const path = extractFilePathFromUrl(url)
  if (!path) return
  try {
    const { error } = await supabase.storage
      .from('payment_screenshots')
      .remove([path])
    if (error) console.warn('[storage] remove failed:', path, error.message)
  } catch (e) {
    console.warn('[storage] remove exception:', path, e)
  }
}

// ── Events (public) ───────────────────────────────────────────────────────────

/**
 * Fetch active events for the public home page.
 * Embeds registration data to avoid N+1 queries; computes `registration_count`
 * (excludes rejected + waitlisted) client-side and strips the raw array.
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*, registrations(id, quantity, payment_status)')
    .eq('status', 'active')
    .order('date', { ascending: true })

  if (error) return { data: [], error: toAppError(error) }

  const events = (data || []).map(ev => {
    const regs = ev.registrations || []
    const registration_count = regs
      .filter(r => r.payment_status !== 'rejected' && r.payment_status !== 'waitlisted')
      .reduce((sum, r) => sum + (r.quantity || 1), 0)
    const { registrations: _, ...rest } = ev
    return { ...rest, registration_count }
  })

  return { data: events, error: null }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function getEventById(id) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) return { data: null, error: toAppError(error) }
  if (!data)  return { data: null, error: { message: '活动不存在' } }
  return { data, error: null }
}

// ── Events (admin) ────────────────────────────────────────────────────────────

/**
 * Fetch events for the admin panel, scoped by role.
 * Embeds registration count in a single query (no N+1).
 *
 * @param {{ id: string, role: 'super'|'organizer' }|null} user
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getAdminEvents(user) {
  let query = supabase
    .from('events')
    .select('*, registrations(id, quantity, payment_status)')
    .order('date', { ascending: false })

  if (user?.role === 'organizer') {
    query = query.eq('organizer_id', user.id)
  }

  const { data, error } = await query
  if (error) return { data: [], error: toAppError(error) }

  const events = (data || []).map(ev => {
    const regs = ev.registrations || []
    const registration_count = regs
      .filter(r => r.payment_status !== 'rejected' && r.payment_status !== 'waitlisted')
      .reduce((sum, r) => sum + (r.quantity || 1), 0)
    const { registrations: _, ...rest } = ev
    return { ...rest, registration_count }
  })

  return { data: events, error: null }
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

/**
 * Delete an event and its registrations (CASCADE).
 * Attempts to clean up Supabase Storage files for all registration screenshots
 * before the DB delete. Storage errors are non-fatal.
 */
export async function deleteEvent(id) {
  // Fetch screenshot URLs for all registrations under this event
  const { data: regs } = await supabase
    .from('registrations')
    .select('payment_screenshot')
    .eq('event_id', id)
    .not('payment_screenshot', 'is', null)

  // Batch-remove storage files (non-blocking on error)
  if (regs?.length) {
    const paths = regs
      .map(r => extractFilePathFromUrl(r.payment_screenshot))
      .filter(Boolean)
    if (paths.length) {
      try {
        const { error: stErr } = await supabase.storage
          .from('payment_screenshots')
          .remove(paths)
        if (stErr) console.warn('[storage] batch remove failed:', stErr.message)
      } catch (e) {
        console.warn('[storage] batch remove exception:', e)
      }
    }
  }

  const { error } = await supabase.from('events').delete().eq('id', id)
  return { error: toAppError(error) }
}

// ── Organizer management (super admin only) ───────────────────────────────────

/** @returns {Promise<import('../types').ServiceResult>} */
export async function getOrganizers() {
  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, password, role')
    .eq('role', 'organizer')
    .order('created_at', { ascending: true })
  return { data: data || [], error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function addOrganizer({ name, password }) {
  if (!name?.trim())     return { data: null, error: { message: '名字不能为空' } }
  if (!password?.trim()) return { data: null, error: { message: '密码不能为空' } }

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

/** @returns {Promise<import('../types').ServiceResult>} */
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

/** @returns {Promise<import('../types').ServiceResult>} */
export async function adminLogin(password) {
  const { data, error } = await supabase
    .from('organizers')
    .select('id, name, role')
    .eq('password', password)
    .maybeSingle()
  if (error) return { data: null, error: toAppError(error) }
  if (!data)  return { data: null, error: { message: 'INVALID_PASSWORD' } }
  return { data: { id: data.id, name: data.name, role: data.role }, error: null }
}

// ── User Profiles (Supabase Auth public users) ────────────────────────────────

/**
 * Fetch the profile for a logged-in public user.
 * Returns null (not an error) when no profile row exists yet.
 * @param {string} userId — `session.user.id` from Supabase Auth
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  return { data: data ?? null, error: toAppError(error) }
}

/**
 * Upsert profile fields for a logged-in public user.
 * Supported fields: display_name, gender, contact_info, skill_level, avatar_url.
 * @param {string} userId
 * @param {Partial<{ display_name: string, gender: string, contact_info: string, skill_level: string }>} updates
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data: data ?? null, error: toAppError(error) }
}

// ── Registrations ─────────────────────────────────────────────────────────────

/**
 * Public (slim) — used by EventPage to render the participant list.
 * Excludes payment_screenshot and other privacy/size-heavy fields.
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getRegistrationsByEvent(eventId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id, event_id, name, gender, skill_level, quantity, notes, payment_status, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  return { data: data || [], error: toAppError(error) }
}

/**
 * Admin (full) — used by AdminRegistrations to show all fields including screenshots.
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getAdminRegistrationsByEvent(eventId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
  return { data: data || [], error: toAppError(error) }
}

/**
 * Total booked spots for an event (excludes rejected + waitlisted).
 * Still available for isolated count checks; home/admin pages use embedded counts.
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
  // Silently attach the logged-in user's id; falls back to null for guests
  const { data: { session } } = await supabase.auth.getSession()
  const user_id = session?.user?.id ?? null

  const { data, error } = await supabase
    .from('registrations')
    .insert([{
      ...registration,
      user_id,
      payment_status: registration.payment_status || 'pending',
    }])
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/**
 * Check if a logged-in user already has an active (non-rejected) registration
 * for a given event. Returns null when no such registration exists.
 * @param {string} eventId
 * @param {string} userId — `session.user.id` from Supabase Auth
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function getUserRegistrationForEvent(eventId, userId) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .neq('payment_status', 'rejected')   // rejected → allow re-registration
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()                        // returns null instead of error when empty
  return { data: data ?? null, error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function updateRegistrationStatus(id, _eventId, status) {
  const { data, error } = await supabase
    .from('registrations')
    .update({ payment_status: status })
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/** @returns {Promise<import('../types').ServiceResult>} */
export async function updateRegistrationQuantity(id, _eventId, newQuantity) {
  const { data, error } = await supabase
    .from('registrations')
    .update({ quantity: newQuantity })
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}

/**
 * Delete a registration record.
 * Attempts to remove the payment screenshot from Supabase Storage first.
 * Storage errors are non-fatal — the DB row is always deleted.
 * @returns {Promise<import('../types').ServiceResult>}
 */
export async function deleteRegistration(id) {
  // Fetch screenshot URL before deleting the row
  const { data: reg } = await supabase
    .from('registrations')
    .select('payment_screenshot')
    .eq('id', id)
    .maybeSingle()

  if (reg?.payment_screenshot) {
    await deleteStorageFile(reg.payment_screenshot)
  }

  const { error } = await supabase.from('registrations').delete().eq('id', id)
  return { error: toAppError(error) }
}

/**
 * Promote a waitlisted registration to 'pending'.
 * Validates available spots before promoting.
 */
export async function promoteWaitlistedRegistration(id, eventId) {
  const { data: event, error: evErr } = await supabase
    .from('events')
    .select('max_participants')
    .eq('id', eventId)
    .single()
  if (evErr) return { data: null, error: toAppError(evErr) }

  const { data: reg, error: regErr } = await supabase
    .from('registrations')
    .select('quantity')
    .eq('id', id)
    .single()
  if (regErr) return { data: null, error: toAppError(regErr) }

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

  const { data, error } = await supabase
    .from('registrations')
    .update({ payment_status: 'pending' })
    .eq('id', id)
    .select()
    .single()
  return { data: data || null, error: toAppError(error) }
}
