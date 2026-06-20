import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()

  if (loading) return <main className="page"><p className="status">Checking session...</p></main>
  if (!user) return <Navigate to="/login" replace />
  if (roles?.length && !roles.includes(user.role)) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />

  return <Outlet />
}

export default ProtectedRoute


