'use client'

import type {
  UserData,
  WordProgress,
  BoxLevel,
  Word,
  DictationBook,
} from './types'
import { REVIEW_INTERVALS } from './types'
import { PRESET_WORDS } from './word-data'
import * as dbService from './db-service'

// 迁移旧数据到新数据库
async function migrateOldData() {
  if (typeof window === 'undefined') return

  const OLD_STORAGE_KEY = 'sprout_word_king_data'
  const MIGRATION_FLAG = 'migration_to_sqlite_done'

  if (localStorage.getItem(MIGRATION_FLAG)) {
    return
  }

  try {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldData) {
      const parsed = JSON.parse(oldData) as UserData
      
      // 迁移用户数据
      dbService.updateUserData({
        energyBeans: parsed.energyBeans,
        totalWordsLearned: parsed.totalWordsLearned,
        todayWordsLearned: parsed.todayWordsLearned,
        lastStudyDate: parsed.lastStudyDate,
      })

      // 迁移自定义词汇
      if (parsed.customWords && parsed.customWords.length > 0) {
        dbService.addWords(parsed.customWords)
      }

      // 迁移学习进度
      Object.values(parsed.wordProgress).forEach((progress: WordProgress) => {
        dbService.updateWordProgress(progress.wordId, progress)
      })

      // 迁移听写本
      if (parsed.dictationBooks && parsed.dictationBooks.length > 0) {
        parsed.dictationBooks.forEach((book) => {
          const bookId = dbService.createDictationBook(book.name, book.color || '#e5e7eb')
          book.wordIds.forEach((wordId) => {
            dbService.addWordToDictationBook(bookId, wordId)
          })
        })
      }
    }

    localStorage.setItem(MIGRATION_FLAG, 'true')
  } catch (e) {
    console.warn('Migration failed:', e)
  }
}

// 获取今天的日期字符串
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

// 计算下次复习日期
export function calculateNextReviewDate(boxLevel: BoxLevel): string {
  const today = new Date()
  today.setDate(today.getDate() + REVIEW_INTERVALS[boxLevel])
  return today.toISOString().split('T')[0]
}

// 获取用户数据（兼容旧的localStorage）
export async function getUserData(): Promise<UserData> {
  await migrateOldData()
  return await dbService.getUserData()
}

// 保存用户数据
export async function saveUserData(data: UserData): Promise<void> {
  dbService.updateUserData(data)
}

// 获取今日待学习的词汇
export async function getTodayWords(data: UserData, limit = 10): Promise<Word[]> {
  const today = getTodayDate()
  const allWords = [...PRESET_WORDS, ...data.customWords]

  // 筛选需要复习的词汇
  const wordsToReview = allWords.filter((word) => {
    const progress = data.wordProgress[word.id]
    if (!progress) return true
    if (progress.boxLevel >= 4 && progress.nextReviewDate > today) return false
    return progress.nextReviewDate <= today
  })

  // 按盒子等级排序
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
export async function markWordAsKnown(data: UserData, wordId: string): Promise<UserData> {
  const progress = data.wordProgress[wordId] || {
    wordId,
    boxLevel: 0 as BoxLevel,
    lastReviewDate: '',
    nextReviewDate: getTodayDate(),
    reviewCount: 0,
  }

  const newLevel = Math.min(progress.boxLevel + 1, 4) as BoxLevel

  const updatedProgress = {
    ...progress,
    boxLevel: newLevel,
    lastReviewDate: getTodayDate(),
    nextReviewDate: calculateNextReviewDate(newLevel),
    reviewCount: progress.reviewCount + 1,
  }

  dbService.updateWordProgress(wordId, updatedProgress)

  return {
    ...data,
    energyBeans: data.energyBeans + 2,
    todayWordsLearned: data.todayWordsLearned + 1,
    totalWordsLearned:
      progress.reviewCount === 0 ? data.totalWordsLearned + 1 : data.totalWordsLearned,
    lastStudyDate: getTodayDate(),
    wordProgress: {
      ...data.wordProgress,
      [wordId]: updatedProgress,
    },
  }
}

// 更新词汇进度（不认识）
export async function markWordAsUnknown(data: UserData, wordId: string): Promise<UserData> {
  const progress = data.wordProgress[wordId] || {
    wordId,
    boxLevel: 0 as BoxLevel,
    lastReviewDate: '',
    nextReviewDate: getTodayDate(),
    reviewCount: 0,
  }

  const updatedProgress = {
    ...progress,
    boxLevel: 0 as BoxLevel,
    lastReviewDate: getTodayDate(),
    nextReviewDate: getTodayDate(),
    reviewCount: progress.reviewCount + 1,
  }

  dbService.updateWordProgress(wordId, updatedProgress)

  return {
    ...data,
    energyBeans: data.energyBeans + 1,
    lastStudyDate: getTodayDate(),
    wordProgress: {
      ...data.wordProgress,
      [wordId]: updatedProgress,
    },
  }
}

// 添加自定义词
export async function addCustomWord(data: UserData, wordData: Omit<Word, 'id' | 'isCustom'>): Promise<UserData> {
  const id = dbService.addCustomWord({
    ...wordData,
    id: `custom_${Date.now()}`,
    isCustom: true,
  })

  const today = getTodayDate()

  return {
    ...data,
    customWords: [
      ...data.customWords,
      { ...wordData, id, isCustom: true },
    ],
    wordProgress: {
      ...data.wordProgress,
      [id]: {
        wordId: id,
        boxLevel: 0,
        lastReviewDate: '',
        nextReviewDate: today,
        reviewCount: 0,
      },
    },
  }
}

// 删除自定义词
export async function removeCustomWord(data: UserData, wordId: string): Promise<UserData> {
  const newProgress = { ...data.wordProgress }
  delete newProgress[wordId]

  return {
    ...data,
    customWords: data.customWords.filter((w) => w.id !== wordId),
    wordProgress: newProgress,
  }
}

// 批量添加自定义词
export async function addCustomWords(
  data: UserData,
  words: Array<Omit<Word, 'id' | 'isCustom'>>,
): Promise<UserData> {
  const today = getTodayDate()
  const allExistingWords = new Set([
    ...PRESET_WORDS.map((w) => w.word),
    ...data.customWords.map((w) => w.word),
  ])

  let updatedData = { ...data }

  words.forEach((wordData, index) => {
    if (allExistingWords.has(wordData.word)) return

    const id = `custom_${Date.now()}_${index}`
    const newWord: Word = {
      ...wordData,
      id,
      isCustom: true,
    }

    dbService.addCustomWord(newWord)

    updatedData = {
      ...updatedData,
      customWords: [...updatedData.customWords, newWord],
      wordProgress: {
        ...updatedData.wordProgress,
        [id]: {
          wordId: id,
          boxLevel: 0,
          lastReviewDate: '',
          nextReviewDate: today,
          reviewCount: 0,
        },
      },
    }

    allExistingWords.add(wordData.word)
  })

  return updatedData
}

// 检查词是否存在
export function isWordExists(data: UserData, word: string): boolean {
  const allWords = new Set([
    ...PRESET_WORDS.map((w) => w.word),
    ...data.customWords.map((w) => w.word),
  ])
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

// 获取所有词语
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

// 创建听写本
export async function createDictationBook(
  data: UserData,
  name: string,
  wordIds: string[],
  color: string,
): Promise<UserData> {
  const bookId = dbService.createDictationBook(name, color)
  
  wordIds.forEach((wordId) => {
    dbService.addWordToDictationBook(bookId, wordId)
  })

  const now = new Date().toISOString()
  const newBook: DictationBook = {
    id: bookId,
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

// 更新听写本
export async function updateDictationBook(
  data: UserData,
  bookId: string,
  updates: Partial<Pick<DictationBook, 'name' | 'wordIds' | 'color'>>,
): Promise<UserData> {
  return {
    ...data,
    dictationBooks: data.dictationBooks.map((book) =>
      book.id === bookId ? { ...book, ...updates, updatedAt: new Date().toISOString() } : book,
    ),
  }
}

// 删除听写本
export async function deleteDictationBook(data: UserData, bookId: string): Promise<UserData> {
  dbService.deleteDictationBook(bookId)
  return {
    ...data,
    dictationBooks: data.dictationBooks.filter((book) => book.id !== bookId),
  }
}

// 向听写本添加词
export async function addWordsToDictationBook(
  data: UserData,
  bookId: string,
  wordIds: string[],
): Promise<UserData> {
  wordIds.forEach((wordId) => {
    dbService.addWordToDictationBook(bookId, wordId)
  })

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

// 从听写本移除词
export async function removeWordsFromDictationBook(
  data: UserData,
  bookId: string,
  wordIds: string[],
): Promise<UserData> {
  wordIds.forEach((wordId) => {
    dbService.removeWordFromDictationBook(bookId, wordId)
  })

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

// 导出用户数据
export function exportUserData(data: UserData): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      energyBeans: data.energyBeans,
      totalWordsLearned: data.totalWordsLearned,
      customWords: data.customWords,
      wordProgress: data.wordProgress,
      dictationBooks: data.dictationBooks,
    },
  }
  return JSON.stringify(exportData, null, 2)
}

// 导入用户数据
export function importUserData(
  currentData: UserData,
  jsonString: string,
  mode: 'merge' | 'replace',
): {
  success: boolean
  data?: UserData
  error?: string
  stats?: { wordsAdded: number; booksAdded: number }
} {
  try {
    const imported = JSON.parse(jsonString)

    if (!imported.version || !imported.data) {
      return { success: false, error: '无效的数据格式' }
    }

    const importedData = imported.data

    if (mode === 'replace') {
      const newData: UserData = {
        energyBeans: importedData.energyBeans || 0,
        totalWordsLearned: importedData.totalWordsLearned || 0,
        todayWordsLearned: 0,
        lastStudyDate: '',
        customWords: importedData.customWords || [],
        wordProgress: importedData.wordProgress || {},
        dictationBooks: importedData.dictationBooks || [],
      }
      return {
        success: true,
        data: newData,
        stats: {
          wordsAdded: newData.customWords.length,
          booksAdded: newData.dictationBooks.length,
        },
      }
    } else {
      const existingWordSet = new Set(currentData.customWords.map((w) => w.word))
      const existingBookSet = new Set(currentData.dictationBooks.map((b) => b.name))

      const newWords = (importedData.customWords || []).filter((w: Word) => !existingWordSet.has(w.word))
      const newBooks = (importedData.dictationBooks || []).filter((b: DictationBook) => !existingBookSet.has(b.name))

      const mergedProgress = { ...currentData.wordProgress }
      Object.entries(importedData.wordProgress || {}).forEach(([id, progress]) => {
        if (!mergedProgress[id]) {
          mergedProgress[id] = progress as WordProgress
        }
      })

      const newData: UserData = {
        ...currentData,
        energyBeans: currentData.energyBeans + (importedData.energyBeans || 0),
        customWords: [...currentData.customWords, ...newWords],
        wordProgress: mergedProgress,
        dictationBooks: [...currentData.dictationBooks, ...newBooks],
      }

      return {
        success: true,
        data: newData,
        stats: {
          wordsAdded: newWords.length,
          booksAdded: newBooks.length,
        },
      }
    }
  } catch (e) {
    return { success: false, error: 'JSON 解析失败，请检查文件格式' }
  }
}

// 下载文件
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
