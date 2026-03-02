'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Upload, RotateCcw, Trash2 } from 'lucide-react'
import { getUserData, exportUserData, importUserData, saveUserData } from '@/lib/storage'

export function UserDataManager() {
  const [dataStats, setDataStats] = useState<any>(null)
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [loading, setLoading] = useState(false)

  const loadStats = () => {
    try {
      const data = getUserData()
      setDataStats({
        totalWordsLearned: data.totalWordsLearned,
        energyBeans: data.energyBeans,
        customWords: data.customWords.length,
        dictationBooks: data.dictationBooks.length,
        allWords: data.customWords.length + 100, // 100为预置词库
      })
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  const handleExport = () => {
    try {
      const data = getUserData()
      const exported = exportUserData(data)
      const blob = new Blob([exported], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vocab-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert('数据导出成功！')
    } catch (e) {
      alert('导出失败，请重试')
    }
  }

  const handleImport = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = '.json'
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return

      setLoading(true)
      try {
        const text = await file.text()
        const currentData = getUserData()
        const imported = importUserData(text)

        if (imported) {
          if (importMode === 'replace') {
            saveUserData(imported)
          } else {
            // 合并模式：合并自定义词汇和生词本
            const merged = {
              ...currentData,
              customWords: [...currentData.customWords, ...imported.customWords],
              dictationBooks: [...currentData.dictationBooks, ...imported.dictationBooks],
            }
            saveUserData(merged)
          }
          alert('导入成功！')
          loadStats()
        } else {
          alert('导入失败：文件格式不正确')
        }
      } catch (e) {
        alert('导入错误，请检查文件格式')
      } finally {
        setLoading(false)
      }
    }
    fileInput.click()
  }

  const handleResetData = () => {
    if (!confirm('确定要重置所有学习数据吗？此操作不可撤销！')) {
      return
    }

    try {
      const defaultData = {
        energyBeans: 0,
        totalWordsLearned: 0,
        todayWordsLearned: 0,
        lastStudyDate: new Date().toISOString().split('T')[0],
        wordProgress: {},
        customWords: [],
        dictationBooks: [],
      }
      saveUserData(defaultData)
      alert('数据已重置！')
      loadStats()
    } catch (e) {
      alert('重置失败，请重试')
    }
  }

  return (
    <div className="space-y-6">
      {/* 数据统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">已学词汇</div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{dataStats?.totalWordsLearned || 0}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">能量豆</div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{dataStats?.energyBeans || 0}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">自定义词汇</div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{dataStats?.customWords || 0}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">生词本</div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{dataStats?.dictationBooks || 0}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">总词数</div>
          <div className="text-2xl font-bold text-orange-600 mt-2">{dataStats?.allWords || 0}</div>
        </Card>
      </div>

      {/* 数据操作 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">数据备份与恢复</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            导出数据
          </Button>
          <Button
            onClick={handleImport}
            disabled={loading}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {loading ? '导入中...' : '导入数据'}
          </Button>
        </div>

        {/* 导入模式选择 */}
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <label className="text-sm font-medium">导入模式</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="merge"
                checked={importMode === 'merge'}
                onChange={(e) => setImportMode(e.target.value as any)}
              />
              <span className="text-sm">合并（保留现有数据）</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="replace"
                checked={importMode === 'replace'}
                onChange={(e) => setImportMode(e.target.value as any)}
              />
              <span className="text-sm">替换（覆盖现有数据）</span>
            </label>
          </div>
        </div>
      </Card>

      {/* 危险操作 */}
      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="text-lg font-semibold text-red-700 mb-4">危险操作</h3>
        <p className="text-sm text-red-600 mb-4">以下操作将永久删除数据，请谨慎操作：</p>
        <Button
          onClick={handleResetData}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置所有学习数据
        </Button>
      </Card>
    </div>
  )
}
