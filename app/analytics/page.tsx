'use client'

import { LearningAnalytics } from '@/components/learning-analytics'

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl">
        <h1 className="text-3xl font-bold mb-2">学习分析与报表</h1>
        <p className="text-muted-foreground mb-8">查看您的学习进度和统计数据</p>
        <LearningAnalytics />
      </div>
    </div>
  )
}
