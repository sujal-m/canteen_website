import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useMenu } from '../context/MenuContext'

function Menu() {
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('category') || 'All'
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const { items, loading, error, categories, fetchMenu } = useMenu()
  const { addToCart } = useCart()

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu({ category, search })
      const nextParams = {}
      if (category !== 'All') nextParams.category = category
      if (search) nextParams.search = search
      setParams(nextParams, { replace: true })
    }, 250)

    return () => clearTimeout(timer)
  }, [category, search, fetchMenu, setParams])

  const handleAdd = async (item) => {
    setNotice('')
    setCartError('')

    try {
      await addToCart(item._id, 1)
      setNotice(`${item.name} added to cart.`)
    } catch (err) {
      setCartError(err.response?.data?.message || 'Could not add item to cart.')
    }
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Menu</p><h1>Campus Canteen Menu</h1></div></div>
      <div className="menu-tools">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name" aria-label="Search menu" />
        <div className="filter-row">{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      {notice && <p className="alert success">{notice}</p>}
      {cartError && <p className="alert error">{cartError}</p>}
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading menu...</p> : items.length === 0 ? <EmptyState title="No menu items found" text="Try another search or category." /> : (
        <div className="menu-grid">{items.map((item) => <MenuCard key={item._id} item={item} onAdd={handleAdd} />)}</div>
      )}
    </main>
  )
}

function MenuCard({ item, onAdd }) {
  return (
    <article className="menu-card">
      <img src={item.imageUrl} alt={item.name} />
      <div className="menu-card-body">
        <div className="card-title-row"><h2>{item.name}</h2><span className={item.available ? 'badge ok' : 'badge off'}>{item.available ? 'Available' : 'Unavailable'}</span></div>
        <p>{item.description}</p>
        <div className="card-meta"><span>{item.category}</span><strong>Rs. {item.price}</strong></div>
        <button className="button primary full" type="button" disabled={!item.available} onClick={() => onAdd(item)}>Add To Cart</button>
      </div>
    </article>
  )
}

function EmptyState({ title, text }) {
  return <div className="surface center-copy"><h2>{title}</h2><p className="muted">{text}</p></div>
}

export default Menu
