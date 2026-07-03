/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = useCallback(async (id) => {
    const { data } = await api.put(`/notifications/${id}/read`)
    setNotifications((current) => current.map((item) => item._id === id ? data.notification : item))
    setUnreadCount(data.unreadCount)
  }, [])

  const markAllRead = useCallback(async () => {
    const { data } = await api.put('/notifications/read-all')
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
    setUnreadCount(data.unreadCount)
  }, [])

  const value = useMemo(() => ({
    notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead
  }), [notifications, unreadCount, loading, error, fetchNotifications, markRead, markAllRead])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => useContext(NotificationContext)
