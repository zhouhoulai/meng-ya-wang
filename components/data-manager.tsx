"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Upload, Check, AlertCircle, FileJson, Smartphone, ArrowRight, RefreshCw, Merge } from "lucide-react"
import { getUserData, saveUserData, exportUserData, importUserData, downloadFile, getStudyStats } from "@/lib/storage"

interface DataManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDataChange?: () => void
}

type ImportMode = "merge" | "replace"

export function DataManager({ open, onOpenChange, onDataChange }: DataManagerProps) {
  const [step, setStep] = useState<"main" | "import" | "export-success" | "import-success">("main")
  const [importMode, setImportMode] = useState<ImportMode>("merge")
  const [importError, setImportError] = useState<string | null>(null)
  const [importStats, setImportStats] = useState<{ wordsAdded: number; booksAdded: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = getUserData()
    const stats = getStudyStats(data)
    const dateStr = new Date().toISOString().split("T")[0]
    const filename = `萌芽生词王_${dateStr}_${stats.total}词.json`
    const content = exportUserData(data)
    downloadFile(content, filename)
    setStep("export-success")
  }

  const handleImportClick = () => {
    setStep("import")
    setImportError(null)
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const currentData = getUserData()
      const result = importUserData(currentData, content, importMode)

      if (result.success && result.data) {
        saveUserData(result.data)
        setImportStats(result.stats || null)
        setStep("import-success")
        onDataChange?.()
      } else {
        setImportError(result.error || "导入失败")
      }
    }
    reader.readAsText(file)

    // 清空 input，允许重复选择同一文件
    e.target.value = ""
  }

  const handleClose = () => {
    setStep("main")
    setImportError(null)
    setImportStats(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4 rounded-3xl max-h-[85vh] overflow-y-auto w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {step === "main" && "数据管理中心"}
            {step === "import" && "导入数据"}
            {step === "export-success" && "导出成功"}
            {step === "import-success" && "导入成功"}
          </DialogTitle>
        </DialogHeader>

        {step === "main" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center mb-6">
              通过导出/导入 JSON 文件，在不同设备间同步数据
            </p>

            {/* 导出数据 */}
            <Card
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary/50"
              onClick={handleExport}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">导出数据</h3>
                  <p className="text-sm text-muted-foreground">保存为 JSON 文件，可通过微信/网盘传输</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>

            {/* 导入数据 */}
            <Card
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors border-2 hover:border-primary/50"
              onClick={handleImportClick}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">导入数据</h3>
                  <p className="text-sm text-muted-foreground">从 JSON 文件恢复数据</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>

            {/* 同步流程说明 */}
            <div className="mt-6 p-4 bg-muted/50 rounded-2xl">
              <h4 className="font-medium text-sm mb-3 text-foreground">如何同步到其他设备？</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                <span>设备A导出</span>
                <ArrowRight className="w-4 h-4" />
                <FileJson className="w-4 h-4" />
                <span>传输文件</span>
                <ArrowRight className="w-4 h-4" />
                <Smartphone className="w-4 h-4" />
                <span>设备B导入</span>
              </div>
            </div>
          </div>
        )}

        {step === "import" && (
          <div className="space-y-4 py-4">
            {/* 导入模式选择 */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">选择导入模式</p>

              <Card
                className={`p-4 cursor-pointer transition-colors border-2 ${
                  importMode === "merge" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => setImportMode("merge")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      importMode === "merge" ? "bg-primary text-white" : "bg-muted"
                    }`}
                  >
                    <Merge className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">合并模式（推荐）</h4>
                    <p className="text-xs text-muted-foreground">保留现有数据，添加新内容</p>
                  </div>
                  {importMode === "merge" && <Check className="w-5 h-5 text-primary" />}
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-colors border-2 ${
                  importMode === "replace" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                }`}
                onClick={() => setImportMode("replace")}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      importMode === "replace" ? "bg-primary text-white" : "bg-muted"
                    }`}
                  >
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">替换模式</h4>
                    <p className="text-xs text-muted-foreground">清空现有数据，完全覆盖</p>
                  </div>
                  {importMode === "replace" && <Check className="w-5 h-5 text-primary" />}
                </div>
              </Card>
            </div>

            {importError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{importError}</span>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

            <Button className="w-full h-12 rounded-2xl" onClick={handleFileSelect}>
              <Upload className="w-5 h-5 mr-2" />
              选择 JSON 文件
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => setStep("main")}>
              返回
            </Button>
          </div>
        )}

        {step === "export-success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">导出成功</h3>
              <p className="text-sm text-muted-foreground mt-1">文件已保存，可通过微信、网盘等方式传输到其他设备</p>
            </div>
            <Button className="w-full h-12 rounded-2xl" onClick={handleClose}>
              完成
            </Button>
          </div>
        )}

        {step === "import-success" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">导入成功</h3>
              {importStats && (
                <p className="text-sm text-muted-foreground mt-1">
                  已添加 {importStats.wordsAdded} 个词语，{importStats.booksAdded} 个听写本
                </p>
              )}
            </div>
            <Button className="w-full h-12 rounded-2xl" onClick={handleClose}>
              完成
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
