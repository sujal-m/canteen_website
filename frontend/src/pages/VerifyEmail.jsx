import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Verifying your email...')

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`)
        setStatus('success')
        setMessage(data.message)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed.')
      }
    }

    verify()
  }, [token])

  return (
    <main className="page narrow">
      <div className="surface center-copy">
        <p className="eyebrow">Email Verification</p>
        <h1>{status === 'success' ? 'Verified' : status === 'error' ? 'Link failed' : 'Please wait'}</h1>
        <p className={status === 'error' ? 'alert error' : 'alert success'}>{message}</p>
        <Link className="button primary" to="/login">Go to login</Link>
      </div>
    </main>
  )
}

export default VerifyEmail

