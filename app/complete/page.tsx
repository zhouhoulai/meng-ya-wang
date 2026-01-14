import { Suspense } from "react"
import { SproutMascot } from "@/components/sprout-mascot"
import { CompleteContent } from "@/components/complete-content"

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SproutMascot size="lg" mood="thinking" />
    </div>
  )
}

export default function CompletePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CompleteContent />
    </Suspense>
  )
}
