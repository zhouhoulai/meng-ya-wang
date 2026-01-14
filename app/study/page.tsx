"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getUserData, saveUserData, getTodayWords, markWordAsKnown, markWordAsUnknown } from "@/lib/storage"
import type { UserData, Word } from "@/lib/types"
import { WordCard } from "@/components/word-card"
import { TianZiGe } from "@/components/tian-zi-ge"
import { EnergyBean } from "@/components/energy-bean"
import { SproutMascot } from "@/components/sprout-mascot"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, X, Pencil } from "lucide-react"
import Link from "next/link"
import { initVoices } from "@/lib/speech"

type StudyPhase = "show" | "practice"

export default function StudyPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<StudyPhase>("show")
  const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, beans: 0 })

  useEffect(() => {
    initVoices()
  }, [])

  useEffect(() => {
    const data = getUserData()
    const todayWords = getTodayWords(data)

    if (todayWords.length === 0) {
      router.push("/")
      return
    }

    setUserData(data)
    setWords(todayWords)
  }, [router])

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0

  // 处理认识/不认识
  const handleAnswer = useCallback(
    (known: boolean) => {
      if (!userData || !currentWord) return

      let newUserData: UserData
      let beansEarned: number

      if (known) {
        newUserData = markWordAsKnown(userData, currentWord.id)
        beansEarned = 2
        setSessionStats((prev) => ({
          correct: prev.correct + 1,
          wrong: prev.wrong,
          beans: prev.beans + beansEarned,
        }))
      } else {
        newUserData = markWordAsUnknown(userData, currentWord.id)
        beansEarned = 1
        setSessionStats((prev) => ({
          correct: prev.correct,
          wrong: prev.wrong + 1,
          beans: prev.beans + beansEarned,
        }))
      }

      saveUserData(newUserData)
      setUserData(newUserData)

      // 进入下一个词或结束
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setPhase("show")
      } else {
        // 学习完成，跳转到结算页
        router.push(
          `/complete?correct=${sessionStats.correct + (known ? 1 : 0)}&wrong=${sessionStats.wrong + (known ? 0 : 1)}&beans=${sessionStats.beans + beansEarned}`,
        )
      }
    },
    [userData, currentWord, currentIndex, words.length, sessionStats, router],
  )

  if (!userData || !currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SproutMascot size="lg" mood="thinking" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {words.length}
            </span>
            <EnergyBean count={userData.energyBeans} />
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* 学习内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        {phase === "show" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
            <WordCard word={currentWord} />

            {/* 操作按钮区 */}
            <div className="flex flex-col items-center gap-4 w-full">
              {/* 练习书写按钮 */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPhase("practice")}
                className="rounded-2xl h-12 px-6"
              >
                <Pencil className="w-5 h-5 mr-2" />
                练习书写
              </Button>

              <div className="flex gap-4 w-full max-w-xs">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 h-14 rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive"
                >
                  <X className="w-5 h-5 mr-2" />
                  不认识
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleAnswer(true)}
                  className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90"
                >
                  <Check className="w-5 h-5 mr-2" />
                  认识
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">认识 +2 能量豆 · 不认识 +1 能量豆</p>
            </div>
          </div>
        )}

        {phase === "practice" && (
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl font-bold text-foreground">{currentWord.word}</span>
              <span className="ml-3 text-xl sm:text-2xl text-primary">{currentWord.pinyin}</span>
            </div>

            <TianZiGe word={currentWord.word} onComplete={() => setPhase("show")} />

            <Button variant="ghost" onClick={() => setPhase("show")} className="text-muted-foreground">
              返回
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
