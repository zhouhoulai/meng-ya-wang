'use client'

import { useState } from 'react'
import { AdminLogin } from '@/components/admin-login'
import { useAdmin } from '@/lib/admin-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LogOut } from 'lucide-react'
import { WordLibraryManager } from '@/components/word-library-manager'
import { UserDataManager } from '@/components/user-data-manager'
import { SystemSettings } from '@/components/system-settings'

export const metadata = {
  title: '管理员后台 - 萌芽生词王',
  description: '词库管理、用户管理、系统设置',
}

export default function AdminPage() {
  const { isAuthenticated, logout } = useAdmin()
  const [activeTab, setActiveTab] = useState('words')

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">管理员后台</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </Button>
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="words">词库管理</TabsTrigger>
            <TabsTrigger value="users">用户数据</TabsTrigger>
            <TabsTrigger value="settings">系统设置</TabsTrigger>
          </TabsList>

          <TabsContent value="words" className="space-y-4">
            <WordLibraryManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserDataManager />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
