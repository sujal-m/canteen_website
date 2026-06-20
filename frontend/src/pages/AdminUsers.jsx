import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'

function AdminUsers() {
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') || '')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const { users, loading, error, fetchUsers, toggleUser } = useAdmin()

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers({ role: role || undefined, search: search || undefined }), 250)
    return () => clearTimeout(timer)
  }, [role, search, fetchUsers])

  const toggle = async (user) => {
    const updated = await toggleUser(user._id)
    if (selected?._id === updated._id) setSelected(updated)
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Accounts</p><h1>User Management</h1></div></div>
      <div className="admin-tools"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, or UCID" /><div className="filter-row">{[['', 'All'], ['student', 'Students'], ['faculty', 'Faculty']].map(([value, label]) => <button className={role === value ? 'active' : ''} key={label} onClick={() => setRole(value)} type="button">{label}</button>)}</div></div>
      {error && <p className="alert error">{error}</p>}
      {loading && users.length === 0 ? <p className="status">Loading users...</p> : <div className="data-table users-table"><div className="table-row table-head"><span>User</span><span>Role</span><span>Branch</span><span>Status</span><span>Actions</span></div>{users.map((user) => <div className="table-row" key={user._id}><span><strong>{user.fullName}</strong><small>{user.email}</small></span><span className="capitalize">{user.role}</span><span>{user.branch || '-'}</span><span className={`status-badge ${user.isActive !== false ? 'ready' : 'disabled'}`}>{user.isActive !== false ? 'Active' : 'Disabled'}</span><span className="row-actions"><button className="button secondary" onClick={() => setSelected(user)} type="button">View</button><button className={`button ${user.isActive !== false ? 'danger-button' : 'primary'}`} onClick={() => toggle(user)} type="button">{user.isActive !== false ? 'Disable' : 'Enable'}</button></span></div>)}</div>}
      {selected && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card user-modal"><div className="profile-summary compact"><img className="avatar" src={selected.profilePic || 'https://placehold.co/96x96?text=User'} alt="Profile" /><div><p className="eyebrow">{selected.role}</p><h2>{selected.fullName}</h2><p className="muted">{selected.email}</p></div></div><dl className="detail-list">{[['UCID', selected.ucid], ['Gender', selected.gender], ['Branch', selected.branch], ['Class', selected.className], ['Division', selected.division], ['Designation', selected.designation]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="modal-actions"><button className="button secondary" onClick={() => setSelected(null)} type="button">Close</button><button className={`button ${selected.isActive !== false ? 'danger-button' : 'primary'}`} onClick={() => toggle(selected)} type="button">{selected.isActive !== false ? 'Disable user' : 'Enable user'}</button></div></div></div>}
    </main>
  )
}

export default AdminUsers


