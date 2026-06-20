/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

const readStoredAuth = () => {
  const raw = localStorage.getItem('auth') || sessionStorage.getItem('auth')
  return raw ? JSON.parse(raw) : { token: null, user: null }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)
  const [loading, setLoading] = useState(Boolean(auth.token))

  const persistAuth = useCallback((nextAuth, remember) => {
    const storage = remember ? localStorage : sessionStorage
    localStorage.removeItem('auth')
    sessionStorage.removeItem('auth')
    storage.setItem('auth', JSON.stringify(nextAuth))
    setAuth(nextAuth)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth')
    sessionStorage.removeItem('auth')
    setAuth({ token: null, user: null })
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth.token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/profile')
        setAuth((current) => ({ ...current, user: data.user }))
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [auth.token, logout])

  const login = useCallback(async ({ email, password, remember }) => {
    const { data } = await api.post('/auth/login', { email, password })
    persistAuth({ token: data.token, user: data.user }, remember)
    return data.user
  }, [persistAuth])

  const updateUser = useCallback((user) => {
    const remember = Boolean(localStorage.getItem('auth'))
    setAuth((current) => {
      const nextAuth = { ...current, user }
      localStorage.removeItem('auth')
      sessionStorage.removeItem('auth')
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('auth', JSON.stringify(nextAuth))
      return nextAuth
    })
  }, [])

  const value = useMemo(() => ({ ...auth, loading, login, logout, updateUser }), [auth, loading, login, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
