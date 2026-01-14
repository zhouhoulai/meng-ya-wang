"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getUserData, getStudyStats, getTodayWords } from "@/lib/storage"
import type { UserData } from "@/lib/types"
import { SproutMascot } from "@/components/sprout-mascot"
import { EnergyBean } from "@/components/energy-bean"
import { ProgressRing } from "@/components/progress-ring"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, Plus, Sparkles, Pencil } from "lucide-react"

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [todayWordCount, setTodayWordCount] = useState(0)

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
    setTodayWordCount(getTodayWords(data).length)
  }, [])

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SproutMascot size="lg" mood="thinking" />
      </div>
    )
  }

  const stats = getStudyStats(userData)
  const masteryProgress = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0

  return (
    <main className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* 顶部标题栏 */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <SproutMascot size="sm" mood="happy" />
            <h1 className="text-xl font-bold text-foreground">萌芽生词王</h1>
          </div>
          <EnergyBean count={userData.energyBeans} />
        </header>

        {/* 今日学习卡片 */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">今日待学习</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">{todayWordCount}</span>
                <span className="text-muted-foreground">个生词</span>
              </div>
              <p className="text-sm text-muted-foreground">今日已学：{userData.todayWordsLearned} 个</p>
            </div>
            <div className="relative">
              <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-400 animate-pulse" />
              <SproutMascot size="md" mood={todayWordCount > 0 ? "excited" : "happy"} />
            </div>
          </div>

          <Link href="/study" className="block mt-4">
            <Button
              className="w-full h-14 text-lg rounded-2xl shadow-lg bg-primary hover:bg-primary/90"
              disabled={todayWordCount === 0}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {todayWordCount > 0 ? "开始学习" : "今日任务已完成"}
            </Button>
          </Link>
        </Card>

        {/* 报听写入口卡片 */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-amber-700 text-sm font-medium">巩固练习</p>
              <h3 className="text-xl font-bold text-amber-900">报听写</h3>
              <p className="text-sm text-amber-600">听声音，写汉字</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
              <Pencil className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <Link href="/dictation" className="block mt-4">
            <Button className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white">开始听写</Button>
          </Link>
        </Card>

        {/* 学习进度 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 text-foreground">学习进度</h2>
          <div className="flex items-center gap-6">
            <ProgressRing progress={masteryProgress} />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">生词本总数</span>
                <span className="font-medium text-foreground">{stats.total} 个</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">已掌握</span>
                <span className="font-medium text-primary">{stats.mastered} 个</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">学习中</span>
                <span className="font-medium text-amber-500">
                  {stats.reviewing + stats.familiar + stats.veryFamiliar} 个
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 五级盒子分布 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4 text-foreground">记忆盒子</h2>
          <div className="space-y-3">
            {[
              { name: "新词", count: stats.newWords, color: "bg-gray-300" },
              { name: "复习中", count: stats.reviewing, color: "bg-sky-400" },
              { name: "较熟悉", count: stats.familiar, color: "bg-amber-400" },
              { name: "很熟悉", count: stats.veryFamiliar, color: "bg-emerald-400" },
              { name: "已掌握", count: stats.mastered, color: "bg-pink-400" },
            ].map((box) => (
              <div key={box.name} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${box.color}`} />
                <span className="text-sm text-muted-foreground w-16">{box.name}</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${box.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stats.total > 0 ? (box.count / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right text-foreground">{box.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3">
          <div className="max-w-md mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center gap-1 text-primary">
              <BookOpen className="w-6 h-6" />
              <span className="text-xs">首页</span>
            </Link>
            <Link
              href="/dictation"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil className="w-6 h-6" />
              <span className="text-xs">听写</span>
            </Link>
            <Link
              href="/words"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs">生词本</span>
            </Link>
          </div>
        </nav>
      </div>
    </main>
  )
}
