import { Link, useLocation, useNavigate } from 'react-router-dom'


export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAdmin = location.pathname.startsWith('/admin')

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    navigate('/')
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
          {/* Icon badge — brand blue */}
          <div className="w-8 h-8 rounded-full shrink-0"
            style={{
              background: '#29aedd url(/shuttlecock.png) center / 190% no-repeat',
              boxShadow: '0 1px 3px rgba(26,50,85,0.2), 0 4px 10px rgba(26,50,85,0.15)',
            }}
          ></div>

          {/* Wordmark */}
          <div className="leading-none">
            <p className="leading-none text-gray-950"
               style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.01em' }}>
              DUODUO
            </p>
            <p className="leading-none mt-[4px]"
               style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', color: '#1a3255', opacity: 0.55 }}>
              BADMINTON
            </p>
          </div>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-1">
          {isAdmin ? (
            <>
              <Link to="/admin" className="btn-ghost text-xs px-3">活动管理</Link>
              <button onClick={handleLogout} className="btn-ghost text-xs px-3 text-gray-400">退出</button>
            </>
          ) : (
            <Link to="/admin" className="btn-ghost text-xs px-3 text-gray-400">组织者登录</Link>
          )}
        </div>

      </div>
    </nav>
  )
}
