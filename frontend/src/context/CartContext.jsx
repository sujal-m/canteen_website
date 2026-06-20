/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)
const emptyCart = { items: [], total: 0 }

const readCachedCart = (userId) => {
  if (!userId) return emptyCart
  const raw = localStorage.getItem(`cart:${userId}`)
  return raw ? JSON.parse(raw) : emptyCart
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?._id
  const [cart, setCart] = useState(() => readCachedCart(userId))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const persistCart = useCallback((nextCart) => {
    setCart(nextCart)
    if (userId) localStorage.setItem(`cart:${userId}`, JSON.stringify(nextCart))
  }, [userId])

  const fetchCart = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/cart')
      persistCart(data.cart)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.')
    } finally {
      setLoading(false)
    }
  }, [persistCart, userId])

  useEffect(() => {
    if (userId) {
      setCart(readCachedCart(userId))
      fetchCart()
    } else {
      setCart(emptyCart)
    }
  }, [fetchCart, userId])

  const addToCart = useCallback(async (menuItemId, quantity = 1) => {
    setError('')
    const { data } = await api.post('/cart/add', { menuItemId, quantity })
    persistCart(data.cart)
    return data
  }, [persistCart])

  const updateQuantity = useCallback(async (menuItemId, quantity) => {
    setError('')
    const { data } = await api.put('/cart/update', { menuItemId, quantity })
    persistCart(data.cart)
    return data
  }, [persistCart])

  const removeItem = useCallback(async (menuItemId) => {
    setError('')
    const { data } = await api.delete(`/cart/remove/${menuItemId}`)
    persistCart(data.cart)
    return data
  }, [persistCart])

  const clearCart = useCallback(async () => {
    setError('')
    const { data } = await api.delete('/cart/clear')
    persistCart(data.cart)
    return data
  }, [persistCart])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const value = useMemo(() => ({ cart, itemCount, loading, error, fetchCart, addToCart, updateQuantity, removeItem, clearCart }), [cart, itemCount, loading, error, fetchCart, addToCart, updateQuantity, removeItem, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
