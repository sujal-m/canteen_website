import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import NotificationBell from './NotificationBell'
import ThemeToggle from './ThemeToggle'

// "/" (the public Home page) is the default landing page after login, so the
// primary nav "Home" link points there instead of the old /dashboard route.
const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Order History' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
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

  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link className="brand" to="/">Campus Canteen</Link>
        <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">Menu</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setOpen(false)}>
              {link.label}{link.to === '/cart' && itemCount > 0 ? ` (${itemCount})` : ''}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions"><ThemeToggle /><NotificationBell /><div className="nav-user">{user?.fullName}</div></div>
      </header>

      <div className="shell-body">
        <aside className="sidebar">
          <img className="sidebar-avatar" src={user?.profilePic || 'https://placehold.co/112x112?text=User'} alt="Profile" />
          <h2>{user?.fullName}</h2>
          <p>{user?.role}</p>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Order History</Link>
          <Link to="/notifications">Notifications</Link>
          <button type="button" onClick={handleLogout}>Logout</button>
        </aside>
        <section className="content-area">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AppLayout
