import { Link } from 'react-router-dom'
import { useOrders } from '../context/OrderContext'

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const statusClass = (status) => status === 'Ready To Pick Up' ? 'ready' : status === 'Preparing' ? 'preparing' : 'received'

function OrderHistory() {
  const { orders, loading, error, downloadInvoice } = useOrders()

  return (
    <main className="page">
      <div className="section-heading"><div><p className="eyebrow">Orders</p><h1>Order History</h1></div></div>
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading orders...</p> : orders.length === 0 ? (
        <div className="surface center-copy order-empty"><h2>No orders yet</h2><p className="muted">Place an order from the menu and it will appear here.</p><div className="actions centered"><Link className="button primary" to="/menu">Browse menu</Link></div></div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-head">
                <div><p className="eyebrow">{order.orderNumber}</p><h2>{formatDate(order.createdAt)}</h2></div>
                <span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span>
              </div>
              <ul className="order-item-list">{order.items.map((item) => <li key={item.menuItem}><span>{item.name} x {item.quantity}</span><strong>Rs. {item.subtotal}</strong></li>)}</ul>
              <div className="order-card-foot"><strong>Total: Rs. {order.totalAmount}</strong><div className="actions"><button className="button secondary" type="button" onClick={() => downloadInvoice(order)}>Download Invoice</button><Link className="button secondary" to={`/orders/${order._id}`}>View order</Link></div></div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}

export default OrderHistory

