'use client'

import { SidebarNav } from './sidebar-nav'

interface PageLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export function PageLayout({ children, showSidebar = true }: PageLayoutProps) {
  if (!showSidebar) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
