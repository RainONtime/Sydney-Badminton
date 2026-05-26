/**
 * Admin session helpers.
 * Stores the logged-in user as JSON in sessionStorage under the key "admin_user".
 *
 * Shape: { id: string, name: string, role: 'super' | 'organizer' }
 *
 * When Supabase Auth is introduced, swap these helpers to use supabase.auth.*
 * while keeping the same return shape so callers don't need to change.
 *
 * @typedef {{ id: string, name: string, role: 'super'|'organizer' }} AdminUser
 */

/** @returns {AdminUser|null} */
export function getAdminUser() {
  try {
    return JSON.parse(sessionStorage.getItem('admin_user') || 'null')
  } catch {
    return null
  }
}

/** @param {AdminUser} user */
export function setAdminUser(user) {
  sessionStorage.setItem('admin_user', JSON.stringify(user))
}

export function clearAdminUser() {
  sessionStorage.removeItem('admin_user')
}
