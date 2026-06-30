import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../state/auth.jsx'
import { roleHomePath } from '../../routes/roleHomePath.js'

export function PublicOnlyRoute() {
  const { isAuthed, role, bootstrapping } = useAuth()
  if (bootstrapping) return null
  if (isAuthed) return <Navigate to={roleHomePath(role)} replace />
  return <Outlet />
}

