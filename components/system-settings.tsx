'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Settings, Save, AlertCircle } from 'lucide-react'

export function SystemSettings() {
  const [adminPin, setAdminPin] = useState('666666')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinChanged, setPinChanged] = useState(false)

  const handleChangePin = () => {
    if (!newPin || !confirmPin) {
      alert('请填写新PIN码')
      return
    }

    if (newPin !== confirmPin) {
      alert('两次输入的PIN码不一致')
      return
    }

    if (newPin.length < 6) {
      alert('PIN码长度必须至少6位')
      return
    }

    // 这里应该保存到安全的位置，目前仅为演示
    setAdminPin(newPin)
    setNewPin('')
    setConfirmPin('')
    setPinChanged(true)
    alert('PIN码已更新！')
    setTimeout(() => setPinChanged(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* 系统信息 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          系统信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground">应用版本</label>
            <p className="text-lg font-semibold mt-1">v1.0.0</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">数据库类型</label>
            <p className="text-lg font-semibold mt-1">SQLite (Wasm)</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">存储方式</label>
            <p className="text-lg font-semibold mt-1">本地浏览器存储</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">最后更新</label>
            <p className="text-lg font-semibold mt-1">{new Date().toLocaleDateString('zh-CN')}</p>
          </div>
        </div>
      </Card>

      {/* 管理员PIN设置 */}
      <Card className="p-6 border-yellow-200 bg-yellow-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-yellow-600" />
          管理员PIN码
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          更改管理后台的访问PIN码。默认PIN码为 666666，建议更改为强密码。
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">当前PIN码</label>
            <Input type="password" value={adminPin} disabled className="bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">新PIN码</label>
            <Input
              type="password"
              placeholder="输入至少6位数字或字符"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">确认新PIN码</label>
            <Input
              type="password"
              placeholder="再次输入新PIN码"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
            />
          </div>

          {pinChanged && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              PIN码已成功更新！
            </div>
          )}

          <Button onClick={handleChangePin} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            更新PIN码
          </Button>
        </div>
      </Card>

      {/* 功能模块状态 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">功能模块状态</h3>
        <div className="space-y-3">
          {[
            { name: '词库管理', status: true },
            { name: 'AI辅助学习', status: true },
            { name: '学习分析', status: true },
            { name: '数据导入导出', status: true },
            { name: '用户管理', status: true },
            { name: '系统设置', status: true },
          ].map((module) => (
            <div key={module.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium">{module.name}</span>
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            </div>
          ))}
        </div>
      </Card>

      {/* 帮助信息 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2">快速帮助</h3>
        <ul className="text-sm space-y-2 text-muted-foreground">
          <li>• 词库管理：添加、编辑、删除自定义词汇</li>
          <li>• 用户管理：导出、导入、重置用户学习数据</li>
          <li>• AI功能：生成例句、学习建议、发音指导</li>
          <li>• 数据安全：定期备份用户学习数据</li>
        </ul>
      </Card>
    </div>
  )
}
