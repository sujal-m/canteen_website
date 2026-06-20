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
      <button className="notification-trigger" type="button" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
        <span aria-hidden="true">Bell</span>
        {unreadCount > 0 && <strong>{unreadCount > 9 ? '9+' : unreadCount}</strong>}
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
