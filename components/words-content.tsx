"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { pinyin } from "pinyin-pro"
import { getUserData, saveUserData, addCustomWord, addCustomWords, removeCustomWord, isWordExists } from "@/lib/storage"
import { PRESET_WORDS } from "@/lib/word-data"
import type { UserData, Word, BoxLevel } from "@/lib/types"
import { BoxLevelBadge } from "@/components/box-level-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, BookOpen, Plus, Trash2, Volume2, Search, Type, Sparkles, Check } from "lucide-react"

function getPinyinForWord(word: string): string {
  return pinyin(word, { toneType: "symbol", type: "string", separator: " " })
}

export function WordsContent() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newWord, setNewWord] = useState({ word: "", pinyin: "", example: "" })
  const [activeTab, setActiveTab] = useState("all")

  // 智能添加相关状态
  const [isSentenceDialogOpen, setIsSentenceDialogOpen] = useState(false)
  const [sentenceInput, setSentenceInput] = useState("")
  const [extractedWords, setExtractedWords] = useState<
    Array<{ word: string; pinyin: string; exists: boolean; selected: boolean }>
  >([])

  useEffect(() => {
    setUserData(getUserData())
  }, [])

  // 从句子中提取词语（简单分词：2-4字词语）
  const extractWordsFromSentence = (sentence: string) => {
    if (!userData || !sentence.trim()) {
      setExtractedWords([])
      return
    }

    // 简单分词策略：提取连续的汉字序列，然后按 2-4 字切分
    const chinesePattern = /[\u4e00-\u9fa5]+/g
    const matches = sentence.match(chinesePattern) || []

    const words: Array<{ word: string; pinyin: string; exists: boolean; selected: boolean }> = []
    const seenWords = new Set<string>()

    matches.forEach((segment) => {
      // 对于每个连续汉字段，提取 2-4 字词语
      for (let len = 2; len <= Math.min(4, segment.length); len++) {
        for (let i = 0; i <= segment.length - len; i++) {
          const word = segment.slice(i, i + len)
          if (!seenWords.has(word)) {
            seenWords.add(word)
            words.push({
              word,
              pinyin: getPinyinForWord(word),
              exists: isWordExists(userData, word),
              selected: false,
            })
          }
        }
      }
    })

    setExtractedWords(words)
  }

  useEffect(() => {
    extractWordsFromSentence(sentenceInput)
  }, [sentenceInput, userData])

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const allWords = [...PRESET_WORDS, ...userData.customWords]

  // 筛选词汇
  const filterWords = (words: Word[]) => {
    let filtered = words

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(
        (w) => w.word.includes(searchQuery) || w.pinyin.includes(searchQuery) || w.example.includes(searchQuery),
      )
    }

    // 按等级筛选
    if (activeTab !== "all" && activeTab !== "custom") {
      const level = Number.parseInt(activeTab) as BoxLevel
      filtered = filtered.filter((w) => {
        const progress = userData.wordProgress[w.id]
        return progress?.boxLevel === level || (!progress && level === 0)
      })
    }

    // 自定义词汇筛选
    if (activeTab === "custom") {
      filtered = filtered.filter((w) => w.isCustom)
    }

    return filtered
  }

  const filteredWords = filterWords(allWords)

  // 播放语音
  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "zh-CN"
      utterance.rate = 0.7
      window.speechSynthesis.speak(utterance)
    }
  }

  // 添加自定义词汇
  const handleAddWord = () => {
    if (!newWord.word || !newWord.pinyin) return

    const updatedData = addCustomWord(userData, {
      word: newWord.word,
      pinyin: newWord.pinyin,
      example: newWord.example || `这是一个例句。`,
    })

    saveUserData(updatedData)
    setUserData(updatedData)
    setNewWord({ word: "", pinyin: "", example: "" })
    setIsAddDialogOpen(false)
  }

  const handleWordChange = (word: string) => {
    const py = getPinyinForWord(word)
    setNewWord({
      ...newWord,
      word,
      pinyin: py || newWord.pinyin,
    })
  }

  // 删除自定义词汇
  const handleRemoveWord = (wordId: string) => {
    const updatedData = removeCustomWord(userData, wordId)
    saveUserData(updatedData)
    setUserData(updatedData)
  }

  // 获取词汇的盒子等级
  const getWordLevel = (wordId: string): BoxLevel => {
    return userData.wordProgress[wordId]?.boxLevel ?? 0
  }

  // 切换词语选择状态
  const toggleWordSelection = (index: number) => {
    setExtractedWords((prev) => prev.map((w, i) => (i === index ? { ...w, selected: !w.selected } : w)))
  }

  // 批量添加选中的词语
  const handleBatchAdd = () => {
    const selectedWords = extractedWords.filter((w) => w.selected && !w.exists)
    if (selectedWords.length === 0) return

    const wordsToAdd = selectedWords.map((w) => ({
      word: w.word,
      pinyin: w.pinyin,
      example: `这是一个包含"${w.word}"的例句。`,
    }))

    const updatedData = addCustomWords(userData, wordsToAdd)
    saveUserData(updatedData)
    setUserData(updatedData)

    // 重置状态
    setSentenceInput("")
    setExtractedWords([])
    setIsSentenceDialogOpen(false)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    const selectableWords = extractedWords.filter((w) => !w.exists)
    const allSelected = selectableWords.every((w) => w.selected)

    setExtractedWords((prev) => prev.map((w) => (w.exists ? w : { ...w, selected: !allSelected })))
  }

  const selectedCount = extractedWords.filter((w) => w.selected && !w.exists).length

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* 顶部导航 */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">生词本</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="搜索词语、拼音或例句..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>

        {/* 智能添加卡片 */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">智能添加生词</p>
              <p className="text-sm text-muted-foreground">输入句子，点选不认识的词语</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSentenceDialogOpen(true)} className="rounded-full">
              <Type className="w-4 h-4 mr-1" />
              开始
            </Button>
          </div>
        </Card>

        {/* 分类标签 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full h-auto flex-wrap gap-1 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="all" className="flex-1 min-w-16 rounded-lg data-[state=active]:bg-background">
              全部
            </TabsTrigger>
            <TabsTrigger value="0" className="flex-1 min-w-16 rounded-lg data-[state=active]:bg-background">
              新词
            </TabsTrigger>
            <TabsTrigger value="4" className="flex-1 min-w-16 rounded-lg data-[state=active]:bg-background">
              已掌握
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex-1 min-w-16 rounded-lg data-[state=active]:bg-background">
              自定义
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-3">
            {filteredWords.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">暂无词语</p>
              </div>
            ) : (
              filteredWords.map((word) => (
                <Card key={word.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => playAudio(word.word)}
                      className="w-10 h-10 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Volume2 className="w-5 h-5 text-primary" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl font-bold">{word.word}</span>
                        <span className="text-sm text-primary">{word.pinyin}</span>
                        <BoxLevelBadge level={getWordLevel(word.id)} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{word.example}</p>
                    </div>
                    {word.isCustom && (
                      <button
                        onClick={() => handleRemoveWord(word.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 添加按钮 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <button className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
            <Plus className="w-6 h-6" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>添加生词</DialogTitle>
            <DialogDescription>添加一个新词语到你的生词本</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">词语</label>
              <Input
                placeholder="输入词语（如：苹果）"
                value={newWord.word}
                onChange={(e) => handleWordChange(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">拼音</label>
              <Input
                placeholder="píng guǒ"
                value={newWord.pinyin}
                onChange={(e) => setNewWord({ ...newWord, pinyin: e.target.value })}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">例句</label>
              <Input
                placeholder="我喜欢吃苹果。"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                className="h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddWord} disabled={!newWord.word || !newWord.pinyin}>
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 智能添加对话框 */}
      <Dialog open={isSentenceDialogOpen} onOpenChange={setIsSentenceDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>智能添加生词</DialogTitle>
            <DialogDescription>输入一段文字，系统会自动提取词语，点击选择不认识的词</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 flex-1 overflow-auto">
            <div className="space-y-2">
              <label className="text-sm font-medium">输入句子或段落</label>
              <textarea
                placeholder="例如：小明今天去学校上学，遇到了他的好朋友小红。"
                value={sentenceInput}
                onChange={(e) => setSentenceInput(e.target.value)}
                className="w-full h-24 px-3 py-2 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {extractedWords.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">点击选择不认识的词语</p>
                  <button onClick={toggleSelectAll} className="text-xs text-primary hover:underline">
                    {extractedWords.filter((w) => !w.exists).every((w) => w.selected) ? "取消全选" : "全选"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                  {extractedWords.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => !item.exists && toggleWordSelection(index)}
                      disabled={item.exists}
                      className={`px-3 py-2 rounded-xl border-2 transition-all text-left ${
                        item.exists
                          ? "bg-muted/50 border-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : item.selected
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {!item.exists && (
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              item.selected ? "bg-primary border-primary" : "border-muted-foreground"
                            }`}
                          >
                            {item.selected && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{item.word}</span>
                          <span className="text-xs text-muted-foreground ml-1">({item.pinyin})</span>
                        </div>
                      </div>
                      {item.exists && <span className="text-xs text-muted-foreground">已在词库</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSentenceInput("")
                setExtractedWords([])
                setIsSentenceDialogOpen(false)
              }}
            >
              取消
            </Button>
            <Button onClick={handleBatchAdd} disabled={selectedCount === 0}>
              添加 {selectedCount > 0 ? `(${selectedCount})` : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
