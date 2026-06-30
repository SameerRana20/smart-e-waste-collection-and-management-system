import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/auth.jsx'

export function ProtectedRoute() {
  const { isAuthed, bootstrapping } = useAuth()
  const location = useLocation()

  if (bootstrapping) return null
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

