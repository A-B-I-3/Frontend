import { createContext, useContext, useState, type ReactNode } from 'react'
import { setAuthToken } from '../api/client'

type UserRecord = Record<string, unknown> & { type: 'interviewee' | 'interviewer' }

type AuthContextValue = {
  user: UserRecord | null
  login: (token: string, record: Record<string, unknown>, type: 'interviewee' | 'interviewer') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null)

  function login(token: string, record: Record<string, unknown>, type: 'interviewee' | 'interviewer') {
    setAuthToken(token)
    setUser({ ...record, type })
  }

  function logout() {
    setAuthToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
