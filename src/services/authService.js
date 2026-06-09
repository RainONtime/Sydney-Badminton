/**
 * Auth service — wraps Supabase Auth and keeps the legacy admin-session helpers.
 *
 * ADMIN SESSION (unchanged):
 *   getAdminUser / setAdminUser / clearAdminUser
 *   → stored in sessionStorage, used by AdminLogin.jsx and RequireAuth in App.jsx
 *
 * PUBLIC USER AUTH (new — Supabase Auth):
 *   loginWithGoogle   → OAuth redirect via Google
 *   signUpWithEmail   → creates account + triggers handle_new_user() in DB
 *   signInWithEmail   → password login
 *   signOut           → clears Supabase session
 *   getSession        → returns current Supabase session
 *   onAuthStateChange → subscribe to session changes
 */

import { supabase } from './supabase'

// ─── Legacy admin session helpers (kept as-is) ────────────────────────────────

/** @typedef {{ id: string, name: string, role: 'super'|'organizer' }} AdminUser */

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

// ─── Public user auth (Supabase Auth) ─────────────────────────────────────────

/**
 * Google OAuth 一键登录。
 * Supabase 会跳转到 Google 授权页，回调后落地到 redirectTo 地址。
 */
export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/',
    },
  })
  return { data, error }
}

/**
 * 邮箱注册。displayName 会写入 raw_user_meta_data，
 * 触发器 handle_new_user() 会用它初始化 user_profiles.display_name。
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName]
 */
export async function signUpWithEmail(email, password, displayName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: displayName || '羽毛球爱好者' },
    },
  })
  return { data, error }
}

/**
 * 邮箱登录。
 * @param {string} email
 * @param {string} password
 */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * 登出（仅清除 Supabase session；admin sessionStorage 由 clearAdminUser 负责）。
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/** 获取当前 Supabase session（可能为 null）。 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data?.session ?? null, error }
}

/**
 * 订阅 session 变化（登入/登出/Token 刷新）。
 * @param {(event: string, session: object|null) => void} callback
 * @returns {{ subscription: { unsubscribe: () => void } }}
 */
export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return data
}
