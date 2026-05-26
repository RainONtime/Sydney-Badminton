import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { mockUsers } from '../../data/mockData'
import { setAdminUser } from '../../services/authService'
import { adminLogin } from '../../services/dataService'

const useMock = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'

function ShuttlecockIcon({ className }) {
  return (
    <svg className={className} width="20" height="22" viewBox="0 0 16 18" fill="none">
      <circle cx="8" cy="15.5" r="2.2" fill="currentColor" />
      <line x1="8" y1="13.3" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="8.5" x2="1.5" y2="2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="8.5" x2="4.5" y2="1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="8.5" x2="8" y2="0.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="8.5" x2="11.5" y2="1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8" y1="8.5" x2="14.5" y2="2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M1.5 2 Q8 -0.5 14.5 2" stroke="currentColor" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function AdminLogin() {
  const [password, setPassword]     = useState('')
  const [visible, setVisible]       = useState(false)
  const [error, setError]           = useState('')
  const [isSubmitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))

    if (useMock) {
      const match = mockUsers.find(u => u.password === password)
      if (match) {
        setAdminUser({ id: match.id, name: match.name, role: match.role })
        navigate('/admin')
        return
      }
    } else {
      // Supabase mode: look up password in organizers table
      const { data, error: loginErr } = await adminLogin(password)
      if (data && !loginErr) {
        setAdminUser({ id: data.id, name: data.name, role: data.role })
        navigate('/admin')
        return
      }
    }

    setSubmitting(false)
    setError('密码错误，请联系管理员')
    setPassword('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-xs">

        <div className="flex items-center gap-2 mb-10">
          <ShuttlecockIcon className="text-gray-950" />
          <span className="font-semibold text-sm tracking-tight text-gray-950">Duoduo Badminton</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-950 mb-1">组织者登录</h1>
        <p className="text-sm text-gray-400 mb-7">请输入您的专属通行码</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Password field with visibility toggle */}
          <div className="relative">
            <input
              type={visible ? 'text' : 'password'}
              className="input-field pr-10"
              placeholder="专属通行码"
              value={password}
              autoFocus
              autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); setError('') }}
            />
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={visible ? '隐藏密码' : '显示密码'}
            >
              {visible ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            )}
            {isSubmitting ? '验证中…' : '登录'}
          </button>
        </form>

      </div>
    </div>
  )
}
