import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

const passwordChecks = (password) => [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z\d]/.test(password)]

function ResetPassword() {
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const strength = useMemo(() => passwordChecks(form.password).filter(Boolean).length, [form.password])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, form)
      setMessage(data.message)
      setForm({ password: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading"><p className="eyebrow">Password</p><h1>Create new password</h1></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Password<input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <label>Confirm Password<input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required /></label>
          <button className="text-button" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide Password' : 'Show Password'}</button>
          <div className="meter"><span style={{ width: `${strength * 20}%` }} /></div>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</button>
        </form>
        <p className="switch-copy"><Link to="/login">Back to login</Link></p>
      </div>
    </main>
  )
}

export default ResetPassword

