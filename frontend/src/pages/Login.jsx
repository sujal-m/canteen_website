import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Home ("/") is the default landing page after login. If the user was
// redirected here from a protected route (or prompted to log in from a
// guest "Add to Cart" click), we send them back to that page instead.
const defaultDestination = (role, from) => {
  if (from && from !== '/login') return from
  return role === 'admin' ? '/admin' : '/'
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectMessage = location.state?.message
  const from = location.state?.from

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(form)
      navigate(defaultDestination(user.role, from), { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading">
          <p className="eyebrow">Login</p>
          <h1>Welcome back</h1>
        </div>
        {redirectMessage && <p className="alert info">{redirectMessage}</p>}
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="text-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide Password' : 'Show Password'}</button>
          <label className="check-row"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember Me</label>
          {error && <p className="alert error">{error}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="split-links"><Link to="/forgot-password">Forgot password?</Link><Link to="/register">Create account</Link></div>
      </div>
    </main>
  )
}

export default Login



