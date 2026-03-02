import { AdminDashboard } from '@/components/admin-dashboard'
import { AdminProvider } from '@/lib/admin-context'

export const metadata = {
  title: '管理员后台 - 萌芽生词王',
  description: '词库管理、用户管理、系统设置',
}

export default function AdminPage() {
  return (
    <AdminProvider>
      <AdminDashboard />
    </AdminProvider>
  )
}
