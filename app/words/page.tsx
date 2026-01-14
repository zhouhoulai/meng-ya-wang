import { Suspense } from "react"
import { WordsContent } from "@/components/words-content"

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">加载中...</div>
    </div>
  )
}

export default function WordsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WordsContent />
    </Suspense>
  )
}
