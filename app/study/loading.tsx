import { SproutMascot } from "@/components/sprout-mascot"

export default function StudyLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <SproutMascot size="lg" mood="thinking" />
      <p className="text-muted-foreground animate-pulse">准备学习中...</p>
    </div>
  )
}
