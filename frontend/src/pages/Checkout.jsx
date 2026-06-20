import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrderContext'

function Checkout() {
  const navigate = useNavigate()
  const { cart } = useCart()
  const { createOrder } = useOrders()
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const items = cart.items || []

  const handleConfirm = async () => {
    setSubmitting(true)
    setError('')
    try {
      const order = await createOrder()
      navigate(`/orders/${order._id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place your order.')
      setConfirmed(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <main className="page narrow"><div className="surface center-copy"><h1>Checkout</h1><p className="muted">Your cart is empty.</p><div className="actions centered"><Link className="button primary" to="/menu">Browse menu</Link></div></div></main>
  }

  return (
    <main className="page narrow">
      <div className="surface checkout-box">
        <div className="page-heading"><p className="eyebrow">Checkout</p><h1>Review your order</h1></div>
        <div className="checkout-items">
          {items.map((item) => <div key={item.menuItem._id}><span>{item.menuItem.name} x {item.quantity}</span><strong>Rs. {item.itemTotal}</strong></div>)}
        </div>
        <div className="payment-box"><span>Payment Method</span><strong>Pay At Pickup</strong></div>
        <div className="checkout-total"><span>Total Amount</span><strong>Rs. {cart.total}</strong></div>
        {error && <p className="alert error">{error}</p>}
        <button className="button primary full" type="button" onClick={() => setConfirmed(true)}>Confirm</button>
      </div>
      {confirmed && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Place this order?</h2>
            <p className="muted">Your order will be sent to the canteen and paid for when you pick it up.</p>
            <div className="modal-actions">
              <button className="button secondary" type="button" disabled={submitting} onClick={() => setConfirmed(false)}>Cancel</button>
              <button className="button primary" type="button" disabled={submitting} onClick={handleConfirm}>{submitting ? 'Placing order...' : 'Place order'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Checkout

