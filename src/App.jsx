import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import EventPage from './pages/EventPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminEvents from './pages/admin/AdminEvents'
import AdminEventForm from './pages/admin/AdminEventForm'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminOrganizers from './pages/admin/AdminOrganizers'

function RequireAuth({ children }) {
  const location = useLocation()
  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('admin_user') || 'null') } catch { return null }
  })()
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventPage />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAuth><AdminEvents /></RequireAuth>} />
          <Route path="/admin/events/new" element={<RequireAuth><AdminEventForm /></RequireAuth>} />
          <Route path="/admin/events/:id/edit" element={<RequireAuth><AdminEventForm /></RequireAuth>} />
          <Route path="/admin/events/:id/registrations" element={<RequireAuth><AdminRegistrations /></RequireAuth>} />
          <Route path="/admin/organizers" element={<RequireAuth><AdminOrganizers /></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
