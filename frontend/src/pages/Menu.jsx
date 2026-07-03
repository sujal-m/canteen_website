import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMenu } from '../context/MenuContext'
import FoodCard from '../components/FoodCard'
import ItemModal from '../components/ItemModal'
import { dietFilters, isVegItem, uiCategories, uiCategoryToBackend } from '../utils/menuHelpers'

function Menu() {
  const [params, setParams] = useSearchParams()
  const initialCategory = params.get('category') || 'All'
  const initialDiet = params.get('diet') || 'All'
  const [category, setCategory] = useState(initialCategory)
  const [diet, setDiet] = useState(initialDiet)
  const [search, setSearch] = useState('')
  const { items, loading, error, fetchMenu } = useMenu()
  const [activeItem, setActiveItem] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu({ category: uiCategoryToBackend(category), search })
      const nextParams = {}
      if (category !== 'All') nextParams.category = category
      if (diet !== 'All') nextParams.diet = diet
      if (search) nextParams.search = search
      setParams(nextParams, { replace: true })
    }, 250)

    return () => clearTimeout(timer)
  }, [category, search, fetchMenu, setParams, diet])

  // Diet (Veg/Non-Veg) is filtered client-side since it's derived from the
  // existing category field rather than a separate backend flag.
  const visibleItems = useMemo(() => {
    if (diet === 'All') return items
    return items.filter((item) => (diet === 'Veg' ? isVegItem(item) : !isVegItem(item)))
  }, [items, diet])

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Menu</p><h1>Campus Canteen Menu</h1></div></div>
      <div className="menu-tools">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name" aria-label="Search menu" />
        <div className="filter-stack">
          <div className="filter-row">{uiCategories.map((item) => <button key={item} className={category === item ? 'active' : ''} type="button" onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="filter-row diet-filter">{dietFilters.map((item) => <button key={item} className={diet === item ? 'active' : ''} type="button" onClick={() => setDiet(item)}>{item !== 'All' && <span className={`diet-dot ${item === 'Veg' ? 'veg' : 'nonveg'}`} aria-hidden="true" />}{item}</button>)}</div>
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
