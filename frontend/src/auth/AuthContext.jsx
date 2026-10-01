import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService.js'
import { clearSession, readUser, saveSession } from './session.js'

// CONTEXT = data every component can read without passing props through every level.
// Without it, App would have to pass `user` down to Sidebar, pages, forms... ("prop drilling").
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readUser()) // start logged in if a valid token is saved
  const [notice, setNotice] = useState('') // e.g. "Your session expired" for the login page

  async function login(username, password) {
    const session = await authService.login(username, password) // POST /api/auth/login
    saveSession(session.accessToken, session.user)
    setNotice('')
    setUser(session.user)
    return session.user
  }

  async function register(form) {
    const session = await authService.register(form) // POST /api/auth/register
    saveSession(session.accessToken, session.user)
    setNotice('')
    setUser(session.user)
    return session.user
  }

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  // api.js fires "auth:expired" when the backend answers 401 (token expired or invalid).
  useEffect(() => {
    function onExpired() {
      setNotice('Your session expired. Please sign in again.')
      logout()
    }
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired) // clean up when unmounted
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, notice, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Any component: const { user, login, logout } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}

// Where each role lands after signing in.
export function homeFor(user) {
  return user?.role === 'ADMIN' ? '/admin' : '/app'
}
