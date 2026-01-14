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

      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setPhase("show")
      } else {
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
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between mb-2">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
            </Link>
            <span className="text-sm md:text-base text-muted-foreground">
              {currentIndex + 1} / {words.length}
            </span>
            <EnergyBean count={userData.energyBeans} />
          </div>
          <Progress value={progress} className="h-2 md:h-3" />
        </div>
      </header>

      {/* 学习内容区 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
        {phase === "show" && (
          <div className="flex flex-col items-center gap-6 md:gap-8 animate-in fade-in duration-300 w-full">
            <WordCard word={currentWord} />

            {/* 操作按钮区 */}
            <div className="flex flex-col items-center gap-4 md:gap-6 w-full">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPhase("practice")}
                className="rounded-2xl h-12 md:h-14 px-6 md:px-8 text-base md:text-lg"
              >
                <Pencil className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                练习书写
              </Button>

              <div className="flex gap-4 md:gap-6 w-full max-w-xs md:max-w-md">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 h-14 md:h-16 rounded-2xl border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive text-base md:text-lg"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  不认识
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleAnswer(true)}
                  className="flex-1 h-14 md:h-16 rounded-2xl bg-primary hover:bg-primary/90 text-base md:text-lg"
                >
                  <Check className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                  认识
                </Button>
              </div>

              <p className="text-xs md:text-sm text-muted-foreground text-center">认识 +2 能量豆 · 不认识 +1 能量豆</p>
            </div>
          </div>
        )}

        {phase === "practice" && (
          <div className="flex flex-col items-center gap-6 md:gap-8 animate-in fade-in duration-300">
            <div className="text-center">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                {currentWord.word}
              </span>
              <span className="ml-3 text-xl sm:text-2xl md:text-3xl text-primary">{currentWord.pinyin}</span>
            </div>

            <TianZiGe word={currentWord.word} onComplete={() => setPhase("show")} />

            <Button variant="ghost" onClick={() => setPhase("show")} className="text-muted-foreground md:text-lg">
              返回
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
