import type { Homework, HomeworkData, HomeworkStatus, Subject, HomeworkAttachment } from "./types"

const HOMEWORK_STORAGE_KEY = "sprout_homework_data"

// 获取默认数据
function getDefaultHomeworkData(): HomeworkData {
  return {
    homeworks: [],
  }
}

// 获取作业数据
export function getHomeworkData(): HomeworkData {
  if (typeof window === "undefined") {
    return getDefaultHomeworkData()
  }

  const stored = localStorage.getItem(HOMEWORK_STORAGE_KEY)
  if (!stored) {
    return getDefaultHomeworkData()
  }

  return JSON.parse(stored) as HomeworkData
}

// 保存作业数据
export function saveHomeworkData(data: HomeworkData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(HOMEWORK_STORAGE_KEY, JSON.stringify(data))
}

// 创建新作业
export function createHomework(
  title: string,
  subject: Subject,
  description: string,
  attachments: Omit<HomeworkAttachment, "id">[],
): Homework {
  const now = new Date().toISOString()
  return {
    id: `homework_${Date.now()}`,
    title,
    subject,
    description,
    status: "pending",
    attachments: attachments.map((att, index) => ({
      ...att,
      id: `att_${Date.now()}_${index}`,
    })),
    createdAt: now,
    updatedAt: now,
  }
}

// 添加作业
export function addHomework(data: HomeworkData, homework: Homework): HomeworkData {
  return {
    ...data,
    homeworks: [homework, ...data.homeworks],
  }
}

// 更新作业
export function updateHomework(
  data: HomeworkData,
  homeworkId: string,
  updates: Partial<Pick<Homework, "title" | "subject" | "description" | "status" | "attachments">>,
): HomeworkData {
  return {
    ...data,
    homeworks: data.homeworks.map((hw) => {
      if (hw.id !== homeworkId) return hw
      const updated = {
        ...hw,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      // 如果状态变为已完成，记录完成时间
      if (updates.status === "completed" && hw.status !== "completed") {
        updated.completedAt = new Date().toISOString()
      }
      return updated
    }),
  }
}

// 删除作业
export function deleteHomework(data: HomeworkData, homeworkId: string): HomeworkData {
  return {
    ...data,
    homeworks: data.homeworks.filter((hw) => hw.id !== homeworkId),
  }
}

// 更新附件批注
export function updateAttachmentAnnotation(
  data: HomeworkData,
  homeworkId: string,
  attachmentId: string,
  annotations: string,
): HomeworkData {
  return {
    ...data,
    homeworks: data.homeworks.map((hw) => {
      if (hw.id !== homeworkId) return hw
      return {
        ...hw,
        updatedAt: new Date().toISOString(),
        attachments: hw.attachments.map((att) => {
          if (att.id !== attachmentId) return att
          return { ...att, annotations }
        }),
      }
    }),
  }
}

// 获取统计数据
export function getHomeworkStats(data: HomeworkData) {
  const stats = {
    total: data.homeworks.length,
    pending: 0,
    inProgress: 0,
    completed: 0,
    bySubject: {} as Record<Subject, number>,
  }

  data.homeworks.forEach((hw) => {
    if (hw.status === "pending") stats.pending++
    else if (hw.status === "in_progress") stats.inProgress++
    else if (hw.status === "completed") stats.completed++

    stats.bySubject[hw.subject] = (stats.bySubject[hw.subject] || 0) + 1
  })

  return stats
}

// 按状态筛选作业
export function filterHomeworksByStatus(data: HomeworkData, status: HomeworkStatus | "all"): Homework[] {
  if (status === "all") return data.homeworks
  return data.homeworks.filter((hw) => hw.status === status)
}

// 按科目筛选作业
export function filterHomeworksBySubject(data: HomeworkData, subject: Subject | "all"): Homework[] {
  if (subject === "all") return data.homeworks
  return data.homeworks.filter((hw) => hw.subject === subject)
}
