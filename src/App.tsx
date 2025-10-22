import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import ProfileBanner from './components/ProfileBanner'
import FloatingCartButton from './components/FloatingCartButton'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Services from './pages/Services'
import Schedule from './pages/Schedule'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import RequireAdmin from './components/RequireAdmin'
import Start from './pages/Start'
import { useAuthStore } from './store/auth'

function App() {
  const user = useAuthStore((s) => s.user)
  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <NavBar />
      <ProfileBanner />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/" element={user ? <Services /> : <Navigate to="/login" replace />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/start" element={<Start />} />
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </main>
      <FloatingCartButton />
    </div>
  )
}

export default App
