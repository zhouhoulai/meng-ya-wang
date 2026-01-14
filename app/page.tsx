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
import { BookOpen, Plus, Sparkles, Pencil, Settings } from "lucide-react"
import { DataManager } from "@/components/data-manager"

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [todayWordCount, setTodayWordCount] = useState(0)
  const [showDataManager, setShowDataManager] = useState(false)

  const refreshData = () => {
    const data = getUserData()
    setUserData(data)
    setTodayWordCount(getTodayWords(data).length)
  }

  useEffect(() => {
    refreshData()
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
    <main className="min-h-screen bg-background p-4 md:p-6 lg:p-8 pb-24">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">
        {/* 顶部标题栏 */}
        <header className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <SproutMascot size="sm" mood="happy" />
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">萌芽生词王</h1>
          </div>
          <div className="flex items-center gap-3">
            <EnergyBean count={userData.energyBeans} />
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowDataManager(true)}>
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 今日学习卡片 */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm md:text-base">今日待学习</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">{todayWordCount}</span>
                  <span className="text-muted-foreground md:text-lg">个生词</span>
                </div>
                <p className="text-sm md:text-base text-muted-foreground">今日已学：{userData.todayWordsLearned} 个</p>
              </div>
              <div className="relative">
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 text-amber-400 animate-pulse" />
                <SproutMascot size="md" mood={todayWordCount > 0 ? "excited" : "happy"} />
              </div>
            </div>

            <Link href="/study" className="block mt-4 md:mt-6">
              <Button
                className="w-full h-14 md:h-16 text-lg md:text-xl rounded-2xl shadow-lg bg-primary hover:bg-primary/90"
                disabled={todayWordCount === 0}
              >
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                {todayWordCount > 0 ? "开始学习" : "今日任务已完成"}
              </Button>
            </Link>
          </Card>

          {/* 报听写入口卡片 */}
          <Card className="p-6 md:p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-amber-700 text-sm md:text-base font-medium">巩固练习</p>
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-amber-900">报听写</h3>
                <p className="text-sm md:text-base text-amber-600">听声音，写汉字</p>
              </div>
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Pencil className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
              </div>
            </div>
            <Link href="/dictation" className="block mt-4 md:mt-6">
              <Button className="w-full h-12 md:h-14 text-base md:text-lg rounded-2xl bg-amber-500 hover:bg-amber-600 text-white">
                开始听写
              </Button>
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* 学习进度 */}
          <Card className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">学习进度</h2>
            <div className="flex items-center gap-6 md:gap-8">
              <ProgressRing progress={masteryProgress} />
              <div className="flex-1 space-y-3 md:space-y-4">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">生词本总数</span>
                  <span className="font-medium text-foreground">{stats.total} 个</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">已掌握</span>
                  <span className="font-medium text-primary">{stats.mastered} 个</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">学习中</span>
                  <span className="font-medium text-amber-500">
                    {stats.reviewing + stats.familiar + stats.veryFamiliar} 个
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* 五级盒子分布 */}
          <Card className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">记忆盒子</h2>
            <div className="space-y-3 md:space-y-4">
              {[
                { name: "新词", count: stats.newWords, color: "bg-gray-300" },
                { name: "复习中", count: stats.reviewing, color: "bg-sky-400" },
                { name: "较熟悉", count: stats.familiar, color: "bg-amber-400" },
                { name: "很熟悉", count: stats.veryFamiliar, color: "bg-emerald-400" },
                { name: "已掌握", count: stats.mastered, color: "bg-pink-400" },
              ].map((box) => (
                <div key={box.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${box.color}`} />
                  <span className="text-sm md:text-base text-muted-foreground w-16 md:w-20">{box.name}</span>
                  <div className="flex-1 h-3 md:h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${box.color} rounded-full transition-all duration-500`}
                      style={{ width: `${stats.total > 0 ? (box.count / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm md:text-base font-medium w-8 md:w-10 text-right text-foreground">
                    {box.count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 md:py-4">
          <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex justify-around">
            <Link href="/" className="flex flex-col items-center gap-1 text-primary">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-xs md:text-sm">首页</span>
            </Link>
            <Link
              href="/dictation"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-xs md:text-sm">听写</span>
            </Link>
            <Link
              href="/words"
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-xs md:text-sm">生词本</span>
            </Link>
            <button
              onClick={() => setShowDataManager(true)}
              className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Settings className="w-6 h-6 md:w-7 md:h-7" />
              <span className="text-xs md:text-sm">设置</span>
            </button>
          </div>
        </nav>
      </div>

      <DataManager open={showDataManager} onOpenChange={setShowDataManager} onDataChange={refreshData} />
    </main>
  )
}
