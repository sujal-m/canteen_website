import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMenu } from '../context/MenuContext'
import { useOrders } from '../context/OrderContext'
import Carousel from '../components/Carousel'
import FoodCard from '../components/FoodCard'
import ItemModal from '../components/ItemModal'
import { uiCategories } from '../utils/menuHelpers'

// Home ("/") is the single landing page for guests and logged-in users. It
// carries the full app layout (via AppLayout) and replaces the old
// standalone Dashboard: logged-in users see a personalized welcome band and
// recent orders, guests see a browse-focused hero, and everyone sees the
// same Featured Items / Popular Dishes / Categories sections underneath.
function Home() {
  const { user } = useAuth()
  const { items, loading } = useMenu()
  const { orders } = useOrders()
  const [activeItem, setActiveItem] = useState(null)

  const featured = items.slice(0, 8)
  const popular = items.slice(8, 16).length ? items.slice(8, 16) : items.slice(0, 8)
  const recentOrders = user ? (orders?.slice(0, 3) || []) : []

  return (
    <main className="page home-page">
      {user ? (
        <section className="welcome-band">
          <p className="eyebrow">Welcome</p>
          <h1>Welcome, {user.fullName}</h1>
          <p>Browse the campus menu, manage your cart, and keep your profile ready for pickup.</p>
          <div className="actions"><Link className="button primary" to="/menu">Explore menu</Link><Link className="button secondary" to="/cart">View cart</Link></div>
        </section>
      ) : (
        <section className="hero-panel">
          <div>
            <p className="eyebrow">Campus Canteen</p>
            <h2 className="hero-copy-title">Food ordering for students and faculty</h2>
            <p className="hero-copy">Browse the full menu, and register or login when you're ready to order and track pickups.</p>
            <div className="actions">
              <Link className="button primary" to="/menu">Browse menu</Link>
              <Link className="button secondary" to="/register">Create account</Link>
            </div>
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Fresh Today</p><h2>Featured Items</h2></div><Link to="/menu">View all</Link></div>
        {loading ? <p className="status">Loading featured items...</p> : featured.length === 0 ? (
          <p className="muted">No menu items available right now.</p>
        ) : (
          <Carousel>
            {featured.map((item) => (
              <div className="carousel-slide" key={item._id}>
                <FoodCard item={item} onOpen={setActiveItem} />
              </div>
            ))}
          </Carousel>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading"><div><p className="eyebrow">Loved by campus</p><h2>Popular Dishes</h2></div><Link to="/menu">Open menu</Link></div>
        {loading ? <p className="status">Loading popular dishes...</p> : popular.length === 0 ? (
          <p className="muted">Check back soon for popular picks.</p>
        ) : (
          <div className="mini-grid">{popular.map((item) => <FoodCard key={item._id} item={item} onOpen={setActiveItem} size="compact" />)}</div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Categories</h2></div>
        <div className="category-grid">{uiCategories.filter((category) => category !== 'All').map((category) => <Link key={category} to={`/menu?category=${encodeURIComponent(category)}`}>{category}</Link>)}</div>
      </section>

      {user && recentOrders.length > 0 && (
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

      {user && (
        <section className="quick-actions">
          <Link to="/menu">Menu</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Order History</Link>
          <Link to="/profile">Profile</Link>
        </section>
      )}

      <ItemModal item={activeItem} onClose={() => setActiveItem(null)} />
    </main>
  )
}

export default Home


