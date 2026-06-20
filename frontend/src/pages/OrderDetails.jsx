import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value))
const statusClass = (status) => status === 'Ready To Pick Up' ? 'ready' : status === 'Preparing' ? 'preparing' : 'received'

function OrderDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)).catch((err) => setError(err.response?.data?.message || 'Failed to load order.'))
  }, [id])

  const downloadInvoice = async () => {
    const { data } = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${order.orderNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const backPath = user.role === 'admin' ? '/admin/orders' : '/orders'
  if (error) return <main className="page narrow"><p className="alert error">{error}</p><Link className="button secondary" to={backPath}>Back to orders</Link></main>
  if (!order) return <main className="page"><p className="status">Loading order...</p></main>

  const detailRows = [
    ['Name', order.user.fullName], ['Email', order.user.email], ['Role', order.user.role],
    ['UCID', order.user.ucid], ['Branch', order.user.branch], ['Class', order.user.className],
    ['Division', order.user.division], ['Designation', order.user.designation]
  ].filter(([, value]) => value)

  return (
    <main className="page narrow">
      <div className="surface order-detail">
        <div className="section-heading"><div><p className="eyebrow">{order.orderNumber}</p><h1>Order Details</h1></div><span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span></div>
        <p className="muted">Placed {formatDate(order.createdAt)}</p>
        <section><h2>User Details</h2><dl className="detail-list">{detailRows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
        <section><h2>Items</h2><div className="order-detail-items">{order.items.map((item) => <div key={item.menuItem}><span>{item.name}<small>Rs. {item.price} x {item.quantity}</small></span><strong>Rs. {item.subtotal}</strong></div>)}</div></section>
        <div className="checkout-total"><span>Total</span><strong>Rs. {order.totalAmount}</strong></div>
        <div className="payment-box"><span>Payment</span><strong>{order.paymentMethod}</strong></div>
        <div className="actions"><Link className="button secondary" to={backPath}>Back to orders</Link><button className="button primary" type="button" onClick={downloadInvoice}>Download Invoice</button></div>
      </div>
    </main>
  )
}

export default OrderDetails


