'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const AdminContext = createContext<{
  isAuthenticated: boolean
  login: (pin: string) => boolean
  logout: () => void
} | null>(null)

const ADMIN_PIN = '666666' // 默认PIN，在生产环境应该更安全
const AUTH_KEY = 'admin_auth_v1'

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // 检查是否已登录
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_KEY)
      if (stored === 'true') {
        setIsAuthenticated(true)
      }
    }
    setMounted(true)
  }, [])

  const login = (pin: string) => {
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(AUTH_KEY, 'true')
      }
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_KEY)
    }
  }

  // SSR时返回未认证状态
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
