import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMenu } from '../context/MenuContext'
import FoodCard from '../components/FoodCard'
import ItemModal from '../components/ItemModal'
import { uiCategories } from '../utils/menuHelpers'

function Menu() {
  const [params, setParams] = useSearchParams()
  const initialCategory = uiCategories.includes(params.get('category') || 'All') ? (params.get('category') || 'All') : 'All'
  const [category, setCategory] = useState(initialCategory)
  const [search, setSearch] = useState('')
  const { items, loading, error } = useMenu()
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    const nextParams = {}
    if (category !== 'All') nextParams.category = category
    if (search) nextParams.search = search
    setParams(nextParams, { replace: true })
  }, [category, search, setParams])

  const visibleItems = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return items.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category
      const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm)

      return matchesCategory && matchesSearch
    })
  }, [items, category, search])

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Menu</p><h1>Campus Canteen Menu</h1></div></div>
      <div className="menu-tools">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name" aria-label="Search menu" />
        <div className="filter-stack">
          <div className="filter-row">{uiCategories.map((item) => <button key={item} className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div>
        </div>
      </div>
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading menu...</p> : visibleItems.length === 0 ? <EmptyState title="No menu items found" text="Try another search, category, or diet filter." /> : (
        <div className="menu-grid">{visibleItems.map((item) => <FoodCard key={item._id} item={item} onOpen={setActiveItem} />)}</div>
      )}
      <ItemModal item={activeItem} onClose={() => setActiveItem(null)} />
    </main>
  )
}

function EmptyState({ title, text }) {
  return <div className="surface center-copy"><h2>{title}</h2><p className="muted">{text}</p></div>
}

export default Menu
