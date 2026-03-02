'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Pencil, BarChart3, Plus, Settings, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SidebarNav() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/', icon: BookOpen, label: '首页' },
    { href: '/study', icon: BookOpen, label: '学习' },
    { href: '/dictation', icon: Pencil, label: '听写' },
    { href: '/words', icon: Plus, label: '生词本' },
    { href: '/analytics', icon: BarChart3, label: '分析' },
    { href: '/admin', icon: Lock, label: '管理' },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card h-screen sticky top-0">
      <div className="p-6 space-y-8">
        {/* 品牌 */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">萌</span>
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">萌芽生词王</h1>
            <p className="text-xs text-muted-foreground">一年级生词辅导</p>
          </div>
        </Link>

        {/* 导航菜单 */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* 底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-card">
          <Button variant="outline" className="w-full" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            设置
          </Button>
        </div>
      </div>
    </aside>
  )
}
