import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearAdminUser } from '../../services/authService'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = location.pathname.startsWith('/admin')

  // Read current user from session — re-evaluated on every render / navigation
  const adminUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('admin_user') || 'null') } catch { return null }
  })()
  const isSuper = adminUser?.role === 'super'

  function handleLogout() {
    clearAdminUser()
    navigate('/admin/login')
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(245,245,247,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(26,50,85,0.1)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-5 flex items-center justify-between" style={{ height: 54 }}>

        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <div
            className="w-8 h-8 rounded-full shrink-0"
            style={{
              background: '#29aedd url(/shuttlecock.png) center / 190% no-repeat',
              boxShadow: '0 1px 3px rgba(26,50,85,0.2), 0 4px 10px rgba(26,50,85,0.15)',
            }}
          />
          <div className="leading-none">
            <p className="leading-none text-gray-950" style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.01em' }}>
              DUODUO
            </p>
            <p className="leading-none mt-[4px]" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', color: '#1a3255', opacity: 0.55 }}>
              BADMINTON
            </p>
          </div>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-1">
          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`btn-ghost text-xs px-3 ${location.pathname === '/admin' ? 'text-gray-950' : 'text-gray-400'}`}
              >
                活动管理
              </Link>
              {isSuper && (
                <Link
                  to="/admin/organizers"
                  className={`btn-ghost text-xs px-3 ${location.pathname === '/admin/organizers' ? 'text-gray-950' : 'text-gray-400'}`}
                >
                  组织者
                </Link>
              )}
              <button onClick={handleLogout} className="btn-ghost text-xs px-3 text-gray-400">
                退出
              </button>
            </>
          ) : (
            <Link to="/admin" className="btn-ghost text-xs px-3 text-gray-400">组织者登录</Link>
          )}
        </div>

      </div>
    </nav>
  )
}
