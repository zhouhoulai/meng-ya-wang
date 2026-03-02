'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader, Lightbulb, Volume2, Sparkles } from 'lucide-react'
import type { Word } from '@/lib/types'

interface AILearningHelperProps {
  word: Word
  onClose?: () => void
}

type LoadingState = 'idle' | 'sentences' | 'tips' | 'pronunciation'

export function AILearningHelper({ word, onClose }: AILearningHelperProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [sentences, setSentences] = useState<string[]>([])
  const [tips, setTips] = useState<string[]>([])
  const [pronunciationGuide, setPronunciationGuide] = useState<string>('')
  const [error, setError] = useState<string>('')

  const generateSentences = async () => {
    setLoadingState('sentences')
    setError('')
    try {
      const res = await fetch('/api/ai-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateSentence',
          word: word.word,
          pinyin: word.pinyin,
          example: word.example,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setSentences(data.sentences || [])
      } else {
        setError('生成例句失败')
      }
    } catch (e) {
      setError('网络错误，请重试')
    } finally {
      setLoadingState('idle')
    }
  }

  const generateTips = async () => {
    setLoadingState('tips')
    setError('')
    try {
      const res = await fetch('/api/ai-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generateLearningTips',
          word: word.word,
          pinyin: word.pinyin,
          example: word.example,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setTips(data.tips || [])
      } else {
        setError('生成学习建议失败')
      }
    } catch (e) {
      setError('网络错误，请重试')
    } finally {
      setLoadingState('idle')
    }
  }

  const generatePronunciation = async () => {
    setLoadingState('pronunciation')
    setError('')
    try {
      const res = await fetch('/api/ai-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generatePronunciationGuide',
          word: word.word,
          pinyin: word.pinyin,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setPronunciationGuide(data.guide || '')
      } else {
        setError('生成发音指导失败')
      }
    } catch (e) {
      setError('网络错误，请重试')
    } finally {
      setLoadingState('idle')
    }
  }

  return (
    <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI学习助手
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {word.word} ({word.pinyin})
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 生成例句 */}
      <div className="space-y-2">
        <Button
          onClick={generateSentences}
          disabled={loadingState === 'sentences'}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          {loadingState === 'sentences' ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          生成更多例句
        </Button>
        {sentences.length > 0 && (
          <div className="space-y-2 pl-2 border-l-2 border-blue-200">
            {sentences.map((sentence, idx) => (
              <p key={idx} className="text-sm text-foreground">
                • {sentence}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 学习建议 */}
      <div className="space-y-2">
        <Button
          onClick={generateTips}
          disabled={loadingState === 'tips'}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          {loadingState === 'tips' ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          学习建议
        </Button>
        {tips.length > 0 && (
          <div className="space-y-2 pl-2 border-l-2 border-yellow-200 bg-yellow-50 p-3 rounded">
            {tips.map((tip, idx) => (
              <p key={idx} className="text-sm text-foreground">
                💡 {tip}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* 发音指导 */}
      <div className="space-y-2">
        <Button
          onClick={generatePronunciation}
          disabled={loadingState === 'pronunciation'}
          variant="outline"
          className="w-full justify-start gap-2"
        >
          {loadingState === 'pronunciation' ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          发音指导
        </Button>
        {pronunciationGuide && (
          <div className="pl-2 border-l-2 border-purple-200 bg-purple-50 p-3 rounded">
            <p className="text-sm text-foreground whitespace-pre-wrap">{pronunciationGuide}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
