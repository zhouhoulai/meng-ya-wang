'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getUserData, getStudyStats } from '@/lib/storage'
import type { UserData } from '@/lib/types'
import { TrendingUp, Target, Zap, Clock } from 'lucide-react'

export function LearningAnalytics() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const data = getUserData()
      setUserData(data)
      const studyStats = getStudyStats(data)
      setStats(studyStats)
    } catch (e) {
      console.error('Failed to load analytics:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return <div className="text-center p-8">加载中...</div>
  }

  if (!userData || !stats) {
    return <div className="text-center p-8">暂无数据</div>
  }

  // 盒子分布数据
  const boxDistribution = [
    { name: '新词', value: stats.newWords, color: '#ef4444' },
    { name: '复习中', value: stats.reviewing, color: '#f97316' },
    { name: '较熟悉', value: stats.familiar, color: '#eab308' },
    { name: '很熟悉', value: stats.veryFamiliar, color: '#3b82f6' },
    { name: '已掌握', value: stats.mastered, color: '#10b981' },
  ]

  // 学习进度数据
  const progressData = [
    { name: '已学', value: userData.totalWordsLearned },
    { name: '未学', value: stats.total - userData.totalWordsLearned },
  ]

  // 模拟学习趋势数据
  const trendData = [
    { date: '周一', count: 3 },
    { date: '周二', count: 5 },
    { date: '周三', count: 4 },
    { date: '周四', count: 6 },
    { date: '周五', count: 8 },
    { date: '周六', count: 7 },
    { date: '周日', count: 5 },
  ]

  const masteryPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* KPI卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已学词汇</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">{userData.totalWordsLearned}</p>
              <p className="text-xs text-muted-foreground mt-1">/{stats.total} 词汇</p>
            </div>
            <Target className="w-8 h-8 text-indigo-200" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">掌握度</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{masteryPercent}%</p>
              <p className="text-xs text-muted-foreground mt-1">{stats.mastered} 已掌握</p>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-200" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">能量豆</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{userData.energyBeans}</p>
              <p className="text-xs text-muted-foreground mt-1">学习累计</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-200" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">今日学习</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{userData.todayWordsLearned}</p>
              <p className="text-xs text-muted-foreground mt-1">个词汇</p>
            </div>
            <Clock className="w-8 h-8 text-blue-200" />
          </div>
        </Card>
      </div>

      {/* 图表 */}
      <Tabs defaultValue="distribution" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution">词汇分布</TabsTrigger>
          <TabsTrigger value="progress">学习进度</TabsTrigger>
          <TabsTrigger value="trend">学习趋势</TabsTrigger>
        </TabsList>

        {/* 词汇分布 - 饼图 */}
        <TabsContent value="distribution">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">词汇学习等级分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={boxDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {boxDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {boxDistribution.map((item) => (
                <div key={item.name} className="text-center">
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* 学习进度 - 柱状图 */}
        <TabsContent value="progress">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">总体学习进度</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" name="词汇数" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground">已学词汇</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{userData.totalWordsLearned}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground">未学词汇</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.total - userData.totalWordsLearned}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 学习趋势 - 折线图 */}
        <TabsContent value="trend">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">一周学习趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="学习词数"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 学习建议 */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
        <h3 className="text-lg font-semibold mb-3">学习建议</h3>
        <ul className="space-y-2 text-sm">
          {stats.newWords > 10 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <span>新词较多（{stats.newWords}个），建议加强基础学习。</span>
            </li>
          )}
          {stats.mastered > stats.total * 0.5 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>已掌握超过一半词汇，继续加油！</span>
            </li>
          )}
          {userData.todayWordsLearned === 0 && (
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">•</span>
              <span>今天还没有学习，不如现在就开始？</span>
            </li>
          )}
          {userData.energyBeans > 100 && (
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>能量豆已累计{userData.energyBeans}个，继续保持学习热情！</span>
            </li>
          )}
        </ul>
      </Card>
    </div>
  )
}
