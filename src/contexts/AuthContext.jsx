import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

/**
 * Global Supabase Auth context.
 *
 * Provides `session` and `isAuthLoading` to all consumers.
 * `isAuthLoading` is true until the persisted local session has been read —
 * components that need auth state should hide auth-gated UI until it is false,
 * preventing the "login-button flash" on first render.
 *
 * This context ONLY manages the public-user Supabase Auth session.
 * Admin auth (sessionStorage) is completely independent and unchanged.
 */
const AuthContext = createContext({
  session: null,
  isAuthLoading: true,
})

export function AuthProvider({ children }) {
  const [session,       setSession]       = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    // ── Step 1: read the persisted local token immediately ───────────────
    // This is the key fix: populating state from the cached token before
    // any network round-trip, so the very first render already knows the
    // correct auth state and never shows the wrong UI.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsAuthLoading(false)
    })

    // ── Step 2: keep in sync with subsequent login / logout events ───────
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Also clear loading in case getSession() hasn't resolved yet
      setIsAuthLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Convenience hook — use anywhere inside <AuthProvider>. */
export function useAuth() {
  return useContext(AuthContext)
}
