import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

const verificationRequests = new Map()

function VerifyEmail() {
  const { token } = useParams()
  const isActiveRef = useRef(true)
  const [status, setStatus] = useState(() => (token ? 'loading' : 'error'))
  const [message, setMessage] = useState(() => (token ? 'Verifying your email...' : 'Verification failed.'))

  useEffect(() => {
    isActiveRef.current = true

    if (!token) {
      return () => {
        isActiveRef.current = false
      }
    }

    const request = verificationRequests.get(token) ?? api.get(`/auth/verify-email/${token}`)

    if (!verificationRequests.has(token)) {
      verificationRequests.set(token, request)
    }

    request
      .then(({ data }) => {
        if (!isActiveRef.current) return

        setStatus('success')
        setMessage(data.message || 'Email verified successfully.')
      })
      .catch((err) => {
        if (!isActiveRef.current) return

        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed.')
      })
      .finally(() => {
        if (verificationRequests.get(token) === request) {
          verificationRequests.delete(token)
        }
      })

    return () => {
      isActiveRef.current = false
    }
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

