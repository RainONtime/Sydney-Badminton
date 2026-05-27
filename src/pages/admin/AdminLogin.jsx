import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { mockUsers } from '../../data/mockData'
import { setAdminUser } from '../../services/authService'
import { adminLogin } from '../../services/dataService'

const useMock = !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'


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

        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-full bg-brand mb-4"
            style={{ backgroundImage: 'url(/shuttlecock.png)', backgroundSize: '190%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
          />
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
