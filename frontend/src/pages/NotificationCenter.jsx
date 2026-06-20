import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const formatTime = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

function NotificationCenter() {
  const { user } = useAuth()
  const { notifications, unreadCount, loading, error, markRead, markAllRead, fetchNotifications } = useNotifications()
  const orderPath = (notification) => user?.role === 'admin' && notification.type === 'admin_new_order' ? '/admin/orders' : user?.role === 'admin' ? '/admin/orders' : '/orders'

  return (
    <main className="page narrow">
      <div className="section-heading">
        <div><p className="eyebrow">Updates</p><h1>Notification Center</h1></div>
        <div className="actions">
          <button className="button secondary" type="button" onClick={fetchNotifications}>Refresh</button>
          <button className="button primary" type="button" onClick={markAllRead} disabled={unreadCount === 0}>Mark all read</button>
        </div>
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading && notifications.length === 0 ? <p className="status">Loading notifications...</p> : notifications.length === 0 ? (
        <div className="surface center-copy"><h2>No notifications yet</h2><p className="muted">Order updates will appear here.</p></div>
      ) : (
        <div className="notification-center-list">
          {notifications.map((notification) => (
            <article className={notification.read ? 'notification-center-item' : 'notification-center-item unread'} key={notification._id}>
              <div>
                <p className="eyebrow">{formatTime(notification.createdAt)}</p>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
              </div>
              <div className="actions">
                {!notification.read && <button className="button secondary" type="button" onClick={() => markRead(notification._id)}>Mark read</button>}
                <Link className="button primary" to={orderPath(notification)}>View orders</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default NotificationCenter
