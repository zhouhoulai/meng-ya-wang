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

  const getEncouragement = () => {
    if (accuracy >= 90) return { text: "太棒了！你是识字小天才！", mood: "excited" as const }
    if (accuracy >= 70) return { text: "做得真好！继续加油！", mood: "happy" as const }
    if (accuracy >= 50) return { text: "不错哦！多多练习会更好！", mood: "happy" as const }
    return { text: "别灰心！熟能生巧！", mood: "thinking" as const }
  }

  const encouragement = getEncouragement()

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-md md:max-w-2xl w-full space-y-6 md:space-y-8">
        {/* 完成标题 */}
        <div
          className={`text-center space-y-4 md:space-y-6 transition-all duration-700 ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-primary/20 mb-2">
            <Trophy className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">学习完成！</h1>
          <SproutMascot size="lg" mood={encouragement.mood} />
          <p className="text-xl md:text-2xl text-muted-foreground">{encouragement.text}</p>
        </div>

        {/* 学习成果卡片 */}
        <Card
          className={`p-6 md:p-8 space-y-6 md:space-y-8 transition-all duration-700 delay-200 ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* 能量豆奖励 */}
          <div className="text-center py-4 md:py-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl">
            <p className="text-sm md:text-base text-muted-foreground mb-2">获得能量豆</p>
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <div className="relative w-12 h-12 md:w-16 md:h-16">
                <svg viewBox="0 0 24 24" className="w-full h-full animate-bounce">
                  <ellipse cx="12" cy="12" rx="10" ry="8" fill="#FFD93D" />
                  <ellipse cx="12" cy="10" rx="8" ry="5" fill="#FFE566" />
                  <ellipse cx="9" cy="9" rx="3" ry="2" fill="#FFF5CC" opacity="0.8" />
                  <path d="M12 6 Q12 12 12 18" stroke="#E6C235" strokeWidth="1" fill="none" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-yellow-300 rounded-full animate-ping" />
              </div>
              <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-amber-600">+{displayBeans}</span>
            </div>
          </div>

          {/* 学习统计 - 增加平板字体大小 */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">{total}</div>
              <div className="text-sm md:text-base text-muted-foreground">总学习数</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">{correct}</div>
              <div className="text-sm md:text-base text-muted-foreground">认识</div>
            </div>
            <div className="space-y-1 md:space-y-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-500">{wrong}</div>
              <div className="text-sm md:text-base text-muted-foreground">待加强</div>
            </div>
          </div>

          {/* 正确率 - 增加平板尺寸 */}
          <div className="flex items-center justify-center gap-4 md:gap-6 py-4">
            <div className="flex items-center gap-2 md:gap-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${i < Math.ceil(accuracy / 20) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{accuracy}%</span>
          </div>
        </Card>

        {/* 操作按钮 - 增加平板按钮大小 */}
        <div
          className={`flex gap-4 md:gap-6 transition-all duration-700 delay-400 ${showAnimation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Link href="/study" className="flex-1">
            <Button variant="outline" className="w-full h-14 md:h-16 rounded-2xl text-lg md:text-xl bg-transparent">
              <RotateCcw className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              继续学习
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full h-14 md:h-16 rounded-2xl text-lg md:text-xl bg-primary hover:bg-primary/90">
              <Home className="w-5 h-5 md:w-6 md:h-6 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
