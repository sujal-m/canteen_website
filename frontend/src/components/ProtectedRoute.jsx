import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <main className="page"><p className="status">Checking session...</p></main>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (roles?.length && !roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />

  return <Outlet />
}

export default ProtectedRoute


