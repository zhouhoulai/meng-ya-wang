// 生词数据类型
export interface Word {
  id: string
  word: string // 从 character 改为 word，支持词语（2字及以上）
  pinyin: string // 拼音
  example: string // 例句
  isCustom?: boolean // 是否为用户自定义
}

// 五级盒子等级
export type BoxLevel = 0 | 1 | 2 | 3 | 4

// 盒子名称映射
export const BOX_NAMES: Record<BoxLevel, string> = {
  0: "新词",
  1: "复习中",
  2: "较熟悉",
  3: "很熟悉",
  4: "已掌握",
}

// 复习间隔（天数）
export const REVIEW_INTERVALS: Record<BoxLevel, number> = {
  0: 0, // 新词：立即复习
  1: 1, // 复习中：1天后
  2: 3, // 较熟悉：3天后
  3: 7, // 很熟悉：7天后
  4: 14, // 已掌握：14天后
}

// 学习记录
export interface WordProgress {
  wordId: string
  boxLevel: BoxLevel
  lastReviewDate: string // ISO 日期字符串
  nextReviewDate: string
  reviewCount: number
}

// 用户学习数据
export interface UserData {
  energyBeans: number // 能量豆
  totalWordsLearned: number // 已学习总数
  todayWordsLearned: number // 今日学习数
  lastStudyDate: string // 最后学习日期
  wordProgress: Record<string, WordProgress> // 每个词的进度
  customWords: Word[] // 用户自定义词库
  dictationBooks: DictationBook[] // 添加听写生词本
}

// 今日学习会话
export interface StudySession {
  wordsToReview: Word[] // 待复习词汇
  currentIndex: number // 当前索引
  correctCount: number // 认识的数量
  wrongCount: number // 不认识的数量
  earnedBeans: number // 获得的能量豆
}

export interface DictationBook {
  id: string
  name: string // 生词本名称，如"第一单元"、"本周听写"
  wordIds: string[] // 包含的词语ID列表
  createdAt: string // 创建时间
  updatedAt: string // 更新时间
  color: string // 生词本颜色标识
}
