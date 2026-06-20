import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()

  return (
    <main className="page home-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Campus Canteen</p>
          <h1>Food ordering for students and faculty</h1>
          <p className="hero-copy">Register, verify your email, and manage your canteen profile from one account.</p>
          <div className="actions">
            {user ? <Link className="button primary" to="/dashboard">Go to dashboard</Link> : <Link className="button primary" to="/register">Create account</Link>}
            <Link className="button secondary" to="/login">Login</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home

