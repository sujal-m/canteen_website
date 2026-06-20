import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import api from '../services/api'

const statuses = ['Received', 'Preparing', 'Ready To Pick Up']
const nextStatus = { Received: 'Preparing', Preparing: 'Ready To Pick Up' }
const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const downloadInvoice = async (order) => {
  const { data } = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${order.orderNumber}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

function AdminOrders() {
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useAdmin()
  const [notice, setNotice] = useState('')
  useEffect(() => { fetchOrders() }, [fetchOrders])

  const advance = async (order) => {
    setNotice('')
    await updateOrderStatus(order._id, nextStatus[order.status])
    setNotice(`${order.orderNumber} moved to ${nextStatus[order.status]}.`)
  }

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Operations</p><h1>Orders</h1></div><button className="button secondary" type="button" onClick={fetchOrders}>Refresh</button></div>
      {notice && <p className="alert success">{notice}</p>}{error && <p className="alert error">{error}</p>}
      {loading && orders.length === 0 ? <p className="status">Loading orders...</p> : (
        <div className="admin-order-board">
          {statuses.map((status) => {
            const group = orders.filter((order) => order.status === status)
            return <section className="order-column" key={status}><div className="column-heading"><h2>{status}</h2><span>{group.length}</span></div>{group.length === 0 ? <p className="muted">No orders</p> : group.map((order) => (
              <article className="admin-order-card" key={order._id}>
                <div><strong>{order.orderNumber}</strong><span>{formatDate(order.createdAt)}</span></div>
                <p>{order.user?.fullName} · {order.userRole}</p>
                <p>{order.items.length} item(s) · <strong>Rs. {order.totalAmount}</strong></p>
                <div className="actions"><Link className="button secondary" to={`/admin/orders/${order._id}`}>View</Link><button className="button secondary" type="button" onClick={() => downloadInvoice(order)}>Invoice</button>{nextStatus[status] && <button className="button primary" type="button" onClick={() => advance(order)}>Mark {nextStatus[status]}</button>}</div>
              </article>
            ))}</section>
          })}
        </div>
      )}
    </main>
  )
}

export default AdminOrders

