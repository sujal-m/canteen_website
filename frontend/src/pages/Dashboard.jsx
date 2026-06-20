import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMenu } from '../context/MenuContext'

const categories = ['Veg', 'Non Veg', 'Snacks', 'Drinks']

function Dashboard() {
  const { user } = useAuth()
  const { items, loading } = useMenu()
  const featured = items.slice(0, 4)
  const popular = items.slice(4, 8)

  return (
    <main className="page dashboard-page">
      <section className="welcome-band">
        <p className="eyebrow">Welcome</p>
        <h1>Welcome, {user.fullName}</h1>
        <p>Browse the campus menu, manage your cart, and keep your profile ready for pickup.</p>
        <div className="actions"><Link className="button primary" to="/menu">Explore menu</Link><Link className="button secondary" to="/cart">View cart</Link></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Featured Items</h2><Link to="/menu">View all</Link></div>
        {loading ? <p className="status">Loading featured items...</p> : <div className="mini-grid">{featured.map((item) => <FoodTile key={item._id} item={item} />)}</div>}
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Popular Dishes</h2><Link to="/menu">Open menu</Link></div>
        {loading ? <p className="status">Loading popular dishes...</p> : <div className="mini-grid">{popular.map((item) => <FoodTile key={item._id} item={item} />)}</div>}
      </section>

      <section className="section-block">
        <div className="section-heading"><h2>Categories</h2></div>
        <div className="category-grid">{categories.map((category) => <Link key={category} to={`/menu?category=${encodeURIComponent(category)}`}>{category}</Link>)}</div>
      </section>

      <section className="quick-actions">
        <Link to="/menu">Menu</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Order History</Link>
        <Link to="/profile">Profile</Link>
      </section>
    </main>
  )
}

function FoodTile({ item }) {
  return (
    <article className="food-tile">
      <img src={item.imageUrl} alt={item.name} />
      <div><h3>{item.name}</h3><p>Rs. {item.price}</p></div>
    </article>
  )
}

export default Dashboard
