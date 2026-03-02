'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'
import { useAdmin } from '@/lib/admin-context'

export function AdminLogin({ onLoginSuccess?: () => void }: { onLoginSuccess?: () => void }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { login } = useAdmin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!pin) {
      setError('请输入PIN码')
      return
    }

    if (login(pin)) {
      setPin('')
      onLoginSuccess?.()
    } else {
      setError('PIN码错误')
      setPin('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">管理员登录</h1>
          <p className="text-sm text-muted-foreground text-center">
            输入PIN码以访问管理后台
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-foreground mb-2">
              PIN码
            </label>
            <Input
              id="pin"
              type="password"
              placeholder="请输入6位PIN码"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={6}
              autoFocus
              className="text-center text-2xl tracking-widest"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full">
            登录
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            默认PIN码: 666666（生产环境请修改）
          </p>
        </form>
      </Card>
    </div>
  )
}
