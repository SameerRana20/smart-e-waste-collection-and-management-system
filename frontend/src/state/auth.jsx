import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'

const TOKEN_KEY = 'ewaste_token' // optional: backend is cookie-first
const ROLE_KEY = 'ewaste_role'

const AuthContext = createContext(null)

function extractToken(apiResponse) {
  // Backend uses apiResponse wrapper and cookie auth.
  // Only user login includes a token in body; collector/admin are cookie-only.
  const d = apiResponse?.data ?? apiResponse
  return d?.token || null
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY))
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [me, setMe] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  async function loadMe(r) {
    const res = await authService.me(r)
    // backend returns apiResponse
    return res?.data ?? res
  }

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        if (!role) return
        const user = await loadMe(role)
        if (!cancelled) setMe(user)
      } catch {
        if (!cancelled) {
          setMe(null)
          setRole(null)
          setToken(null)
          localStorage.removeItem(ROLE_KEY)
          localStorage.removeItem(TOKEN_KEY)
        }
      } finally {
        if (!cancelled) setBootstrapping(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function login({ role: roleInput, email, password, username }) {
    const nextRole = String(roleInput || 'user').toLowerCase()
    localStorage.setItem(ROLE_KEY, nextRole)
    setRole(nextRole)

    const res = await authService.login({ role: nextRole, email, password, username })

    const t = extractToken(res)
    if (t) {
      localStorage.setItem(TOKEN_KEY, t)
      setToken(t)
    } else {
      // collector/admin: cookie-based only
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
    }

    // Confirm authentication immediately via /me (cookie or header)
    const user = await loadMe(nextRole)
    setMe(user)
    return res
  }

  async function registerUser(payload) {
    const res = await authService.registerUser(payload)
    // Registration does not log in in backend; keep user on login.
    return res
  }

  async function registerCollector(payload) {
    const res = await authService.registerCollector(payload)
    return res
  }

  function logout() {
    authService.logout(role).catch(() => {})
    setMe(null)
    setRole(null)
    setToken(null)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  const value = useMemo(
    () => ({
      role,
      token,
      user: me,
      isAuthed: Boolean(me),
      bootstrapping,
      login,
      registerUser,
      registerCollector,
      logout,
      refreshMe: async () => {
        if (!role) return null
        const user = await loadMe(role)
        setMe(user)
        return user
      },
    }),
    [role, token, me, bootstrapping],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

