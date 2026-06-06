import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('kelebet_admin_token')
    if (token) {
      authAPI.getMe()
        .then(res => {
          if (['ADMIN','PHARMACIST'].includes(res.user.role)) setUser(res.user)
          else { localStorage.removeItem('kelebet_admin_token'); window.location.href = '/login' }
        })
        .catch(() => localStorage.removeItem('kelebet_admin_token'))
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    if (!['ADMIN','PHARMACIST'].includes(res.user.role)) throw new Error('Access denied. Admin or Pharmacist only.')
    localStorage.setItem('kelebet_admin_token', res.token)
    setUser(res.user)
    return res
  }

  const logout = () => { localStorage.removeItem('kelebet_admin_token'); setUser(null) }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
