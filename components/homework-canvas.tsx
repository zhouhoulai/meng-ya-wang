"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Pencil, Undo, Trash2, Save, ZoomIn, ZoomOut, Move } from "lucide-react"

interface HomeworkCanvasProps {
  backgroundImage: string
  annotations?: string
  onSave: (dataUrl: string) => void
  onClose: () => void
}

type Tool = "pen" | "eraser" | "pan"

interface DrawPoint {
  x: number
  y: number
}

interface DrawPath {
  points: DrawPoint[]
  color: string
  width: number
  tool: "pen" | "eraser"
}

export function HomeworkCanvas({ backgroundImage, annotations, onSave, onClose }: HomeworkCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>("pen")
  const [penColor, setPenColor] = useState("#ff0000")
  const [penWidth, setPenWidth] = useState(3)
  const [paths, setPaths] = useState<DrawPath[]>([])
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // 加载背景图片
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height })

      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight - 80 // 留出工具栏空间

        // 计算适合容器的缩放比例
        const scaleX = containerWidth / img.width
        const scaleY = containerHeight / img.height
        const fitScale = Math.min(scaleX, scaleY, 1)

        const canvasW = img.width
        const canvasH = img.height

        setCanvasSize({ width: canvasW, height: canvasH })
        setScale(fitScale)

        // 居中显示
        setOffset({
          x: (containerWidth - canvasW * fitScale) / 2,
          y: (containerHeight - canvasH * fitScale) / 2,
        })
      }

      // 绘制背景
      if (bgCanvasRef.current) {
        const ctx = bgCanvasRef.current.getContext("2d")
        if (ctx) {
          bgCanvasRef.current.width = img.width
          bgCanvasRef.current.height = img.height
          ctx.drawImage(img, 0, 0)
        }
      }

      // 设置绘图画布尺寸
      if (canvasRef.current) {
        canvasRef.current.width = img.width
        canvasRef.current.height = img.height
      }

      // 加载已有批注
      if (annotations) {
        const annotationImg = new Image()
        annotationImg.onload = () => {
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d")
            if (ctx) {
              ctx.drawImage(annotationImg, 0, 0)
            }
          }
        }
        annotationImg.src = annotations
      }
    }
    img.src = backgroundImage
  }, [backgroundImage, annotations])

  // 重绘批注画布
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    paths.forEach((path) => {
      if (path.points.length < 2) return

      ctx.beginPath()
      ctx.moveTo(path.points[0].x, path.points[0].y)

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y)
      }

      if (path.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "rgba(0,0,0,1)"
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = path.color
      }
      ctx.lineWidth = path.width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
    })

    ctx.globalCompositeOperation = "source-over"
  }, [paths])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  // 获取画布坐标
  const getCanvasPoint = (clientX: number, clientY: number): DrawPoint => {
    if (!containerRef.current) return { x: 0, y: 0 }
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale,
    }
  }

  // 开始绘制
  const startDrawing = (clientX: number, clientY: number) => {
    if (tool === "pan") {
      setIsPanning(true)
      setLastPanPoint({ x: clientX, y: clientY })
      return
    }

    const point = getCanvasPoint(clientX, clientY)
    setIsDrawing(true)
    setCurrentPath({
      points: [point],
      color: penColor,
      width: tool === "eraser" ? 20 : penWidth,
      tool: tool === "eraser" ? "eraser" : "pen",
    })
  }

  // 绘制中
  const draw = (clientX: number, clientY: number) => {
    if (isPanning) {
      setOffset((prev) => ({
        x: prev.x + (clientX - lastPanPoint.x),
        y: prev.y + (clientY - lastPanPoint.y),
      }))
      setLastPanPoint({ x: clientX, y: clientY })
      return
    }

    if (!isDrawing || !currentPath || !canvasRef.current) return

    const point = getCanvasPoint(clientX, clientY)
    const newPath = {
      ...currentPath,
      points: [...currentPath.points, point],
    }
    setCurrentPath(newPath)

    // 实时绘制当前笔画
    const ctx = canvasRef.current.getContext("2d")
    if (ctx && newPath.points.length >= 2) {
      const lastPoint = newPath.points[newPath.points.length - 2]
      ctx.beginPath()
      ctx.moveTo(lastPoint.x, lastPoint.y)
      ctx.lineTo(point.x, point.y)

      if (newPath.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out"
        ctx.strokeStyle = "rgba(0,0,0,1)"
      } else {
        ctx.globalCompositeOperation = "source-over"
        ctx.strokeStyle = newPath.color
      }
      ctx.lineWidth = newPath.width
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
      ctx.globalCompositeOperation = "source-over"
    }
  }

  // 结束绘制
  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (isDrawing && currentPath && currentPath.points.length > 1) {
      setPaths((prev) => [...prev, currentPath])
    }
    setIsDrawing(false)
    setCurrentPath(null)
  }

  // 撤销
  const undo = () => {
    setPaths((prev) => prev.slice(0, -1))
  }

  // 清空批注
  const clearAll = () => {
    setPaths([])
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  // 保存
  const handleSave = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL("image/png")
    onSave(dataUrl)
  }

  // 缩放
  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 3))
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.3))

  const colors = ["#ff0000", "#0066ff", "#00aa00", "#ff9900", "#9900ff", "#000000"]

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* 工具栏 */}
      <div className="flex-shrink-0 bg-white border-b p-2 md:p-3 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 md:gap-2">
          {/* 画笔 */}
          <Button
            variant={tool === "pen" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pen")}
            className="h-9 w-9 md:h-10 md:w-10 p-0"
          >
            <Pencil className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          {/* 橡皮擦 */}
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eraser")}
            className="h-9 w-9 md:h-10 md:w-10 p-0"
          >
            <Eraser className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          {/* 移动 */}
          <Button
            variant={tool === "pan" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pan")}
            className="h-9 w-9 md:h-10 md:w-10 p-0"
          >
            <Move className="w-4 h-4 md:w-5 md:h-5" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* 颜色选择 */}
          {tool === "pen" && (
            <div className="flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 md:w-7 md:h-7 rounded-full border-2 transition-transform ${
                    penColor === color ? "border-gray-800 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setPenColor(color)}
                />
              ))}
            </div>
          )}

          {/* 笔画粗细 */}
          {tool === "pen" && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex items-center gap-1">
                {[2, 4, 6].map((w) => (
                  <button
                    key={w}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded border flex items-center justify-center ${
                      penWidth === w ? "border-primary bg-primary/10" : "border-gray-300"
                    }`}
                    onClick={() => setPenWidth(w)}
                  >
                    <div className="rounded-full bg-current" style={{ width: w + 2, height: w + 2 }} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* 缩放 */}
          <Button variant="outline" size="sm" onClick={zoomOut} className="h-9 w-9 md:h-10 md:w-10 p-0 bg-transparent">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs md:text-sm text-muted-foreground w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} className="h-9 w-9 md:h-10 md:w-10 p-0 bg-transparent">
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* 撤销/清空 */}
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={paths.length === 0}
            className="h-9 px-2 md:px-3 bg-transparent"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="h-9 px-2 md:px-3 text-destructive bg-transparent"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* 保存/关闭 */}
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-3 bg-transparent">
            取消
          </Button>
          <Button size="sm" onClick={handleSave} className="h-9 px-3 bg-primary">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
        </div>
      </div>

      {/* 画布区域 */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
        onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => {
          e.preventDefault()
          const touch = e.touches[0]
          startDrawing(touch.clientX, touch.clientY)
        }}
        onTouchMove={(e) => {
          e.preventDefault()
          const touch = e.touches[0]
          draw(touch.clientX, touch.clientY)
        }}
        onTouchEnd={(e) => {
          e.preventDefault()
          stopDrawing()
        }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
          }}
        >
          {/* 背景图片画布 */}
          <canvas ref={bgCanvasRef} className="absolute top-0 left-0" />
          {/* 批注画布 */}
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>
      </div>
    </div>
  )
}
