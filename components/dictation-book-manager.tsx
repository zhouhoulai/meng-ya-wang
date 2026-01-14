"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getUserData,
  saveUserData,
  getAllWords,
  createDictationBook,
  updateDictationBook,
  deleteDictationBook,
} from "@/lib/storage"
import type { UserData, Word, DictationBook, BoxLevel } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Volume2, Check, BookOpen, Search } from "lucide-react"

const BOOK_COLORS = [
  { name: "玫红", value: "bg-rose-100 border-rose-300 text-rose-700" },
  { name: "橙色", value: "bg-orange-100 border-orange-300 text-orange-700" },
  { name: "琥珀", value: "bg-amber-100 border-amber-300 text-amber-700" },
  { name: "青柠", value: "bg-lime-100 border-lime-300 text-lime-700" },
  { name: "翠绿", value: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  { name: "天蓝", value: "bg-sky-100 border-sky-300 text-sky-700" },
  { name: "靛蓝", value: "bg-indigo-100 border-indigo-300 text-indigo-700" },
  { name: "紫罗兰", value: "bg-violet-100 border-violet-300 text-violet-700" },
]

interface Props {
  onSelectBook: (book: DictationBook) => void
  selectedBookId?: string | null
}

export function DictationBookManager({ onSelectBook, selectedBookId }: Props) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingBook, setEditingBook] = useState<DictationBook | null>(null)
  const [newBookName, setNewBookName] = useState("")
  const [selectedColor, setSelectedColor] = useState(BOOK_COLORS[0].value)
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLevel, setFilterLevel] = useState<BoxLevel | "all">("all")

  useEffect(() => {
    const data = getUserData()
    // 确保 dictationBooks 存在
    if (!data.dictationBooks) {
      data.dictationBooks = []
      saveUserData(data)
    }
    setUserData(data)
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "zh-CN"
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }, [])

  // 获取筛选后的词语
  const getFilteredWords = useCallback((): Word[] => {
    if (!userData) return []
    const allWords = getAllWords(userData)

    return allWords.filter((word) => {
      // 搜索过滤
      if (searchQuery && !word.word.includes(searchQuery) && !word.pinyin.includes(searchQuery)) {
        return false
      }
      // 等级过滤
      if (filterLevel !== "all") {
        const progress = userData.wordProgress[word.id]
        const level = progress?.boxLevel ?? 0
        if (level !== filterLevel) return false
      }
      return true
    })
  }, [userData, searchQuery, filterLevel])

  // 切换词语选择
  const toggleWordSelection = (wordId: string) => {
    setSelectedWordIds((prev) => {
      const next = new Set(prev)
      if (next.has(wordId)) {
        next.delete(wordId)
      } else {
        next.add(wordId)
      }
      return next
    })
  }

  // 创建听写本
  const handleCreateBook = () => {
    if (!userData || !newBookName.trim() || selectedWordIds.size === 0) return

    const updatedData = createDictationBook(userData, newBookName.trim(), Array.from(selectedWordIds), selectedColor)
    saveUserData(updatedData)
    setUserData(updatedData)
    setShowCreateDialog(false)
    setNewBookName("")
    setSelectedWordIds(new Set())
    setSelectedColor(BOOK_COLORS[0].value)
  }

  // 打开编辑对话框
  const openEditDialog = (book: DictationBook) => {
    setEditingBook(book)
    setNewBookName(book.name)
    setSelectedColor(book.color)
    setSelectedWordIds(new Set(book.wordIds))
    setShowEditDialog(true)
  }

  // 更新听写本
  const handleUpdateBook = () => {
    if (!userData || !editingBook || !newBookName.trim()) return

    const updatedData = updateDictationBook(userData, editingBook.id, {
      name: newBookName.trim(),
      color: selectedColor,
      wordIds: Array.from(selectedWordIds),
    })
    saveUserData(updatedData)
    setUserData(updatedData)
    setShowEditDialog(false)
    setEditingBook(null)
    setNewBookName("")
    setSelectedWordIds(new Set())
  }

  // 删除听写本
  const handleDeleteBook = (bookId: string) => {
    if (!userData) return
    const updatedData = deleteDictationBook(userData, bookId)
    saveUserData(updatedData)
    setUserData(updatedData)
  }

  // 获取词语的等级颜色
  const getLevelColor = (wordId: string) => {
    if (!userData) return "bg-slate-100"
    const progress = userData.wordProgress[wordId]
    const level = progress?.boxLevel ?? 0
    const colors = ["bg-rose-100", "bg-orange-100", "bg-amber-100", "bg-lime-100", "bg-emerald-100"]
    return colors[level]
  }

  if (!userData) {
    return <div className="p-4 text-center text-muted-foreground">加载中...</div>
  }

  const filteredWords = getFilteredWords()

  return (
    <div className="space-y-4">
      {/* 听写本列表 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">我的听写本</h3>
          <Button
            size="sm"
            onClick={() => {
              setShowCreateDialog(true)
              setNewBookName("")
              setSelectedWordIds(new Set())
              setSelectedColor(BOOK_COLORS[0].value)
            }}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            新建
          </Button>
        </div>

        {userData.dictationBooks.length === 0 ? (
          <Card className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground mt-2">还没有听写本</p>
            <p className="text-sm text-muted-foreground/70">点击上方"新建"创建你的第一个听写本</p>
          </Card>
        ) : (
          <div className="grid gap-2">
            {userData.dictationBooks.map((book) => {
              const colorClasses = book.color || BOOK_COLORS[0].value
              const isSelected = selectedBookId === book.id
              return (
                <Card
                  key={book.id}
                  className={`p-4 border-2 cursor-pointer transition-all ${colorClasses} ${
                    isSelected ? "ring-2 ring-primary ring-offset-2 shadow-lg" : "hover:shadow-md"
                  }`}
                  onClick={() => onSelectBook(book)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{book.name}</h4>
                      <p className="text-sm opacity-70">{book.wordIds.length} 个词语</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(book)
                        }}
                        className="p-2 rounded-full hover:bg-black/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`确定要删除「${book.name}」吗？`)) {
                            handleDeleteBook(book.id)
                          }
                        }}
                        className="p-2 rounded-full hover:bg-black/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* 创建/编辑听写本对话框 */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false)
            setShowEditDialog(false)
            setEditingBook(null)
          }
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingBook ? "编辑听写本" : "新建听写本"}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-2">
            {/* 名称输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">听写本名称</label>
              <Input
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="如：第一单元、本周听写"
                className="rounded-xl"
              />
            </div>

            {/* 颜色选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">选择颜色</label>
              <div className="flex flex-wrap gap-2">
                {BOOK_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${color.value} ${
                      selectedColor === color.value ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* 词语选择 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">选择词语</label>
                <span className="text-xs text-muted-foreground">已选 {selectedWordIds.size} 个</span>
              </div>

              {/* 搜索和筛选 */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索词语..."
                    className="pl-9 rounded-xl"
                  />
                </div>
                <select
                  value={filterLevel}
                  onChange={(e) =>
                    setFilterLevel(e.target.value === "all" ? "all" : (Number(e.target.value) as BoxLevel))
                  }
                  className="px-3 rounded-xl border bg-background text-sm"
                >
                  <option value="all">全部</option>
                  <option value="0">新词</option>
                  <option value="1">复习中</option>
                  <option value="2">较熟悉</option>
                  <option value="3">很熟悉</option>
                  <option value="4">已掌握</option>
                </select>
              </div>

              {/* 词语列表 */}
              <div className="max-h-48 overflow-y-auto border rounded-xl p-2 space-y-1">
                {filteredWords.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">没有找到词语</p>
                ) : (
                  filteredWords.map((word) => {
                    const isSelected = selectedWordIds.has(word.id)
                    return (
                      <button
                        key={word.id}
                        onClick={() => toggleWordSelection(word.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                          isSelected
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-muted border border-transparent"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${getLevelColor(word.id)}`}>{word.word}</span>
                        <span className="text-xs text-muted-foreground">{word.pinyin}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            speak(word.word)
                          }}
                          className="ml-auto p-1 rounded hover:bg-muted"
                        >
                          <Volume2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false)
                setShowEditDialog(false)
              }}
              className="rounded-xl"
            >
              取消
            </Button>
            <Button
              onClick={editingBook ? handleUpdateBook : handleCreateBook}
              disabled={!newBookName.trim() || selectedWordIds.size === 0}
              className="rounded-xl"
            >
              {editingBook ? "保存修改" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
