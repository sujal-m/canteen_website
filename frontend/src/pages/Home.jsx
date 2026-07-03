import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMenu } from '../context/MenuContext'
import Carousel from '../components/Carousel'
import FoodCard from '../components/FoodCard'
import ItemModal from '../components/ItemModal'
import { uiCategories } from '../utils/menuHelpers'

function Home() {
  const { user } = useAuth()
  const { items, loading } = useMenu()
  const [activeItem, setActiveItem] = useState(null)

  const featured = items.slice(0, 8)
  const popular = items.slice(8, 16).length ? items.slice(8, 16) : items.slice(0, 8)

  return (
    <main className="page home-page">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Campus Canteen</p>
          <h1>Food ordering for students and faculty</h1>
          <p className="hero-copy">Browse the full menu, and register or login when you're ready to order and track pickups.</p>
          <div className="actions">
            {user ? <Link className="button primary" to="/menu">Explore menu</Link> : <Link className="button primary" to="/register">Create account</Link>}
            {!user && <Link className="button secondary" to="/login">Login</Link>}
          </div>
        </div>
      </section>

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

      <ItemModal item={activeItem} onClose={() => setActiveItem(null)} />
    </main>
  )
}

export default Home
