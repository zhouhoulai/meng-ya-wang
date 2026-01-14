"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { SproutMascot } from "@/components/sprout-mascot"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Home, RotateCcw, Star, Trophy } from "lucide-react"

export function CompleteContent() {
  const searchParams = useSearchParams()
  const correct = Number.parseInt(searchParams.get("correct") || "0")
  const wrong = Number.parseInt(searchParams.get("wrong") || "0")
  const beans = Number.parseInt(searchParams.get("beans") || "0")

  const total = correct + wrong
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const [showAnimation, setShowAnimation] = useState(false)
  const [displayBeans, setDisplayBeans] = useState(0)

  useEffect(() => {
    setShowAnimation(true)

    // 能量豆计数动画
    const duration = 1000
    const steps = 20
    const increment = beans / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= beans) {
        setDisplayBeans(beans)
        clearInterval(timer)
      } else {
        setDisplayBeans(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [beans])

  // 根据正确率显示不同的鼓励语
  const getEncouragement = () => {
    if (accuracy >= 90) return { text: "太棒了！你是识字小天才！", mood: "excited" as const }
    if (accuracy >= 70) return { text: "做得真好！继续加油！", mood: "happy" as const }
    if (accuracy >= 50) return { text: "不错哦！多多练习会更好！", mood: "happy" as const }
    return { text: "别灰心！熟能生巧！", mood: "thinking" as const }
  }

  const encouragement = getEncouragement()

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* 完成标题 */}
        <div
          className={`text-center space-y-4 transition-all duration-700 ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-2">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">学习完成！</h1>
          <SproutMascot size="lg" mood={encouragement.mood} />
          <p className="text-xl text-muted-foreground">{encouragement.text}</p>
        </div>

        {/* 学习成果卡片 */}
        <Card
          className={`p-6 space-y-6 transition-all duration-700 delay-200 ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* 能量豆奖励 */}
          <div className="text-center py-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl">
            <p className="text-sm text-muted-foreground mb-2">获得能量豆</p>
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-12 h-12">
                <svg viewBox="0 0 24 24" className="w-full h-full animate-bounce">
                  <ellipse cx="12" cy="12" rx="10" ry="8" fill="#FFD93D" />
                  <ellipse cx="12" cy="10" rx="8" ry="5" fill="#FFE566" />
                  <ellipse cx="9" cy="9" rx="3" ry="2" fill="#FFF5CC" opacity="0.8" />
                  <path d="M12 6 Q12 12 12 18" stroke="#E6C235" strokeWidth="1" fill="none" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping" />
              </div>
              <span className="text-5xl font-bold text-amber-600">+{displayBeans}</span>
            </div>
          </div>

          {/* 学习统计 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-foreground">{total}</div>
              <div className="text-sm text-muted-foreground">总学习数</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">{correct}</div>
              <div className="text-sm text-muted-foreground">认识</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-amber-500">{wrong}</div>
              <div className="text-sm text-muted-foreground">待加强</div>
            </div>
          </div>

          {/* 正确率 */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 ${i < Math.ceil(accuracy / 20) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-foreground">{accuracy}%</span>
          </div>
        </Card>

        {/* 操作按钮 */}
        <div
          className={`flex gap-4 transition-all duration-700 delay-400 ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Link href="/study" className="flex-1">
            <Button variant="outline" className="w-full h-14 rounded-2xl text-lg bg-transparent">
              <RotateCcw className="w-5 h-5 mr-2" />
              继续学习
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full h-14 rounded-2xl text-lg bg-primary hover:bg-primary/90">
              <Home className="w-5 h-5 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
