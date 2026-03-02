'use client'

import { initializeDatabase, query, execute } from './db'
import { Word, WordProgress, UserData, DictationBook, BoxLevel } from './types'
import { PRESET_WORDS } from './word-data'
import { v4 as uuidv4 } from 'uuid'

// 初始化用户数据
export async function initializeUserData() {
  await initializeDatabase()
  
  const existing = query('SELECT * FROM user_data WHERE id = ?', ['default'])
  if (existing.length === 0) {
    execute(
      `INSERT INTO user_data (id, energyBeans, totalWordsLearned, todayWordsLearned) 
       VALUES (?, ?, ?, ?)`,
      ['default', 0, 0, 0]
    )
  }
}

// 获取用户数据
export async function getUserData(): Promise<UserData> {
  await initializeDatabase()
  
  const result = query('SELECT * FROM user_data WHERE id = ?', ['default'])
  if (result.length === 0) {
    await initializeUserData()
    return getDefaultUserData()
  }

  const data = result[0]
  const wordProgress = getWordProgressMap()
  const customWords = getCustomWords()
  const dictationBooks = getDictationBooks()

  return {
    energyBeans: data.energyBeans || 0,
    totalWordsLearned: data.totalWordsLearned || 0,
    todayWordsLearned: data.todayWordsLearned || 0,
    lastStudyDate: data.lastStudyDate || new Date().toISOString().split('T')[0],
    wordProgress,
    customWords,
    dictationBooks,
  }
}

// 获取默认用户数据
function getDefaultUserData(): UserData {
  return {
    energyBeans: 0,
    totalWordsLearned: 0,
    todayWordsLearned: 0,
    lastStudyDate: new Date().toISOString().split('T')[0],
    wordProgress: {},
    customWords: [],
    dictationBooks: [],
  }
}

// 获取单个词的学习进度
export function getWordProgress(wordId: string): WordProgress | null {
  const result = query('SELECT * FROM word_progress WHERE wordId = ?', [wordId])
  if (result.length === 0) return null

  const data = result[0]
  return {
    wordId: data.wordId,
    boxLevel: (data.boxLevel || 0) as BoxLevel,
    lastReviewDate: data.lastReviewDate || '',
    nextReviewDate: data.nextReviewDate || '',
    reviewCount: data.reviewCount || 0,
  }
}

// 获取所有词的学习进度映射
function getWordProgressMap(): Record<string, WordProgress> {
  const results = query('SELECT * FROM word_progress')
  const map: Record<string, WordProgress> = {}

  results.forEach((row: any) => {
    map[row.wordId] = {
      wordId: row.wordId,
      boxLevel: (row.boxLevel || 0) as BoxLevel,
      lastReviewDate: row.lastReviewDate || '',
      nextReviewDate: row.nextReviewDate || '',
      reviewCount: row.reviewCount || 0,
    }
  })

  return map
}

// 更新词的学习进度
export function updateWordProgress(
  wordId: string,
  progress: Partial<WordProgress>
) {
  const existing = getWordProgress(wordId)
  
  if (!existing) {
    execute(
      `INSERT INTO word_progress (wordId, boxLevel, lastReviewDate, nextReviewDate, reviewCount, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        wordId,
        progress.boxLevel || 0,
        progress.lastReviewDate || new Date().toISOString().split('T')[0],
        progress.nextReviewDate || '',
        progress.reviewCount || 0,
        new Date().toISOString(),
      ]
    )
  } else {
    const fields = []
    const values: any[] = []

    if (progress.boxLevel !== undefined) {
      fields.push('boxLevel = ?')
      values.push(progress.boxLevel)
    }
    if (progress.lastReviewDate !== undefined) {
      fields.push('lastReviewDate = ?')
      values.push(progress.lastReviewDate)
    }
    if (progress.nextReviewDate !== undefined) {
      fields.push('nextReviewDate = ?')
      values.push(progress.nextReviewDate)
    }
    if (progress.reviewCount !== undefined) {
      fields.push('reviewCount = ?')
      values.push(progress.reviewCount)
    }

    fields.push('updatedAt = ?')
    values.push(new Date().toISOString())
    values.push(wordId)

    execute(
      `UPDATE word_progress SET ${fields.join(', ')} WHERE wordId = ?`,
      values
    )
  }
}

// 添加自定义词
export function addCustomWord(word: Word) {
  const id = word.id || uuidv4()
  execute(
    `INSERT INTO words (id, word, pinyin, example, isCustom, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, word.word, word.pinyin, word.example, 1, new Date().toISOString()]
  )
  return id
}

// 获取自定义词列表
function getCustomWords(): Word[] {
  const results = query('SELECT * FROM words WHERE isCustom = 1')
  return results.map((row: any) => ({
    id: row.id,
    word: row.word,
    pinyin: row.pinyin,
    example: row.example,
    isCustom: true,
  }))
}

// 获取词库中的单个词
export function getWord(wordId: string): Word | null {
  const result = query('SELECT * FROM words WHERE id = ?', [wordId])
  if (result.length === 0) return null

  const row = result[0]
  return {
    id: row.id,
    word: row.word,
    pinyin: row.pinyin,
    example: row.example,
    isCustom: Boolean(row.isCustom),
  }
}

// 批量添加词汇
export function addWords(words: Word[]) {
  words.forEach(word => {
    const id = word.id || uuidv4()
    execute(
      `INSERT OR IGNORE INTO words (id, word, pinyin, example, isCustom, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, word.word, word.pinyin, word.example, word.isCustom ? 1 : 0, new Date().toISOString()]
    )
  })
}

// 更新用户数据
export function updateUserData(updates: Partial<UserData>) {
  const fields = []
  const values: any[] = []

  if (updates.energyBeans !== undefined) {
    fields.push('energyBeans = ?')
    values.push(updates.energyBeans)
  }
  if (updates.totalWordsLearned !== undefined) {
    fields.push('totalWordsLearned = ?')
    values.push(updates.totalWordsLearned)
  }
  if (updates.todayWordsLearned !== undefined) {
    fields.push('todayWordsLearned = ?')
    values.push(updates.todayWordsLearned)
  }
  if (updates.lastStudyDate !== undefined) {
    fields.push('lastStudyDate = ?')
    values.push(updates.lastStudyDate)
  }

  fields.push('updatedAt = ?')
  values.push(new Date().toISOString())
  values.push('default')

  if (fields.length > 1) {
    execute(
      `UPDATE user_data SET ${fields.join(', ')} WHERE id = ?`,
      values
    )
  }
}

// 创建听写生词本
export function createDictationBook(name: string, color: string): string {
  const id = uuidv4()
  execute(
    `INSERT INTO dictation_books (id, name, color, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?)`,
    [id, name, color, new Date().toISOString(), new Date().toISOString()]
  )
  return id
}

// 获取所有听写生词本
function getDictationBooks(): DictationBook[] {
  const results = query('SELECT * FROM dictation_books ORDER BY createdAt DESC')
  return results.map((row: any) => {
    const wordIds = query(
      'SELECT wordId FROM dictation_book_words WHERE bookId = ?',
      [row.id]
    ).map((w: any) => w.wordId)

    return {
      id: row.id,
      name: row.name,
      wordIds,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      color: row.color,
    }
  })
}

// 添加词到生词本
export function addWordToDictationBook(bookId: string, wordId: string) {
  execute(
    `INSERT OR IGNORE INTO dictation_book_words (bookId, wordId)
     VALUES (?, ?)`,
    [bookId, wordId]
  )
}

// 从生词本删除词
export function removeWordFromDictationBook(bookId: string, wordId: string) {
  execute(
    `DELETE FROM dictation_book_words WHERE bookId = ? AND wordId = ?`,
    [bookId, wordId]
  )
}

// 删除生词本
export function deleteDictationBook(bookId: string) {
  execute('DELETE FROM dictation_book_words WHERE bookId = ?', [bookId])
  execute('DELETE FROM dictation_books WHERE id = ?', [bookId])
}
