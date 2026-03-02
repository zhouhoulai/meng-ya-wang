'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Users, Settings, LogOut, Plus, Trash2, Edit } from 'lucide-react'
import { useAdmin } from '@/lib/admin-context'
import { AdminLogin } from './admin-login'
import { WordLibraryManager } from './word-library-manager'
import { UserDataManager } from './user-data-manager'
import { SystemSettings } from './system-settings'

export function AdminDashboard() {
  const { isAuthenticated, logout } = useAdmin()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              管理员后台
            </h1>
            <p className="text-muted-foreground mt-1">词汇管理 · 用户管理 · 系统设置</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>

        {/* 标签页 */}
        <Tabs defaultValue="words" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="words" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              词库管理
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              用户管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              系统设置
            </TabsTrigger>
          </TabsList>

          {/* 词库管理 */}
          <TabsContent value="words">
            <WordLibraryManager />
          </TabsContent>

          {/* 用户管理 */}
          <TabsContent value="users">
            <UserDataManager />
          </TabsContent>

          {/* 系统设置 */}
          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
