import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { loginWithGoogle, signInWithEmail, signUpWithEmail } from '../services/authService'

// Google 图标 (inline SVG — 无需额外依赖)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.000 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
    </svg>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  // 'google' | 'email'
  const [mode, setMode] = useState('google')
  // 'signin' | 'signup'
  const [emailMode, setEmailMode] = useState('signin')

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [displayName, setName]      = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [info, setInfo]             = useState('')

  function reset() {
    setError('')
    setInfo('')
  }

  // ── Google OAuth ─────────────────────────────────────────
  async function handleGoogle() {
    reset()
    setLoading(true)
    const { error: err } = await loginWithGoogle()
    if (err) {
      setError(err.message || 'Google 登录失败，请重试')
      setLoading(false)
    }
    // 成功时 Supabase 会跳转到 Google，页面离开，无需 setLoading(false)
  }

  // ── 邮箱登录 / 注册 ──────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault()
    reset()
    setLoading(true)

    if (emailMode === 'signup') {
      const { error: err } = await signUpWithEmail(email, password, displayName)
      if (err) {
        setError(err.message || '注册失败，请检查信息后重试')
      } else {
        setInfo('注册成功！请检查邮箱完成验证，验证后即可登录。')
        setEmail('')
        setPassword('')
        setName('')
      }
    } else {
      const { data, error: err } = await signInWithEmail(email, password)
      if (err) {
        setError(err.message || '邮箱或密码错误')
      } else if (data?.session) {
        navigate(from, { replace: true })
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12">
      {/* 卡片 */}
      <div
        className="w-full max-w-sm bg-white rounded-[2rem] p-8"
        style={{
          boxShadow: '0 8px 40px rgba(168,139,250,0.13), 0 2px 12px rgba(244,114,182,0.08)',
          border: '1px solid rgba(249,168,212,0.25)',
        }}
      >
        {/* 品牌 */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="Duoduo Badminton"
            className="w-20 h-20 mb-4 transition-transform duration-300 hover:scale-105"
          />
          <p className="text-xs font-semibold tracking-widest text-brand opacity-70 uppercase">
            Duoduo Badminton
          </p>
        </div>

        <h1 className="text-xl font-semibold mb-1" style={{ color: '#4B4552' }}>
          欢迎回来 👋
        </h1>
        <p className="text-sm text-gray-400 mb-6">登录以查看和管理您的报名记录</p>

        {/* ── Google 登录 ── */}
        {mode === 'google' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="btn-secondary w-full flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-brand animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {loading ? '跳转中…' : '使用 Google 账号登录'}
            </button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-violet-100" />
              <span className="text-xs text-gray-300">或者</span>
              <span className="flex-1 h-px bg-violet-100" />
            </div>

            <button
              onClick={() => { reset(); setMode('email') }}
              className="btn-ghost w-full text-sm text-gray-400 hover:text-brand"
            >
              使用邮箱登录 / 注册
            </button>
          </div>
        )}

        {/* ── 邮箱表单 ── */}
        {mode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {/* 注册时额外显示昵称 */}
            {emailMode === 'signup' && (
              <input
                type="text"
                className="input-field"
                placeholder="昵称（可选）"
                value={displayName}
                onChange={e => { setName(e.target.value); reset() }}
                autoComplete="nickname"
              />
            )}

            <input
              type="email"
              className="input-field"
              placeholder="邮箱地址"
              required
              value={email}
              onChange={e => { setEmail(e.target.value); reset() }}
              autoComplete="email"
              autoFocus
            />

            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="密码"
                required
                minLength={6}
                value={password}
                onChange={e => { setPassword(e.target.value); reset() }}
                autoComplete={emailMode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-brand transition-colors"
                tabIndex={-1}
                aria-label={showPwd ? '隐藏密码' : '显示密码'}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && <p className="text-xs text-rose-400 px-1">{error}</p>}
            {info  && <p className="text-xs text-green-500 px-1">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              )}
              {loading
                ? (emailMode === 'signup' ? '注册中…' : '登录中…')
                : (emailMode === 'signup' ? '创建账号' : '登录')}
            </button>

            {/* 切换注册 / 登录 */}
            <p className="text-center text-xs text-gray-400 pt-1">
              {emailMode === 'signin' ? (
                <>
                  还没有账号？{' '}
                  <button
                    type="button"
                    onClick={() => { setEmailMode('signup'); reset() }}
                    className="text-brand font-medium hover:underline"
                  >
                    立即注册
                  </button>
                </>
              ) : (
                <>
                  已有账号？{' '}
                  <button
                    type="button"
                    onClick={() => { setEmailMode('signin'); reset() }}
                    className="text-brand font-medium hover:underline"
                  >
                    直接登录
                  </button>
                </>
              )}
            </p>

            <button
              type="button"
              onClick={() => { reset(); setMode('google') }}
              className="btn-ghost w-full text-xs text-gray-300 mt-1"
            >
              ← 返回 Google 登录
            </button>
          </form>
        )}

        {/* 管理员入口 */}
        <p className="text-center text-[11px] text-gray-300 mt-8">
          组织者？{' '}
          <Link to="/admin/login" className="hover:text-brand transition-colors">
            进入管理后台
          </Link>
        </p>
      </div>
    </div>
  )
}
