import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { isVegItem, loginRequiredMessage } from '../utils/menuHelpers'

function ItemModal({ item, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { cart, addToCart, updateQuantity } = useCart()

  if (!item) return null

  const cartLine = cart?.items?.find((line) => line.menuItem._id === item._id)
  const veg = isVegItem(item)

  const handleAdd = async () => {
    if (!user) {
      onClose()
      navigate('/login', { state: { from: location.pathname + location.search, message: loginRequiredMessage } })
      return
    }
    await addToCart(item._id, 1)
  }

  const handleQuantity = async (nextQuantity) => {
    if (nextQuantity < 1) return
    await updateQuantity(item._id, nextQuantity)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card item-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <div className="item-modal-media">
          <img src={item.imageUrl} alt={item.name} />
          <span className={`diet-dot ${veg ? 'veg' : 'nonveg'}`} title={veg ? 'Veg' : 'Non-Veg'} />
        </div>
        <div className="item-modal-body">
          <div className="card-title-row"><h2>{item.name}</h2><strong>Rs. {item.price}</strong></div>
          <span className="badge off">{item.category}</span>
          <p className="muted">{item.description}</p>
          <div className="modal-actions">
            {cartLine ? (
              <div className="quantity-control">
                <button type="button" onClick={() => handleQuantity(cartLine.quantity - 1)} disabled={cartLine.quantity <= 1}>-</button>
                <span>{cartLine.quantity}</span>
                <button type="button" onClick={() => handleQuantity(cartLine.quantity + 1)} disabled={cartLine.quantity >= 6}>+</button>
              </div>
            ) : (
              <button className="button primary full" type="button" disabled={!item.available} onClick={handleAdd}>{item.available ? 'Add to Cart' : 'Unavailable'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemModal
