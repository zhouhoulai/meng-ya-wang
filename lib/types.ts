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

// 科目类型
export type Subject = "语文" | "数学" | "英语" | "其他"

export const SUBJECT_COLORS: Record<Subject, string> = {
  语文: "bg-red-100 text-red-700 border-red-200",
  数学: "bg-blue-100 text-blue-700 border-blue-200",
  英语: "bg-purple-100 text-purple-700 border-purple-200",
  其他: "bg-gray-100 text-gray-700 border-gray-200",
}

export const SUBJECT_BG_COLORS: Record<Subject, string> = {
  语文: "from-red-50 to-orange-50",
  数学: "from-blue-50 to-cyan-50",
  英语: "from-purple-50 to-pink-50",
  其他: "from-gray-50 to-slate-50",
}

// 作业状态
export type HomeworkStatus = "pending" | "in_progress" | "completed"

export const STATUS_LABELS: Record<HomeworkStatus, string> = {
  pending: "待完成",
  in_progress: "进行中",
  completed: "已完成",
}

// 作业附件（试卷图片/PDF）
export interface HomeworkAttachment {
  id: string
  type: "image" | "pdf"
  name: string
  dataUrl: string // Base64 编码的文件数据
  annotations?: string // Canvas 批注数据（Base64 图片）
}

// 作业数据
export interface Homework {
  id: string
  title: string
  subject: Subject
  description: string
  status: HomeworkStatus
  attachments: HomeworkAttachment[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// 作业管理数据
export interface HomeworkData {
  homeworks: Homework[]
}
