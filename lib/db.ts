'use client'

import initSqlJs, { Database } from 'sql.js'

let SQL: any = null
let db: Database | null = null
let initialized = false
const DB_KEY = 'vocab_db_v1'

// 初始化SQL.js
async function initializeSQL() {
  if (SQL) return SQL
  SQL = await initSqlJs()
  return SQL
}

// 从localStorage加载数据库
function loadFromStorage(): ArrayBuffer | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(DB_KEY)
    if (stored) {
      const binaryString = atob(stored)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes.buffer
    }
  } catch (e) {
    console.warn('Failed to load database from storage:', e)
  }
  return null
}

// 保存数据库到localStorage
function saveToStorage() {
  if (!db || typeof window === 'undefined') return
  try {
    const data = db.export()
    const binary = String.fromCharCode.apply(null, Array.from(data))
    const encoded = btoa(binary)
    localStorage.setItem(DB_KEY, encoded)
  } catch (e) {
    console.warn('Failed to save database to storage:', e)
  }
}

// 初始化数据库并创建表
async function initializeDatabase() {
  if (initialized && db) return db

  const SQL = await initializeSQL()
  
  // 尝试从storage恢复数据
  const buffer = loadFromStorage()

  // 创建或恢复数据库
  if (buffer && buffer.byteLength > 0) {
    db = new SQL.Database(new Uint8Array(buffer))
  } else {
    db = new SQL.Database()
    createTables()
  }

  initialized = true
  return db
}

// 创建所有必要的表
function createTables() {
  if (!db) return

  const tables = [
    // 词库表
    `CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY,
      word TEXT NOT NULL,
      pinyin TEXT NOT NULL,
      example TEXT,
      isCustom BOOLEAN DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 学习进度表
    `CREATE TABLE IF NOT EXISTS word_progress (
      wordId TEXT PRIMARY KEY,
      boxLevel INTEGER DEFAULT 0,
      lastReviewDate TEXT,
      nextReviewDate TEXT,
      reviewCount INTEGER DEFAULT 0,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(wordId) REFERENCES words(id)
    )`,
    
    // 学习会话表
    `CREATE TABLE IF NOT EXISTS study_sessions (
      id TEXT PRIMARY KEY,
      studyDate TEXT NOT NULL,
      correctCount INTEGER DEFAULT 0,
      wrongCount INTEGER DEFAULT 0,
      earnedBeans INTEGER DEFAULT 0,
      duration INTEGER,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 用户数据表
    `CREATE TABLE IF NOT EXISTS user_data (
      id TEXT PRIMARY KEY,
      energyBeans INTEGER DEFAULT 0,
      totalWordsLearned INTEGER DEFAULT 0,
      todayWordsLearned INTEGER DEFAULT 0,
      lastStudyDate TEXT,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 听写生词本表
    `CREATE TABLE IF NOT EXISTS dictation_books (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 生词本与词语的关联表
    `CREATE TABLE IF NOT EXISTS dictation_book_words (
      bookId TEXT NOT NULL,
      wordId TEXT NOT NULL,
      PRIMARY KEY(bookId, wordId),
      FOREIGN KEY(bookId) REFERENCES dictation_books(id),
      FOREIGN KEY(wordId) REFERENCES words(id)
    )`,
  ]

  tables.forEach(sql => {
    try {
      db!.run(sql)
    } catch (e) {
      console.warn('Table creation warning:', e)
    }
  })

  saveToStorage()
}

// 执行查询（返回结果）
function query(sql: string, params?: any[]) {
  if (!db) throw new Error('Database not initialized')
  
  try {
    const stmt = db.prepare(sql)
    if (params) stmt.bind(params)
    
    const result = []
    while (stmt.step()) {
      result.push(stmt.getAsObject())
    }
    stmt.free()
    return result
  } catch (e) {
    console.error('Query error:', sql, e)
    throw e
  }
}

// 执行更新操作（INSERT, UPDATE, DELETE）
function execute(sql: string, params?: any[]) {
  if (!db) throw new Error('Database not initialized')
  
  try {
    const stmt = db.prepare(sql)
    if (params) stmt.bind(params)
    stmt.step()
    stmt.free()
    saveToStorage()
  } catch (e) {
    console.error('Execute error:', sql, e)
    throw e
  }
}

// 启用外键约束
function enableForeignKeys() {
  if (!db) return
  db.run('PRAGMA foreign_keys = ON')
}

// 导出数据库
function exportDatabase(): string {
  if (!db) throw new Error('Database not initialized')
  const data = db.export()
  const binary = String.fromCharCode.apply(null, Array.from(data) as any)
  return btoa(binary)
}

// 导入数据库
async function importDatabase(base64Data: string) {
  const SQL = await initializeSQL()
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  
  db = new SQL.Database(bytes)
  initialized = true
  saveToStorage()
}

export {
  initializeDatabase,
  query,
  execute,
  enableForeignKeys,
  saveToStorage,
  initializeSQL,
  exportDatabase,
  importDatabase,
}
