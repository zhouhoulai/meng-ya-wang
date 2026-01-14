"use client"

import { useState, useEffect } from "react"
import type { Word } from "@/lib/types"
import { Volume2 } from "lucide-react"
import { speakWord, speakSentence, initVoices } from "@/lib/speech"

interface WordCardProps {
  word: Word
  showDetails?: boolean
}

export function WordCard({ word, showDetails = true }: WordCardProps) {
  const [isPlayingWord, setIsPlayingWord] = useState(false)
  const [isPlayingExample, setIsPlayingExample] = useState(false)

  // 初始化语音
  useEffect(() => {
    initVoices()
  }, [])

  const playWord = () => {
    speakWord(word.word, {
      onStart: () => setIsPlayingWord(true),
      onEnd: () => setIsPlayingWord(false),
    })
  }

  const playExample = () => {
    speakSentence(word.example, {
      onStart: () => setIsPlayingExample(true),
      onEnd: () => setIsPlayingExample(false),
    })
  }

  // 根据词语长度调整字体大小
  const getFontSize = () => {
    const len = word.word.length
    if (len <= 2) return "text-6xl sm:text-7xl"
    if (len <= 3) return "text-5xl sm:text-6xl"
    return "text-4xl sm:text-5xl"
  }

  // 根据词语长度调整容器大小
  const getContainerSize = () => {
    const len = word.word.length
    if (len <= 2) return "w-48 h-32 sm:w-56 sm:h-36"
    if (len <= 3) return "w-56 h-32 sm:w-64 sm:h-36"
    return "w-64 h-32 sm:w-72 sm:h-36"
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 词语展示 */}
      <div className="relative">
        <div
          className={`${getContainerSize()} bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-200 flex items-center justify-center shadow-lg`}
        >
          <span className={`${getFontSize()} text-foreground font-medium tracking-wider`}>{word.word}</span>
        </div>

        {/* 语音按钮 */}
        <button
          onClick={playWord}
          disabled={isPlayingWord}
          className={`absolute -right-3 -top-3 w-12 h-12 rounded-full shadow-md flex items-center justify-center transition-all ${
            isPlayingWord ? "bg-primary text-primary-foreground scale-110" : "bg-card text-primary hover:bg-primary/10"
          }`}
        >
          <Volume2 className={`w-6 h-6 ${isPlayingWord ? "animate-pulse" : ""}`} />
        </button>
      </div>

      {/* 拼音 */}
      <div className="text-xl sm:text-2xl text-primary font-medium tracking-wider">{word.pinyin}</div>

      {showDetails && (
        /* 例句 */
        <button
          onClick={playExample}
          className={`bg-muted/50 rounded-2xl px-6 py-4 max-w-sm transition-all ${
            isPlayingExample ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2">
            <p className="text-lg text-muted-foreground text-center leading-relaxed flex-1">{word.example}</p>
            <Volume2
              className={`w-5 h-5 flex-shrink-0 ${isPlayingExample ? "text-primary animate-pulse" : "text-muted-foreground/50"}`}
            />
          </div>
        </button>
      )}
    </div>
  )
}
