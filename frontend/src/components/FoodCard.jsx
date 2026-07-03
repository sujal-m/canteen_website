import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { isVegItem } from '../utils/menuHelpers'

// Shared card used on Home, Dashboard, and Menu. Fully clickable (opens the
// item modal via onOpen), shows a veg/non-veg dot, and swaps the Add to Cart
// button for an inline [-] qty [+] control once the item is in the cart.
function FoodCard({ item, onOpen, size = 'default' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { cart, addToCart, updateQuantity } = useCart()

  const cartLine = cart?.items?.find((line) => line.menuItem._id === item._id)
  const veg = isVegItem(item)

  const goToLogin = (event) => {
    event.stopPropagation()
    navigate('/login', { state: { from: location.pathname + location.search, message: 'Please login to add items to your cart.' } })
  }

  const handleAdd = async (event) => {
    event.stopPropagation()
    if (!user) return goToLogin(event)
    await addToCart(item._id, 1)
  }

  const handleQuantity = async (event, nextQuantity) => {
    event.stopPropagation()
    if (nextQuantity < 1) return
    await updateQuantity(item._id, nextQuantity)
  }

  return (
    <article
      className={`food-card ${size === 'compact' ? 'food-card-compact' : ''}`}
      onClick={() => onOpen?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen?.(item) } }}
    >
      <div className="food-card-media">
        <img src={item.imageUrl} alt={item.name} loading="lazy" />
        <span className={`diet-dot ${veg ? 'veg' : 'nonveg'}`} title={veg ? 'Veg' : 'Non-Veg'} aria-label={veg ? 'Vegetarian' : 'Non-Vegetarian'} />
        {!item.available && <span className="food-card-unavailable">Unavailable</span>}
      </div>
      <div className="food-card-body">
        <div className="card-title-row"><h3>{item.name}</h3><strong>Rs. {item.price}</strong></div>
        {item.description && <p className="muted food-card-desc">{item.description}</p>}
        <div className="food-card-foot">
          <span className="badge off">{item.category}</span>
          {cartLine ? (
            <div className="quantity-control" onClick={(event) => event.stopPropagation()}>
              <button type="button" onClick={(event) => handleQuantity(event, cartLine.quantity - 1)} disabled={cartLine.quantity <= 1} aria-label={`Decrease quantity of ${item.name}`}>-</button>
              <span>{cartLine.quantity}</span>
              <button type="button" onClick={(event) => handleQuantity(event, cartLine.quantity + 1)} disabled={cartLine.quantity >= 6} aria-label={`Increase quantity of ${item.name}`}>+</button>
            </div>
          ) : (
            <button className="button primary" type="button" disabled={!item.available} onClick={handleAdd}>Add to Cart</button>
          )}
        </div>
      </div>
    </article>
  )
}

export default FoodCard
