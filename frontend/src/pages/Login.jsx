import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const dashboardPath = (role) => role === 'admin' ? '/admin' : '/dashboard'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(form)
      navigate(dashboardPath(user.role), { replace: true })
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



