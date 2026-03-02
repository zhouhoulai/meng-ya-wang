'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

const ADMIN_PIN = '666666'

interface AdminContextType {
  isAuthenticated: boolean
  login: (pin: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('admin_authenticated') === 'true'
  })

  const login = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_authenticated', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
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
