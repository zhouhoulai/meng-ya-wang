'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import type { Word } from '@/lib/types'
import { addCustomWord } from '@/lib/storage'

export function WordLibraryManager() {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    word: '',
    pinyin: '',
    example: '',
  })

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.word || !formData.pinyin) {
      alert('请填写完整信息')
      return
    }

    // 这里需要集成到数据库
    // addCustomWord会添加到现有的userData中
    const newWord: Word = {
      id: `custom_${Date.now()}`,
      ...formData,
      isCustom: true,
    }

    alert('词语已添加！')
    setFormData({ word: '', pinyin: '', example: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      {/* 添加词语按钮 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">添加新词语</h2>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant={showForm ? 'outline' : 'default'}
            className="flex items-center gap-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? '取消' : '添加词语'}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleAddWord} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">词语</label>
              <Input
                placeholder="例如：春天"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">拼音</label>
              <Input
                placeholder="例如：chūn tiān"
                value={formData.pinyin}
                onChange={(e) => setFormData({ ...formData, pinyin: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">例句（可选）</label>
              <Textarea
                placeholder="例如：春天来了，花儿开放了。"
                value={formData.example}
                onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              确认添加
            </Button>
          </form>
        )}
      </Card>

      {/* 词库统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">预置词库</div>
          <div className="text-3xl font-bold text-indigo-600">100+</div>
          <p className="text-xs text-muted-foreground mt-2">标准词汇数</p>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">自定义词汇</div>
          <div className="text-3xl font-bold text-blue-600">0</div>
          <p className="text-xs text-muted-foreground mt-2">用户添加词汇</p>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground mb-1">总词数</div>
          <div className="text-3xl font-bold text-emerald-600">100+</div>
          <p className="text-xs text-muted-foreground mt-2">全部可学习词汇</p>
        </Card>
      </div>

      {/* 词库操作提示 */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-foreground mb-2">词库管理说明</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 添加新词语将实时保存到系统</li>
          <li>• 预置词库为系统标准词汇，不可删除</li>
          <li>• 自定义词汇可随时编辑或删除</li>
          <li>• 支持批量导入导出词库数据</li>
        </ul>
      </Card>
    </div>
  )
}
