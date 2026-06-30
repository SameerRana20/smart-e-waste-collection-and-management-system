import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../state/auth.jsx'
import { roleHomePath } from '../../routes/roleHomePath.js'

export function RoleRoute({ allow }) {
  const { role, isAuthed, bootstrapping } = useAuth()

  if (bootstrapping) return null
  // Avoid bouncing to /login during the brief post-login state transition.
  if (isAuthed && !role) return null
  if (!role) return <Navigate to="/login" replace />
  if (Array.isArray(allow) && !allow.includes(String(role).toLowerCase())) {
    return <Navigate to={roleHomePath(role)} replace />
  }
  return <Outlet />
}

