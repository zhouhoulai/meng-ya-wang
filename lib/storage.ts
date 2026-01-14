import {
  type UserData,
  type WordProgress,
  type BoxLevel,
  REVIEW_INTERVALS,
  type Word,
  type DictationBook,
} from "./types"
import { PRESET_WORDS } from "./word-data"

const STORAGE_KEY = "sprout_word_king_data"

// 获取今天的日期字符串
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

// 计算下次复习日期
export function calculateNextReviewDate(boxLevel: BoxLevel): string {
  const today = new Date()
  today.setDate(today.getDate() + REVIEW_INTERVALS[boxLevel])
  return today.toISOString().split("T")[0]
}

// 初始化默认用户数据
function getDefaultUserData(): UserData {
  const today = getTodayDate()
  const wordProgress: Record<string, WordProgress> = {}

  // 为预置词库初始化进度（全部从新词开始）
  PRESET_WORDS.forEach((word) => {
    wordProgress[word.id] = {
      wordId: word.id,
      boxLevel: 0,
      lastReviewDate: "",
      nextReviewDate: today,
      reviewCount: 0,
    }
  })

  return {
    energyBeans: 0,
    totalWordsLearned: 0,
    todayWordsLearned: 0,
    lastStudyDate: "",
    wordProgress,
    customWords: [],
    dictationBooks: [], // 初始化空的听写本列表
  }
}

// 获取用户数据
export function getUserData(): UserData {
  if (typeof window === "undefined") {
    return getDefaultUserData()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const defaultData = getDefaultUserData()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
    return defaultData
  }

  const data = JSON.parse(stored) as UserData

  // 检查是否是新的一天，重置今日学习数
  const today = getTodayDate()
  if (data.lastStudyDate !== today) {
    data.todayWordsLearned = 0
  }

  return data
}

// 保存用户数据
export function saveUserData(data: UserData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// 获取今日待学习的词汇
export function getTodayWords(data: UserData, limit = 10): Word[] {
  const today = getTodayDate()
  const allWords = [...PRESET_WORDS, ...data.customWords]

  // 筛选需要复习的词汇
  const wordsToReview = allWords.filter((word) => {
    const progress = data.wordProgress[word.id]
    if (!progress) return true // 新词
    if (progress.boxLevel >= 4 && progress.nextReviewDate > today) return false // 已掌握且未到复习时间
    return progress.nextReviewDate <= today
  })

  // 按盒子等级排序（优先复习等级低的词）
  wordsToReview.sort((a, b) => {
    const progressA = data.wordProgress[a.id]
    const progressB = data.wordProgress[b.id]
    const levelA = progressA?.boxLevel ?? 0
    const levelB = progressB?.boxLevel ?? 0
    return levelA - levelB
  })

  return wordsToReview.slice(0, limit)
}

// 更新词汇进度（认识）
export function markWordAsKnown(data: UserData, wordId: string): UserData {
  const progress = data.wordProgress[wordId] || {
    wordId,
    boxLevel: 0 as BoxLevel,
    lastReviewDate: "",
    nextReviewDate: getTodayDate(),
    reviewCount: 0,
  }

  // 升级盒子等级（最高4级）
  const newLevel = Math.min(progress.boxLevel + 1, 4) as BoxLevel

  return {
    ...data,
    energyBeans: data.energyBeans + 2, // 认识+2能量豆
    todayWordsLearned: data.todayWordsLearned + 1,
    totalWordsLearned: progress.reviewCount === 0 ? data.totalWordsLearned + 1 : data.totalWordsLearned,
    lastStudyDate: getTodayDate(),
    wordProgress: {
      ...data.wordProgress,
      [wordId]: {
        ...progress,
        boxLevel: newLevel,
        lastReviewDate: getTodayDate(),
        nextReviewDate: calculateNextReviewDate(newLevel),
        reviewCount: progress.reviewCount + 1,
      },
    },
  }
}

// 更新词汇进度（不认识 - 降级到新词）
export function markWordAsUnknown(data: UserData, wordId: string): UserData {
  const progress = data.wordProgress[wordId] || {
    wordId,
    boxLevel: 0 as BoxLevel,
    lastReviewDate: "",
    nextReviewDate: getTodayDate(),
    reviewCount: 0,
  }

  return {
    ...data,
    energyBeans: data.energyBeans + 1, // 不认识+1能量豆（鼓励学习）
    lastStudyDate: getTodayDate(),
    wordProgress: {
      ...data.wordProgress,
      [wordId]: {
        ...progress,
        boxLevel: 0, // 降级为新词
        lastReviewDate: getTodayDate(),
        nextReviewDate: getTodayDate(), // 立即需要复习
        reviewCount: progress.reviewCount + 1,
      },
    },
  }
}

export function addCustomWord(data: UserData, wordData: Omit<Word, "id" | "isCustom">): UserData {
  const newWord: Word = {
    ...wordData,
    id: `custom_${Date.now()}`,
    isCustom: true,
  }

  const today = getTodayDate()

  return {
    ...data,
    customWords: [...data.customWords, newWord],
    wordProgress: {
      ...data.wordProgress,
      [newWord.id]: {
        wordId: newWord.id,
        boxLevel: 0,
        lastReviewDate: "",
        nextReviewDate: today,
        reviewCount: 0,
      },
    },
  }
}

// 删除自定义词汇
export function removeCustomWord(data: UserData, wordId: string): UserData {
  const newProgress = { ...data.wordProgress }
  delete newProgress[wordId]

  return {
    ...data,
    customWords: data.customWords.filter((w) => w.id !== wordId),
    wordProgress: newProgress,
  }
}

export function addCustomWords(data: UserData, words: Array<Omit<Word, "id" | "isCustom">>): UserData {
  const today = getTodayDate()
  const allExistingWords = new Set([...PRESET_WORDS.map((w) => w.word), ...data.customWords.map((w) => w.word)])

  let updatedData = { ...data }

  words.forEach((wordData, index) => {
    // 跳过已存在的词语
    if (allExistingWords.has(wordData.word)) return

    const newWord: Word = {
      ...wordData,
      id: `custom_${Date.now()}_${index}`,
      isCustom: true,
    }

    updatedData = {
      ...updatedData,
      customWords: [...updatedData.customWords, newWord],
      wordProgress: {
        ...updatedData.wordProgress,
        [newWord.id]: {
          wordId: newWord.id,
          boxLevel: 0,
          lastReviewDate: "",
          nextReviewDate: today,
          reviewCount: 0,
        },
      },
    }

    allExistingWords.add(wordData.word)
  })

  return updatedData
}

export function isWordExists(data: UserData, word: string): boolean {
  const allWords = new Set([...PRESET_WORDS.map((w) => w.word), ...data.customWords.map((w) => w.word)])
  return allWords.has(word)
}

// 获取学习统计
export function getStudyStats(data: UserData) {
  const allWords = [...PRESET_WORDS, ...data.customWords]
  const stats = {
    total: allWords.length,
    newWords: 0,
    reviewing: 0,
    familiar: 0,
    veryFamiliar: 0,
    mastered: 0,
  }

  allWords.forEach((word) => {
    const progress = data.wordProgress[word.id]
    if (!progress || progress.boxLevel === 0) stats.newWords++
    else if (progress.boxLevel === 1) stats.reviewing++
    else if (progress.boxLevel === 2) stats.familiar++
    else if (progress.boxLevel === 3) stats.veryFamiliar++
    else if (progress.boxLevel === 4) stats.mastered++
  })

  return stats
}

// 获取所有词语（预置+自定义）
export function getAllWords(data: UserData): Word[] {
  return [...PRESET_WORDS, ...data.customWords]
}

// 根据ID获取词语
export function getWordById(data: UserData, wordId: string): Word | undefined {
  return getAllWords(data).find((w) => w.id === wordId)
}

// 根据ID列表获取词语
export function getWordsByIds(data: UserData, wordIds: string[]): Word[] {
  const allWords = getAllWords(data)
  return wordIds.map((id) => allWords.find((w) => w.id === id)).filter((w): w is Word => w !== undefined)
}

// 创建听写生词本
export function createDictationBook(data: UserData, name: string, wordIds: string[], color: string): UserData {
  const now = new Date().toISOString()
  const newBook: DictationBook = {
    id: `book_${Date.now()}`,
    name,
    wordIds,
    createdAt: now,
    updatedAt: now,
    color,
  }

  return {
    ...data,
    dictationBooks: [...data.dictationBooks, newBook],
  }
}

// 更新听写生词本
export function updateDictationBook(
  data: UserData,
  bookId: string,
  updates: Partial<Pick<DictationBook, "name" | "wordIds" | "color">>,
): UserData {
  return {
    ...data,
    dictationBooks: data.dictationBooks.map((book) =>
      book.id === bookId ? { ...book, ...updates, updatedAt: new Date().toISOString() } : book,
    ),
  }
}

// 删除听写生词本
export function deleteDictationBook(data: UserData, bookId: string): UserData {
  return {
    ...data,
    dictationBooks: data.dictationBooks.filter((book) => book.id !== bookId),
  }
}

// 向听写本添加词语
export function addWordsToDictationBook(data: UserData, bookId: string, wordIds: string[]): UserData {
  return {
    ...data,
    dictationBooks: data.dictationBooks.map((book) => {
      if (book.id !== bookId) return book
      const existingIds = new Set(book.wordIds)
      const newIds = wordIds.filter((id) => !existingIds.has(id))
      return {
        ...book,
        wordIds: [...book.wordIds, ...newIds],
        updatedAt: new Date().toISOString(),
      }
    }),
  }
}

// 从听写本移除词语
export function removeWordsFromDictationBook(data: UserData, bookId: string, wordIds: string[]): UserData {
  const idsToRemove = new Set(wordIds)
  return {
    ...data,
    dictationBooks: data.dictationBooks.map((book) => {
      if (book.id !== bookId) return book
      return {
        ...book,
        wordIds: book.wordIds.filter((id) => !idsToRemove.has(id)),
        updatedAt: new Date().toISOString(),
      }
    }),
  }
}
