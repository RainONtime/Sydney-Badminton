import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { clearAdminUser } from '../../services/authService'

const STORAGE_KEY = 'duoduo-lang'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isAdmin = location.pathname.startsWith('/admin')

  const adminUser = (() => {
    try { return JSON.parse(sessionStorage.getItem('admin_user') || 'null') } catch { return null }
  })()
  const isSuper = adminUser?.role === 'super'

  function handleLogout() {
    clearAdminUser()
    navigate('/admin/login')
  }

  function toggleLang() {
    const next = i18n.language === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(252,250,250,0.90)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(168,139,250,0.14)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-5 flex items-center justify-between" style={{ height: 54 }}>

        {/* Brand mark */}
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <img src="/logo.png" alt="Duoduo Badminton" className="w-9 h-9 shrink-0 transition-transform duration-300 hover:scale-110" />
          <div className="leading-none">
            <p className="leading-none" style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.01em', color: '#4B4552' }}>
              DUODUO
            </p>
            <p className="leading-none mt-[4px]" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', color: '#A88BFA', opacity: 0.75 }}>
              BADMINTON
            </p>
          </div>
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-1">

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="btn-ghost flex items-center gap-1 text-xs px-2.5"
            title={i18n.language === 'zh' ? 'Switch to English' : '切换中文'}
          >
            <Globe size={12} className="shrink-0" strokeWidth={2.5} />
            <span>{i18n.language === 'zh' ? 'EN' : '中'}</span>
          </button>

          <span className="w-px h-4 bg-violet-100 mx-0.5" />

          {isAdmin ? (
            <>
              <Link
                to="/admin"
                className={`btn-ghost text-xs px-3 ${location.pathname === '/admin' ? 'text-violet-500' : ''}`}
              >
                {t('nav.adminEvents')}
              </Link>
              {isSuper && (
                <Link
                  to="/admin/organizers"
                  className={`btn-ghost text-xs px-3 ${location.pathname === '/admin/organizers' ? 'text-violet-500' : ''}`}
                >
                  {t('nav.organizers')}
                </Link>
              )}
              <button onClick={handleLogout} className="btn-ghost text-xs px-3">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/admin" className="btn-ghost text-xs px-3">
              {t('nav.adminLogin')}
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}
