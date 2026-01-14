import { Suspense } from "react"
import { DictationContent } from "@/components/dictation-content"

export default function DictationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">加载中...</div>
        </div>
      }
    >
      <DictationContent />
    </Suspense>
  )
}
