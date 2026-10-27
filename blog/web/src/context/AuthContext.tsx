import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import type { User } from '../types'

type AuthContextValue = {
  user: User | null
  token: string | null
  ready: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!savedToken || !savedUser) {
      setReady(true)
      return
    }
    setToken(savedToken)
    try {
      setUser(JSON.parse(savedUser) as User)
    } catch {
      localStorage.removeItem('user')
    }
    client
      .get('/users/me')
      .then((res) => {
        setUser(res.data.user)
        localStorage.setItem('user', JSON.stringify(res.data.user))
      })
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      ready,
      async login(username, password) {
        const res = await client.post('/auth/login', { username, password })
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        setToken(res.data.token)
        setUser(res.data.user)
      },
      logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      },
      updateUser(next) {
        localStorage.setItem('user', JSON.stringify(next))
        setUser(next)
      },
    }),
    [user, token, ready]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider 缺失')
  return value
}
