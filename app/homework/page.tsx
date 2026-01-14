import { Suspense } from "react"
import { HomeworkContent } from "@/components/homework-content"

export default function HomeworkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <main className="min-h-screen bg-background p-4 md:p-6 lg:p-8 pb-24">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">作业管理</h1>
            <p className="text-muted-foreground mt-1">记录和完成每日作业</p>
          </header>
          <HomeworkContent />
        </div>
      </main>
    </Suspense>
  )
}
