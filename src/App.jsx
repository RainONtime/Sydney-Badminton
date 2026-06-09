import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import EventPage from './pages/EventPage'
import Login from './pages/Login'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Profile page — lazy-loaded (only pulled in when user navigates to /profile)
const Profile = lazy(() => import('./pages/Profile'))

// Admin pages — lazy-loaded so public users never download admin code
const AdminLogin         = lazy(() => import('./pages/admin/AdminLogin'))
const AdminEvents        = lazy(() => import('./pages/admin/AdminEvents'))
const AdminEventForm     = lazy(() => import('./pages/admin/AdminEventForm'))
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'))
const AdminOrganizers    = lazy(() => import('./pages/admin/AdminOrganizers'))

// Admin route guard — reads the sessionStorage set by AdminLogin
function RequireAuth({ children }) {
  const location = useLocation()
  const user = (() => {
    try { return JSON.parse(sessionStorage.getItem('admin_user') || 'null') } catch { return null }
  })()
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />
  return children
}

const AdminFallback = (
  <div className="min-h-[70vh] flex items-center justify-center">
    <LoadingSpinner />
  </div>
)

export default function App() {
  return (
    <AuthProvider>
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Routes>
          {/* Public — eagerly loaded */}
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventPage />} />
          <Route path="/login" element={<Login />} />

          {/* Profile — lazy loaded */}
          <Route path="/profile" element={
            <Suspense fallback={AdminFallback}><Profile /></Suspense>
          } />

          {/* Admin — lazy loaded, isolated chunk */}
          <Route path="/admin/login" element={
            <Suspense fallback={AdminFallback}><AdminLogin /></Suspense>
          } />
          <Route path="/admin" element={
            <RequireAuth>
              <Suspense fallback={AdminFallback}><AdminEvents /></Suspense>
            </RequireAuth>
          } />
          <Route path="/admin/events/new" element={
            <RequireAuth>
              <Suspense fallback={AdminFallback}><AdminEventForm /></Suspense>
            </RequireAuth>
          } />
          <Route path="/admin/events/:id/edit" element={
            <RequireAuth>
              <Suspense fallback={AdminFallback}><AdminEventForm /></Suspense>
            </RequireAuth>
          } />
          <Route path="/admin/events/:id/registrations" element={
            <RequireAuth>
              <Suspense fallback={AdminFallback}><AdminRegistrations /></Suspense>
            </RequireAuth>
          } />
          <Route path="/admin/organizers" element={
            <RequireAuth>
              <Suspense fallback={AdminFallback}><AdminOrganizers /></Suspense>
            </RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
    </AuthProvider>
  )
}
