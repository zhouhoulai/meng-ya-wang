"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileImage, FileText, Trash2, Edit3, Check, Clock, ChevronRight, X, Upload } from "lucide-react"
import {
  getHomeworkData,
  saveHomeworkData,
  createHomework,
  addHomework,
  updateHomework,
  deleteHomework,
  updateAttachmentAnnotation,
  getHomeworkStats,
} from "@/lib/homework-storage"
import type { HomeworkData, Homework, HomeworkStatus, Subject, HomeworkAttachment } from "@/lib/types"
import { SUBJECT_COLORS, SUBJECT_BG_COLORS, STATUS_LABELS } from "@/lib/types"
import { HomeworkCanvas } from "./homework-canvas"

export function HomeworkContent() {
  const [data, setData] = useState<HomeworkData | null>(null)
  const [filterStatus, setFilterStatus] = useState<HomeworkStatus | "all">("all")
  const [filterSubject, setFilterSubject] = useState<Subject | "all">("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null)
  const [viewingHomework, setViewingHomework] = useState<Homework | null>(null)
  const [viewingAttachment, setViewingAttachment] = useState<HomeworkAttachment | null>(null)
  const [showCanvas, setShowCanvas] = useState(false)

  // 新建作业表单
  const [newTitle, setNewTitle] = useState("")
  const [newSubject, setNewSubject] = useState<Subject>("语文")
  const [newDescription, setNewDescription] = useState("")
  const [newAttachments, setNewAttachments] = useState<Omit<HomeworkAttachment, "id">[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setData(getHomeworkData())
  }, [])

  const refreshData = () => {
    setData(getHomeworkData())
  }

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: Omit<HomeworkAttachment, "id">[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const isImage = file.type.startsWith("image/")
      const isPdf = file.type === "application/pdf"

      if (!isImage && !isPdf) continue

      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })

      newFiles.push({
        type: isImage ? "image" : "pdf",
        name: file.name,
        dataUrl,
      })
    }

    setNewAttachments((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 删除待上传的附件
  const removeNewAttachment = (index: number) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // 创建新作业
  const handleCreateHomework = () => {
    if (!data || !newTitle.trim()) return

    const homework = createHomework(newTitle, newSubject, newDescription, newAttachments)
    const newData = addHomework(data, homework)
    saveHomeworkData(newData)
    setData(newData)

    // 重置表单
    setNewTitle("")
    setNewSubject("语文")
    setNewDescription("")
    setNewAttachments([])
    setShowAddDialog(false)
  }

  // 更新作业状态
  const handleStatusChange = (homeworkId: string, status: HomeworkStatus) => {
    if (!data) return
    const newData = updateHomework(data, homeworkId, { status })
    saveHomeworkData(newData)
    setData(newData)
  }

  // 删除作业
  const handleDelete = (homeworkId: string) => {
    if (!data) return
    if (!confirm("确定要删除这份作业吗？")) return
    const newData = deleteHomework(data, homeworkId)
    saveHomeworkData(newData)
    setData(newData)
    setViewingHomework(null)
  }

  // 保存批注
  const handleSaveAnnotation = (dataUrl: string) => {
    if (!data || !viewingHomework || !viewingAttachment) return
    const newData = updateAttachmentAnnotation(data, viewingHomework.id, viewingAttachment.id, dataUrl)
    saveHomeworkData(newData)
    setData(newData)

    // 同时更新当前查看的作业数据
    const updatedHomework = newData.homeworks.find((hw) => hw.id === viewingHomework.id)
    if (updatedHomework) {
      setViewingHomework(updatedHomework)
      const updatedAttachment = updatedHomework.attachments.find((att) => att.id === viewingAttachment.id)
      if (updatedAttachment) {
        setViewingAttachment(updatedAttachment)
      }
    }

    setShowCanvas(false)
  }

  // 筛选作业
  const getFilteredHomeworks = () => {
    if (!data) return []
    let filtered = data.homeworks

    if (filterStatus !== "all") {
      filtered = filtered.filter((hw) => hw.status === filterStatus)
    }
    if (filterSubject !== "all") {
      filtered = filtered.filter((hw) => hw.subject === filterSubject)
    }

    return filtered
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const stats = getHomeworkStats(data)
  const filteredHomeworks = getFilteredHomeworks()

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="p-3 md:p-4 text-center bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="text-2xl md:text-3xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs md:text-sm text-amber-700">待完成</div>
        </Card>
        <Card className="p-3 md:p-4 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="text-2xl md:text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs md:text-sm text-blue-700">进行中</div>
        </Card>
        <Card className="p-3 md:p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="text-2xl md:text-3xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs md:text-sm text-green-700">已完成</div>
        </Card>
      </div>

      {/* 筛选和添加 */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as HomeworkStatus | "all")}>
          <SelectTrigger className="w-28 md:w-32 h-9 md:h-10">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">待完成</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSubject} onValueChange={(v) => setFilterSubject(v as Subject | "all")}>
          <SelectTrigger className="w-24 md:w-28 h-9 md:h-10">
            <SelectValue placeholder="科目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部科目</SelectItem>
            <SelectItem value="语文">语文</SelectItem>
            <SelectItem value="数学">数学</SelectItem>
            <SelectItem value="英语">英语</SelectItem>
            <SelectItem value="其他">其他</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setShowAddDialog(true)} className="ml-auto h-9 md:h-10 px-3 md:px-4 rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          添加作业
        </Button>
      </div>

      {/* 作业列表 */}
      <div className="space-y-3 md:space-y-4">
        {filteredHomeworks.length === 0 ? (
          <Card className="p-8 md:p-12 text-center">
            <div className="text-4xl md:text-5xl mb-3">📚</div>
            <p className="text-muted-foreground">暂无作业</p>
          </Card>
        ) : (
          filteredHomeworks.map((homework) => (
            <Card
              key={homework.id}
              className={`p-4 md:p-5 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br ${SUBJECT_BG_COLORS[homework.subject]}`}
              onClick={() => setViewingHomework(homework)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${SUBJECT_COLORS[homework.subject]}`}
                    >
                      {homework.subject}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        homework.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : homework.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {STATUS_LABELS[homework.status]}
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-foreground truncate">{homework.title}</h3>
                  {homework.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{homework.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(homework.createdAt).toLocaleDateString()}
                    </span>
                    {homework.attachments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FileImage className="w-3 h-3" />
                        {homework.attachments.length} 个附件
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 添加作业对话框 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加新作业</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">作业标题</label>
              <Input
                placeholder="如：语文第三单元练习"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">科目</label>
              <Select value={newSubject} onValueChange={(v) => setNewSubject(v as Subject)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="语文">语文</SelectItem>
                  <SelectItem value="数学">数学</SelectItem>
                  <SelectItem value="英语">英语</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">作业描述</label>
              <Textarea
                placeholder="老师布置的作业要求..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">上传试卷</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="w-full h-20 border-dashed flex flex-col gap-1 bg-transparent"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">点击上传图片或PDF</span>
              </Button>

              {/* 已选附件预览 */}
              {newAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {newAttachments.map((att, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      {att.type === "image" ? (
                        <FileImage className="w-5 h-5 text-blue-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-500" />
                      )}
                      <span className="flex-1 text-sm truncate">{att.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => removeNewAttachment(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddDialog(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleCreateHomework} disabled={!newTitle.trim()}>
                创建
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 作业详情对话框 */}
      <Dialog open={!!viewingHomework && !showCanvas} onOpenChange={(open) => !open && setViewingHomework(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingHomework && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${SUBJECT_COLORS[viewingHomework.subject]}`}
                  >
                    {viewingHomework.subject}
                  </span>
                  <DialogTitle className="flex-1">{viewingHomework.title}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* 状态切换 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">状态：</span>
                  <div className="flex gap-2">
                    {(["pending", "in_progress", "completed"] as HomeworkStatus[]).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={viewingHomework.status === status ? "default" : "outline"}
                        className="h-8"
                        onClick={() => handleStatusChange(viewingHomework.id, status)}
                      >
                        {status === "completed" && <Check className="w-3 h-3 mr-1" />}
                        {STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 描述 */}
                {viewingHomework.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">作业要求</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingHomework.description}</p>
                  </div>
                )}

                {/* 附件列表 */}
                {viewingHomework.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">试卷附件</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {viewingHomework.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="relative group cursor-pointer rounded-lg overflow-hidden border bg-muted aspect-[3/4]"
                          onClick={() => {
                            setViewingAttachment(att)
                            if (att.type === "image") {
                              setShowCanvas(true)
                            }
                          }}
                        >
                          {att.type === "image" ? (
                            <>
                              <img
                                src={att.annotations || att.dataUrl}
                                alt={att.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-white text-center">
                                  <Edit3 className="w-6 h-6 mx-auto mb-1" />
                                  <span className="text-xs">点击做题</span>
                                </div>
                              </div>
                              {att.annotations && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                                  已作答
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3">
                              <FileText className="w-10 h-10 text-red-500 mb-2" />
                              <span className="text-xs text-center text-muted-foreground line-clamp-2">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-2 border-t">
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={() => handleDelete(viewingHomework.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                  <Button variant="outline" className="ml-auto bg-transparent" onClick={() => setViewingHomework(null)}>
                    关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 批注画布 */}
      {showCanvas && viewingAttachment && viewingAttachment.type === "image" && (
        <HomeworkCanvas
          backgroundImage={viewingAttachment.dataUrl}
          annotations={viewingAttachment.annotations}
          onSave={handleSaveAnnotation}
          onClose={() => setShowCanvas(false)}
        />
      )}
    </div>
  )
}
