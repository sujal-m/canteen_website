import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../context/OrderContext'
import { uiCategories } from '../utils/menuHelpers'

// Featured Items and Popular Dishes now live on the public Home page
// ("/", the default landing page after login). Dashboard remains a
// personalized quick-access hub for logged-in students/faculty.
function Dashboard() {
  const { user } = useAuth()
  const { orders } = useOrders()
  const recentOrders = orders?.slice(0, 3) || []

  return (
    <main className="page dashboard-page">
      <section className="welcome-band">
        <p className="eyebrow">Welcome</p>
        <h1>Welcome, {user.fullName}</h1>
        <p>Browse the campus menu, manage your cart, and keep your profile ready for pickup.</p>
        <div className="actions"><Link className="button primary" to="/menu">Explore menu</Link><Link className="button secondary" to="/cart">View cart</Link></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Categories</h2></div>
        <div className="category-grid">{uiCategories.filter((category) => category !== 'All').map((category) => <Link key={category} to={`/menu?category=${encodeURIComponent(category)}`}>{category}</Link>)}</div>
      </section>

      {recentOrders.length > 0 && (
        <section className="section-block">
          <div className="section-heading"><h2>Recent Orders</h2><Link to="/orders">View all</Link></div>
          <div className="order-list">
            {recentOrders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-card-head">
                  <div><p className="eyebrow">{order.orderNumber}</p><h2>{order.items.length} item(s)</h2></div>
                  <span className="status-badge received">{order.status}</span>
                </div>
                <div className="order-card-foot"><strong>Total: Rs. {order.totalAmount}</strong><Link className="button secondary" to={`/orders/${order._id}`}>View order</Link></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="quick-actions">
        <Link to="/menu">Menu</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Order History</Link>
        <Link to="/profile">Profile</Link>
      </section>
    </main>
  )
}

export default Dashboard
