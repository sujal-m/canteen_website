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
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          {user && (
            <Link className="cart-trigger" to="/cart" aria-label={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'} title={itemCount > 0 ? `Cart, ${itemCount} items` : 'Cart'}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="cart-icon">
                <path d="M3 5h2l1.2 10.2A2 2 0 0 0 8.18 17h8.84a2 2 0 0 0 1.98-1.65L20 8H6.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8.5 21a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 8.5 21Zm8 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" fill="currentColor" />
                <path d="M7.2 8H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              {itemCount > 0 && <strong className="cart-badge">{itemCount}</strong>}
            </Link>
          )}
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
