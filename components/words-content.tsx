'use client'

import { useState, useEffect } from 'react'
import { pinyin } from 'pinyin-pro'
import { getUserData, saveUserData, addCustomWord, removeCustomWord, isWordExists } from '@/lib/storage'
import { PRESET_WORDS } from '@/lib/word-data'
import type { UserData, Word, BoxLevel } from '@/lib/types'
import { BoxLevelBadge } from '@/components/box-level-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Trash2, Plus, Volume2 } from 'lucide-react'

export function WordsContent() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newWord, setNewWord] = useState({ word: '', pinyin: '', example: '' })

  useEffect(() => {
    setUserData(getUserData())
  }, [])

  if (!userData) {
    return <div className="p-8">加载中...</div>
  }

  const allWords = [...PRESET_WORDS, ...userData.customWords]
  const filteredWords = allWords.filter(
    (w) =>
      w.word.includes(searchQuery) ||
      w.pinyin.includes(searchQuery) ||
      w.example.includes(searchQuery)
  )

  const handleAddWord = () => {
    if (!newWord.word || !newWord.pinyin) return
    const updatedData = addCustomWord(userData, {
      word: newWord.word,
      pinyin: newWord.pinyin,
      example: newWord.example || '这是一个例句。',
    })
    saveUserData(updatedData)
    setUserData(updatedData)
    setNewWord({ word: '', pinyin: '', example: '' })
  }

  const handleRemoveWord = (wordId: string) => {
    const updatedData = removeCustomWord(userData, wordId)
    saveUserData(updatedData)
    setUserData(updatedData)
  }

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl space-y-6">
        {/* 头部 */}
        <div>
          <h1 className="text-3xl font-bold">生词本</h1>
          <p className="text-muted-foreground mt-2">管理您的自定义词汇</p>
        </div>

        {/* 搜索栏 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="搜索词语..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-lg"
          />
        </div>

        {/* 添加新词 */}
        <Card className="p-6">
          <h3 className="font-bold mb-4">添加新词汇</h3>
          <div className="space-y-4">
            <Input
              placeholder="输入词汇"
              value={newWord.word}
              onChange={(e) =>
                setNewWord({
                  ...newWord,
                  word: e.target.value,
                  pinyin: pinyin(e.target.value, {
                    toneType: 'symbol',
                    type: 'string',
                    separator: ' ',
                  }),
                })
              }
            />
            <Input
              placeholder="拼音（自动生成）"
              value={newWord.pinyin}
              readOnly
            />
            <Input
              placeholder="例句"
              value={newWord.example}
              onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
            />
            <Button onClick={handleAddWord} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              添加词汇
            </Button>
          </div>
        </Card>

        {/* 词汇列表 */}
        <div>
          <h3 className="font-bold mb-4">
            词汇列表 ({userData.customWords.length} 个自定义词)
          </h3>
          <div className="grid gap-4">
            {filteredWords.map((word) => {
              const progress = userData.wordProgress[word.id]
              const level = (progress?.boxLevel ?? 0) as BoxLevel
              return (
                <Card key={word.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold">{word.word}</span>
                        <span className="text-muted-foreground">{word.pinyin}</span>
                        {word.isCustom && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            自定义
                          </span>
                        )}
                        <BoxLevelBadge level={level} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{word.example}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(word.word)}
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      {word.isCustom && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveWord(word.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
