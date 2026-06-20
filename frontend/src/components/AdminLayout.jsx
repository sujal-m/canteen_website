import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const links = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/notifications', label: 'Notifications' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell admin-shell">
      <header className="top-nav">
        <Link className="brand" to="/admin">Canteen Admin</Link>
        <button className="menu-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">Menu</button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/admin'} onClick={() => setOpen(false)}>{link.label}</NavLink>)}
        </nav>
        <div className="nav-actions"><NotificationBell /><div className="nav-user">{user?.fullName}</div></div>
      </header>
      <div className="shell-body">
        <aside className="sidebar admin-sidebar">
          <p className="eyebrow">Administration</p>
          <h2>{user?.fullName}</h2>
          {links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/admin'}>{link.label}</NavLink>)}
          <button type="button" onClick={handleLogout}>Logout</button>
        </aside>
        <section className="content-area"><Outlet /></section>
      </div>
    </div>
  )
}

export default AdminLayout

