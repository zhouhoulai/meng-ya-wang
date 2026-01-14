export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 animate-pulse" />
        <p className="text-muted-foreground">加载中...</p>
      </div>
    </div>
  )
}
