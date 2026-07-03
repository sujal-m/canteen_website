/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const MenuContext = createContext(null)
const categories = ['All', 'Veg', 'Non Veg', 'Snacks', 'Drinks']

// Menu browsing is public: GET /api/menu does not require auth, so this
// provider fetches regardless of login state and can sit above ProtectedRoute.
export function MenuProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchMenu = useCallback(async ({ category = 'All', search = '' } = {}) => {
    setLoading(true)
    setError('')

    try {
      const { data } = await api.get('/menu', { params: { category, search } })
      setItems(data.items)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load menu.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const value = useMemo(() => ({ items, loading, error, categories, fetchMenu }), [items, loading, error, fetchMenu])

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export const useMenu = () => useContext(MenuContext)
