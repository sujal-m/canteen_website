import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cart, loading, error, updateQuantity, removeItem, clearCart } = useCart()
  const items = cart.items || []

  const changeQuantity = async (menuItemId, quantity) => {
    if (quantity < 1) return
    await updateQuantity(menuItemId, quantity)
  }

  return (
    <main className="page">
      <div className="toolbar"><div><p className="eyebrow">Cart</p><h1>Your Cart</h1></div>{items.length > 0 && <button className="button secondary" type="button" onClick={clearCart}>Clear cart</button>}</div>
      {error && <p className="alert error">{error}</p>}
      {loading ? <p className="status">Loading cart...</p> : items.length === 0 ? <EmptyCart /> : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => <CartRow key={item.menuItem._id} item={item} onQuantity={changeQuantity} onRemove={removeItem} />)}
          </div>
          <aside className="cart-summary">
            <h2>Cart Total</h2>
            <div><span>Items</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
            <div><span>Total</span><strong>Rs. {cart.total}</strong></div>
            <Link className="button primary full" to="/checkout">Proceed to checkout</Link>
          </aside>
        </div>
      )}
    </main>
  )
}

function CartRow({ item, onQuantity, onRemove }) {
  const menuItem = item.menuItem

  return (
    <article className="cart-row">
      <img src={menuItem.imageUrl} alt={menuItem.name} />
      <div>
        <h2>{menuItem.name}</h2>
        <p className="muted">Rs. {menuItem.price} each</p>
      </div>
      <div className="quantity-control">
        <button type="button" onClick={() => onQuantity(menuItem._id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
        <span>{item.quantity}</span>
        <button type="button" onClick={() => onQuantity(menuItem._id, item.quantity + 1)} disabled={item.quantity >= 6}>+</button>
      </div>
      <strong>Rs. {item.itemTotal}</strong>
      <button className="text-button danger" type="button" onClick={() => onRemove(menuItem._id)}>Remove</button>
    </article>
  )
}

function EmptyCart() {
  return (
    <div className="surface center-copy">
      <h2>Your cart is empty</h2>
      <p className="muted">Add dishes from the menu before checkout.</p>
      <div className="actions centered"><Link className="button primary" to="/menu">Browse menu</Link></div>
    </div>
  )
}

export default Cart
