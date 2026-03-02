"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { getUserData, getWordsByIds } from "@/lib/storage"
import { PRESET_WORDS } from "@/lib/word-data"
import type { UserData, Word, BoxLevel, DictationBook } from "@/lib/types"
import { SproutMascot } from "@/components/sprout-mascot"
import { DictationBookManager } from "@/components/dictation-book-manager"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Volume2,
  Check,
  X,
  RotateCcw,
  ChevronLeft,
  BookOpen,
  Layers,
  Pause,
  Play,
  Settings2,
  ChevronDown,
} from "lucide-react"
import { speakWord, initVoices, stopSpeaking } from "@/lib/speech"
import { playCountdownTick, playStartSound } from "@/lib/audio"

type DictationPhase = "select" | "dictating" | "result"
type SelectMode = "level" | "book"

interface DictationResult {
  word: Word
  isCorrect: boolean | null
}

interface SpeedSettings {
  voiceRate: number // 语音速度 0.5-1.0
  repeatInterval: number // 每遍间隔（秒）1-5
  wordInterval: number // 词间间隔（秒）2-8
}

const SPEED_PRESETS = {
  slow: { voiceRate: 0.6, repeatInterval: 3, wordInterval: 5, label: "慢速", desc: "适合初学" },
  normal: { voiceRate: 0.8, repeatInterval: 2, wordInterval: 3, label: "正常", desc: "推荐使用" },
  fast: { voiceRate: 0.95, repeatInterval: 1, wordInterval: 2, label: "快速", desc: "熟练掌握" },
}

export function DictationContent() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [phase, setPhase] = useState<DictationPhase>("select")
  const [selectMode, setSelectMode] = useState<SelectMode>("book")
  const [selectedLevel, setSelectedLevel] = useState<BoxLevel | "all" | null>(null)
  const [selectedBook, setSelectedBook] = useState<DictationBook | null>(null)
  const [selectedCount, setSelectedCount] = useState(5)
  const [dictationWords, setDictationWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<DictationResult[]>([])
  const [countdownDialog, setCountdownDialog] = useState(false)
  const [countdown, setCountdown] = useState(3)

  const [isPaused, setIsPaused] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [speedPreset, setSpeedPreset] = useState<"slow" | "normal" | "fast">("normal")
  const [showSpeedSettings, setShowSpeedSettings] = useState(false)
  const [customSpeed, setCustomSpeed] = useState<SpeedSettings>({
    voiceRate: 0.8,
    repeatInterval: 2,
    wordInterval: 3,
  })
  const [useCustomSpeed, setUseCustomSpeed] = useState(false)
  const [expandedLevel, setExpandedLevel] = useState<BoxLevel | "all" | null>(null)

  // 获取当前速度设置
  const currentSpeed = useCustomSpeed ? customSpeed : SPEED_PRESETS[speedPreset]

  useEffect(() => {
    initVoices()
  }, [])

  useEffect(() => {
    const data = getUserData()
    if (!data.dictationBooks) {
      data.dictationBooks = []
    }
    setUserData(data)
    if (data.dictationBooks && data.dictationBooks.length > 0) {
      setSelectedBook(data.dictationBooks[0])
    }
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      stopSpeaking()
    }
  }, [])

  const speakText = useCallback(
    (text: string): Promise<void> => {
      return speakWord(text, {
        rate: currentSpeed.voiceRate,
        pitch: 1.1,
      })
    },
    [currentSpeed.voiceRate],
  )

  const getWordsByLevel = useCallback(
    (level: BoxLevel | "all"): Word[] => {
      if (!userData) return []
      const allWords = [...PRESET_WORDS, ...userData.customWords]
      if (level === "all") return allWords
      return allWords.filter((word) => {
        const progress = userData.wordProgress[word.id]
        return progress?.boxLevel === level
      })
    },
    [userData],
  )

  const getWordsFromBook = useCallback(
    (book: DictationBook): Word[] => {
      if (!userData) return []
      return getWordsByIds(userData, book.wordIds)
    },
    [userData],
  )

  const playWordSequence = useCallback(
    async (wordIndex: number, repeatCount: number) => {
      if (wordIndex >= dictationWords.length) {
        setPhase("result")
        return
      }

      if (isPaused) return

      const word = dictationWords[wordIndex]
      setCurrentIndex(wordIndex)
      setPlayCount(repeatCount)
      setIsPlaying(true)

      await speakText(word.word)
      setIsPlaying(false)

      if (repeatCount < 3) {
        timerRef.current = setTimeout(() => {
          if (!isPaused) {
            playWordSequence(wordIndex, repeatCount + 1)
          }
        }, currentSpeed.repeatInterval * 1000)
      } else {
        timerRef.current = setTimeout(() => {
          if (!isPaused) {
            playWordSequence(wordIndex + 1, 1)
          }
        }, currentSpeed.wordInterval * 1000)
      }
    },
    [dictationWords, isPaused, speakText, currentSpeed.repeatInterval, currentSpeed.wordInterval],
  )

  const startDictation = () => {
    let words: Word[] = []

    if (selectMode === "book" && selectedBook) {
      words = getWordsFromBook(selectedBook)
    } else if (selectMode === "level" && selectedLevel !== null) {
      words = getWordsByLevel(selectedLevel)
    }

    if (words.length === 0) return

    const shuffled = [...words].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, selectedCount)
    setDictationWords(selected)
    setCurrentIndex(0)
    setResults(selected.map((word) => ({ word, isCorrect: null })))
    setPlayCount(0)
    setIsPaused(false)

    setCountdownDialog(true)
    setCountdown(3)
  }

  useEffect(() => {
    if (!countdownDialog) return
    if (countdown <= 0) {
      // 倒计时结束，播放开始音效
      playStartSound()
      setCountdownDialog(false)
      setPhase("dictating")
      setTimeout(() => playWordSequence(0, 1), 500)
      return
    }
    // 播放滴答声，countdown === 1 时播放最后一声（更高音调）
    playCountdownTick(countdown === 1)
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdownDialog, countdown, playWordSequence])

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false)
      playWordSequence(currentIndex, playCount || 1)
    } else {
      setIsPaused(true)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      stopSpeaking()
    }
  }

  const replayCurrentWord = async () => {
    if (dictationWords[currentIndex]) {
      setIsPlaying(true)
      await speakText(dictationWords[currentIndex].word)
      setIsPlaying(false)
    }
  }

  const markResult = (wordIndex: number, isCorrect: boolean) => {
    setResults((prev) => {
      const next = [...prev]
      next[wordIndex] = { ...next[wordIndex], isCorrect }
      return next
    })
  }

  const restartDictation = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    stopSpeaking()
    setPhase("select")
    setSelectedLevel(null)
    setSelectedBook(null)
    setDictationWords([])
    setCurrentIndex(0)
    setResults([])
    setIsPaused(false)
    setPlayCount(0)
    setExpandedLevel(null)
  }

  const getLevelCount = (level: BoxLevel | "all") => {
    return getWordsByLevel(level).length
  }

  const judgedResults = results.filter((r) => r.isCorrect !== null)
  const correctCount = judgedResults.filter((r) => r.isCorrect).length
  const accuracy = judgedResults.length > 0 ? Math.round((correctCount / judgedResults.length) * 100) : 0

  const getStars = () => {
    if (accuracy >= 90) return 3
    if (accuracy >= 70) return 2
    if (accuracy >= 50) return 1
    return 0
  }

  const handleSelectBook = (book: DictationBook) => {
    if (selectedBook?.id === book.id) {
      setSelectedBook(null)
    } else {
      setSelectedBook(book)
    }
    setSelectMode("book")
  }

  const canStart = () => {
    if (selectMode === "book") {
      return selectedBook && selectedBook.wordIds.length > 0
    }
    return selectedLevel !== null && getLevelCount(selectedLevel) > 0
  }

  const getSelectedWordCount = () => {
    if (selectMode === "book" && selectedBook) {
      return selectedBook.wordIds.length
    }
    if (selectMode === "level" && selectedLevel !== null) {
      return getLevelCount(selectedLevel)
    }
    return 0
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SproutMascot size="lg" mood="thinking" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl">
        {/* 顶部导航 */}
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl font-bold">报听写</h1>
          <p className="text-muted-foreground mt-2">听声音，写汉字</p>
        </header>

        {phase === "select" && (
          <div className="space-y-6 md:space-y-8">
            {/* 速度设置按钮 */}
            <Card
              className="p-4 md:p-5 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setShowSpeedSettings(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium md:text-lg">播报设置</p>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {useCustomSpeed ? "自定义" : SPEED_PRESETS[speedPreset].label} · 语速{currentSpeed.voiceRate}x
                    </p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
              </div>
            </Card>

            {/* 模式切换 */}
            <div className="flex gap-2 md:gap-3 p-1 bg-muted rounded-xl">
              <button
                onClick={() => {
                  setSelectMode("book")
                  setSelectedLevel(null)
                }}
                className={`flex-1 py-2 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-colors ${
                  selectMode === "book" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
                听写本
              </button>
              <button
                onClick={() => {
                  setSelectMode("level")
                  setSelectedBook(null)
                }}
                className={`flex-1 py-2 md:py-3 px-4 rounded-lg text-sm md:text-base font-medium transition-colors ${
                  selectMode === "level" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
                }`}
              >
                <Layers className="w-4 h-4 md:w-5 md:h-5 inline-block mr-2" />
                按等级
              </button>
            </div>

            {/* 听写本选择 */}
            {selectMode === "book" && (
              <DictationBookManager
                userData={userData}
                onUpdate={(newData) => setUserData(newData)}
                selectedBook={selectedBook}
                onSelectBook={setSelectedBook}
              />
            )}

            {/* 按等级选择 */}
            {selectMode === "level" && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-bold text-foreground md:text-lg">选择词语等级</h3>
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  {[
                    { level: "all" as const, label: "全部", color: "bg-slate-100", textColor: "text-slate-600" },
                    { level: 0 as BoxLevel, label: "新词", color: "bg-rose-100", textColor: "text-rose-600" },
                    { level: 1 as BoxLevel, label: "复习中", color: "bg-orange-100", textColor: "text-orange-600" },
                    { level: 2 as BoxLevel, label: "较熟悉", color: "bg-amber-100", textColor: "text-amber-600" },
                    { level: 3 as BoxLevel, label: "很熟悉", color: "bg-lime-100", textColor: "text-lime-600" },
                    { level: 4 as BoxLevel, label: "已掌握", color: "bg-emerald-100", textColor: "text-emerald-600" },
                  ].map(({ level, label, color, textColor }) => {
                    const count = getLevelCount(level)
                    const words = getWordsByLevel(level)
                    const isSelected = selectedLevel === level
                    const isExpanded = expandedLevel === level

                    return (
                      <div key={level} className="space-y-2">
                        <button
                          onClick={() => {
                            if (count > 0) {
                              setSelectedLevel(level)
                              setExpandedLevel(isExpanded ? null : level)
                            }
                          }}
                          disabled={count === 0}
                          className={`w-full p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5"
                              : count === 0
                                ? "border-muted bg-muted/50 opacity-50 cursor-not-allowed"
                                : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`font-medium ${isSelected ? "text-primary" : ""}`}>{label}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${color} ${textColor}`}>
                                {count}个词语
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && <Check className="w-4 h-4 text-primary" />}
                              {count > 0 && (
                                <ChevronDown
                                  className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* 词语列表展开区域 */}
                        {isExpanded && count > 0 && (
                          <div className="ml-2 p-3 rounded-xl bg-muted/30 border border-border animate-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                              {words.map((word) => (
                                <span
                                  key={word.id}
                                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${color} ${textColor}`}
                                >
                                  {word.word}
                                </span>
                              ))}
                            </div>
                            {words.length > 20 && (
                              <p className="text-xs text-muted-foreground mt-2 text-center">共 {words.length} 个词语</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 听写数量 */}
            {(selectedBook || selectedLevel) && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="font-bold text-foreground md:text-lg">听写数量</h3>
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setSelectedCount(count)}
                      className={`py-3 md:py-4 rounded-xl text-base md:text-lg font-medium transition-all ${
                        selectedCount === count
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {count}个
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 开始按钮 */}
            <Button
              className="w-full h-14 md:h-16 text-lg md:text-xl rounded-2xl"
              disabled={!selectedBook && !selectedLevel}
              onClick={startDictation}
            >
              开始听写
            </Button>
          </div>
        )}

        {/* 听写阶段 - 显示当前速度 */}
        {phase === "dictating" && dictationWords.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 进度 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                第 {currentIndex + 1} / {dictationWords.length} 个
              </span>
              <span>第 {playCount} / 3 遍</span>
            </div>

            {/* 进度条 */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentIndex + playCount / 3) / dictationWords.length) * 100}%` }}
              />
            </div>

            {/* 听写提示卡片 */}
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-6">
                {/* 播放动画 */}
                <div
                  className={`w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ${isPlaying ? "animate-pulse" : ""}`}
                >
                  <Volume2 className={`w-12 h-12 text-primary ${isPlaying ? "animate-bounce" : ""}`} />
                </div>

                <div>
                  <p className="text-2xl font-bold text-primary">
                    {isPlaying ? "正在播放..." : isPaused ? "已暂停" : "准备下一个..."}
                  </p>
                  <p className="text-muted-foreground mt-2">请在纸上写下听到的词语</p>
                </div>

                {/* 控制按钮 */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={togglePause}
                    className="rounded-2xl h-14 px-6 bg-transparent"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        继续
                      </>
                    ) : (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        暂停
                      </>
                    )}
                  </Button>
                  <Button onClick={replayCurrentWord} size="lg" className="rounded-2xl h-14 px-6" disabled={isPlaying}>
                    <Volume2 className="w-5 h-5 mr-2" />
                    再听一遍
                  </Button>
                </div>

                {/* 跳过按钮 */}
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (timerRef.current) clearTimeout(timerRef.current)
                    window.speechSynthesis?.cancel()
                    if (currentIndex < dictationWords.length - 1) {
                      playWordSequence(currentIndex + 1, 1)
                    } else {
                      setPhase("result")
                    }
                  }}
                  className="text-muted-foreground"
                >
                  跳过这个词
                </Button>
              </div>
            </Card>

            {/* 已播放词语列表（小提示） */}
            {currentIndex > 0 && (
              <div className="text-center text-sm text-muted-foreground">已播放 {currentIndex} 个词语</div>
            )}
          </div>
        )}

        {/* 结果阶段 */}
        {phase === "result" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center py-4">
              <SproutMascot
                size="md"
                mood={judgedResults.length === results.length ? (accuracy >= 70 ? "happy" : "thinking") : "happy"}
              />
              <h2 className="text-xl font-bold mt-4">听写完成!</h2>
              <p className="text-sm text-muted-foreground mt-1">点击词语标记对错</p>
            </div>

            {/* 词语列表 - 点击评判 */}
            <Card className="p-4">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">点击标记每个词语的对错</h3>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={result.word.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      result.isCorrect === true
                        ? "bg-green-50 border-green-300"
                        : result.isCorrect === false
                          ? "bg-rose-50 border-rose-300"
                          : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                      <button
                        onClick={() => speakText(result.word.word)}
                        className="flex items-center gap-2 hover:opacity-70"
                      >
                        <span className="font-bold text-lg">{result.word.word}</span>
                        <span className="text-sm text-muted-foreground">{result.word.pinyin}</span>
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => markResult(index, true)}
                        className={`p-2 rounded-full transition-all ${
                          result.isCorrect === true ? "bg-green-500 text-white" : "bg-muted hover:bg-green-100"
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => markResult(index, false)}
                        className={`p-2 rounded-full transition-all ${
                          result.isCorrect === false ? "bg-rose-500 text-white" : "bg-muted hover:bg-rose-100"
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 统计卡片 - 只有全部评判完才显示 */}
            {judgedResults.length === results.length && (
              <>
                <Card className="p-6">
                  <div className="text-center mb-4">
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3].map((star) => (
                        <span key={star} className={`text-3xl ${star <= getStars() ? "" : "opacity-30"}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-4xl font-bold text-primary">{accuracy}%</p>
                    <p className="text-sm text-muted-foreground">正确率</p>
                  </div>
                  <div className="flex justify-center gap-8 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                      <p className="text-xs text-muted-foreground">正确</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-rose-500">{judgedResults.length - correctCount}</p>
                      <p className="text-xs text-muted-foreground">错误</p>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={restartDictation}
                    className="flex-1 h-12 rounded-xl bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    再来一次
                  </Button>
                  <Button onClick={() => router.push("/")} className="flex-1 h-12 rounded-xl">
                    返回首页
                  </Button>
                </div>
              </>
            )}

            {judgedResults.length < results.length && (
              <p className="text-center text-sm text-muted-foreground">
                还有 {results.length - judgedResults.length} 个词语未评判
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
