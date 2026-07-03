import { useEffect, useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { isVegItem } from '../utils/menuHelpers'

const emptyForm = { name: '', description: '', category: 'Veg', price: '', available: true, image: null }

function AdminMenu() {
  const { menuItems, loading, error, fetchMenu, saveMenuItem, deleteMenuItem } = useAdmin()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormError(''); setFormOpen(true) }
  const openEdit = (item) => {
    setEditingId(item._id)
    setForm({ name: item.name, description: item.description, category: item.category, price: item.price, available: item.available, image: null })
    setFormError('')
    setFormOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    setNotice('')
    if (!editingId && !form.image) return setFormError('Choose an image for the dish.')
    const body = new FormData()
    body.append('name', form.name)
    body.append('description', form.description)
    body.append('category', form.category)
    body.append('price', form.price)
    body.append('available', String(form.available))
    if (form.image) body.append('image', form.image)
    try {
      await saveMenuItem(editingId, body)
      setNotice(editingId ? 'Dish updated.' : 'Dish created.')
      setFormOpen(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not save dish.')
    }
  }

  const toggleAvailability = async (item) => {
    const body = new FormData()
    body.append('available', String(!item.available))
    await saveMenuItem(item._id, body)
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return
    await deleteMenuItem(item._id)
    setNotice('Dish deleted.')
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Catalog</p><h1>Menu Management</h1></div><button className="button primary" type="button" onClick={openCreate}>Add dish</button></div>
      {notice && <p className="alert success">{notice}</p>}{error && <p className="alert error">{error}</p>}
      {loading && menuItems.length === 0 ? <p className="status">Loading menu...</p> : <div className="admin-menu-grid">{menuItems.map((item) => <article className="admin-menu-card" key={item._id}><div className="admin-menu-media"><img src={item.imageUrl} alt={item.name} /><span className={`diet-dot ${isVegItem(item) ? 'veg' : 'nonveg'}`} title={isVegItem(item) ? 'Veg' : 'Non-Veg'} aria-hidden="true" /></div><div className="admin-menu-body"><div className="card-title-row"><h2>{item.name}</h2><span className={`status-badge ${item.available ? 'ready' : 'disabled'}`}>{item.available ? 'Available' : 'Unavailable'}</span></div><p className="muted">{item.description}</p><div className="card-meta"><span>{item.category}</span><strong>Rs. {item.price}</strong></div><div className="row-actions"><button className="button secondary" type="button" onClick={() => openEdit(item)}>Edit</button><button className="button secondary" type="button" onClick={() => toggleAvailability(item)}>{item.available ? 'Mark unavailable' : 'Mark available'}</button><button className="button danger-button" type="button" onClick={() => remove(item)}>Delete</button></div></div></article>)}</div>}
      {formOpen && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card menu-form-modal"><div className="section-heading"><div><p className="eyebrow">{editingId ? 'Edit dish' : 'New dish'}</p><h2>{editingId ? form.name : 'Add menu item'}</h2></div></div><form className="form-grid" onSubmit={submit}><label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label><div className="two-column-form"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Veg', 'Non Veg', 'Snacks', 'Drinks'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Price<input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label></div><label>Dish image<input type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] || null })} required={!editingId} /></label><label className="check-row"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} /> Available for ordering</label>{formError && <p className="alert error">{formError}</p>}<div className="modal-actions"><button className="button secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="button primary" disabled={loading}>{loading ? 'Saving...' : 'Save dish'}</button></div></form></div></div>}
    </main>
  )
}

export default AdminMenu

