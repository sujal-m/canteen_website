import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page narrow">
      <div className="surface">
        <div className="page-heading"><p className="eyebrow">Password</p><h1>Reset link</h1></div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          {error && <p className="alert error">{error}</p>}
          {message && <p className="alert success">{message}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
        </form>
        <p className="switch-copy"><Link to="/login">Back to login</Link></p>
      </div>
    </main>
  )
}

export default ForgotPassword

