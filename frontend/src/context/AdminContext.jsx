/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import api from '../services/api'

const AdminContext = createContext(null)

export function AdminProvider({ children }) {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (request) => {
    setLoading(true)
    setError('')
    try {
      return await request()
    } catch (err) {
      const message = err.response?.data?.message || 'Admin request failed.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/dashboard')
    setStats(data.stats)
    return data.stats
  }), [run])

  const fetchAnalytics = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/analytics')
    setAnalytics(data.analytics)
    return data.analytics
  }), [run])

  const fetchOrders = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/orders')
    setOrders(data.orders)
    return data.orders
  }), [run])

  const updateOrderStatus = useCallback((id, status) => run(async () => {
    const { data } = await api.put(`/admin/orders/${id}/status`, { status })
    setOrders((current) => current.map((order) => order._id === id ? data.order : order))
    return data.order
  }), [run])

  const fetchUsers = useCallback((params = {}) => run(async () => {
    const { data } = await api.get('/admin/users', { params })
    setUsers(data.users)
    return data.users
  }), [run])

  const toggleUser = useCallback((id) => run(async () => {
    const { data } = await api.put(`/admin/users/${id}/toggle`)
    setUsers((current) => current.map((user) => user._id === id ? data.user : user))
    return data.user
  }), [run])

  const fetchMenu = useCallback(() => run(async () => {
    const { data } = await api.get('/admin/menu')
    setMenuItems(data.items)
    return data.items
  }), [run])

  const saveMenuItem = useCallback((id, formData) => run(async () => {
    const { data } = id
      ? await api.put(`/admin/menu/${id}`, formData)
      : await api.post('/admin/menu', formData)
    setMenuItems((current) => id ? current.map((item) => item._id === id ? data.item : item) : [...current, data.item])
    return data.item
  }), [run])

  const deleteMenuItem = useCallback((id) => run(async () => {
    await api.delete(`/admin/menu/${id}`)
    setMenuItems((current) => current.filter((item) => item._id !== id))
  }), [run])

  const value = useMemo(() => ({
    stats, analytics, orders, users, menuItems, loading, error,
    fetchStats, fetchAnalytics, fetchOrders, updateOrderStatus, fetchUsers, toggleUser, fetchMenu, saveMenuItem, deleteMenuItem
  }), [stats, analytics, orders, users, menuItems, loading, error, fetchStats, fetchAnalytics, fetchOrders, updateOrderStatus, fetchUsers, toggleUser, fetchMenu, saveMenuItem, deleteMenuItem])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const useAdmin = () => useContext(AdminContext)

