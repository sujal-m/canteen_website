import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

// Shared shell for guests and logged-in users. "/" (Home) is the default
// landing page and now carries the full app layout (Dashboard was folded
// into it), so both audiences see the same nav, sidebar, bell, and toggle.
const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/cart', label: 'Cart', authOnly: true },
  { to: '/orders', label: 'Order History', authOnly: true },
  { to: '/notifications', label: 'Notifications', authOnly: true },
  { to: '/profile', label: 'Profile', authOnly: true },
]

function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const visibleLinks = navLinks.filter((link) => !link.authOnly || user)

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">Campus Canteen</Link>
        <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">Menu</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}>
              {link.label}{link.to === '/cart' && itemCount > 0 ? ` (${itemCount})` : ''}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? (
            <div className="nav-user">{user.fullName}</div>
          ) : (
            <div className="guest-actions">
              <Link className="button secondary" to="/login">Login</Link>
              <Link className="button primary" to="/register">Register</Link>
            </div>
          )}
        </div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          {user ? (
            <>
              <img className="sidebar-avatar" src={user.profilePic || 'https://placehold.co/112x112?text=User'} alt="Profile" />
              <h2>{user.fullName}</h2>
              <p>{user.role}</p>
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/orders">Order History</Link>
              <Link to="/notifications">Notifications</Link>
              <button type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <img className="sidebar-avatar" src="https://placehold.co/112x112?text=Guest" alt="Guest" />
              <h2>Welcome, Guest</h2>
              <p>Browsing</p>
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </aside>
        <section className="content-area">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AppLayout
