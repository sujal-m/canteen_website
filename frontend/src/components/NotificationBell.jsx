import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const formatTime = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function NotificationBell() {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)

  const orderPath = (notification) => user?.role === 'admin' && notification.type === 'admin_new_order' ? '/admin/orders' : '/orders'

  return (
    <div className="notification-wrap">
      <button
        className={unreadCount > 0 ? 'notification-trigger has-unread' : 'notification-trigger'}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="bell-icon">
          <path d="M18 15.2V11a6 6 0 0 0-5-5.917V4a1 1 0 1 0-2 0v1.083A6 6 0 0 0 6 11v4.2c0 .379-.146.744-.407 1.017L4.3 17.55A1 1 0 0 0 5 19.25h14a1 1 0 0 0 .7-1.7l-1.293-1.334A1.45 1.45 0 0 1 18 15.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9.5 21a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && <strong className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</strong>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-head">
            <h2>Notifications</h2>
            <button type="button" onClick={markAllRead} disabled={unreadCount === 0}>Mark all read</button>
          </div>
          {error && <p className="notification-status error">{error}</p>}
          {loading && notifications.length === 0 ? <p className="notification-status">Loading notifications...</p> : notifications.length === 0 ? (
            <p className="notification-status">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <Link
                  className={notification.read ? 'notification-item' : 'notification-item unread'}
                  key={notification._id}
                  to={orderPath(notification)}
                  onClick={() => {
                    setOpen(false)
                    if (!notification.read) markRead(notification._id)
                  }}
                >
                  <span>
                    <strong>{notification.title}</strong>
                    <small>{formatTime(notification.createdAt)}</small>
                  </span>
                  <p>{notification.message}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
