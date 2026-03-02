'use client'

import { LearningAnalytics } from '@/components/learning-analytics'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回主页
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">学习分析与报表</h1>
            <p className="text-muted-foreground mt-1">查看您的学习进度和统计数据</p>
          </div>
        </div>

        {/* 分析内容 */}
        <LearningAnalytics />
      </div>
    </main>
  )
}
