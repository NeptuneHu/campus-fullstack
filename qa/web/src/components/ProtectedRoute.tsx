import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { token, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <p className="text-stone-500">正在确认登录状态…</p>
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
