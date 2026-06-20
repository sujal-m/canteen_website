/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'
import { useCart } from './CartContext'

const OrderContext = createContext(null)

export function OrderProvider({ children }) {
  const { user } = useAuth()
  const { fetchCart } = useCart()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/orders')
      setOrders(data.orders)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = useCallback(async () => {
    setError('')
    const { data } = await api.post('/orders')
    setOrders((current) => [data.order, ...current])
    await fetchCart()
    return data.order
  }, [fetchCart])

  const downloadInvoice = useCallback(async (order) => {
    const { data } = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${order.orderNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }, [])

  const value = useMemo(() => ({ orders, loading, error, fetchOrders, createOrder, downloadInvoice }), [orders, loading, error, fetchOrders, createOrder, downloadInvoice])
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export const useOrders = () => useContext(OrderContext)

