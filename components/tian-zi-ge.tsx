"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"

interface TianZiGeProps {
  word: string
  onComplete?: () => void
}

// 单个田字格组件
function SingleGrid({
  character,
  size = 160,
}: {
  character: string
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPosRef = useRef({ x: 0, y: 0 })

  // 绘制田字格背景
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const s = size
    const center = s / 2

    ctx.clearRect(0, 0, s, s)

    // 外边框
    ctx.strokeStyle = "#E5C07B"
    ctx.lineWidth = 3
    ctx.strokeRect(3, 3, s - 6, s - 6)

    // 中心虚线
    ctx.setLineDash([6, 4])
    ctx.strokeStyle = "#C9A96E"
    ctx.lineWidth = 1.5

    ctx.beginPath()
    ctx.moveTo(6, center)
    ctx.lineTo(s - 6, center)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(center, 6)
    ctx.lineTo(center, s - 6)
    ctx.stroke()

    // 对角线
    ctx.strokeStyle = "#D4B896"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(6, 6)
    ctx.lineTo(s - 6, s - 6)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(s - 6, 6)
    ctx.lineTo(6, s - 6)
    ctx.stroke()

    ctx.setLineDash([])

    // 绘制参考汉字（浅色）
    ctx.font = `${s * 0.65}px "ZCOOL KuaiLe", sans-serif`
    ctx.fillStyle = "rgba(120, 180, 120, 0.15)"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(character, center, center + s * 0.02)
  }, [character, size])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    drawGrid()
  }, [character, size, drawGrid])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    lastPosRef.current = pos
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()

    lastPosRef.current = pos
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  return (
    <canvas
      ref={canvasRef}
      className="touch-none cursor-crosshair rounded-lg"
      style={{ width: size, height: size }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  )
}

export function TianZiGe({ word, onComplete }: TianZiGeProps) {
  const characters = word.split("")
  const [hasDrawn, setHasDrawn] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 根据字数调整格子大小
  const getGridSize = () => {
    const len = characters.length
    if (len <= 2) return 140
    if (len <= 3) return 120
    return 100
  }

  const gridSize = getGridSize()

  // 检测是否有绘制
  useEffect(() => {
    const handlePointerUp = () => {
      setHasDrawn(true)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("pointerup", handlePointerUp)
      container.addEventListener("touchend", handlePointerUp)
    }

    return () => {
      if (container) {
        container.removeEventListener("pointerup", handlePointerUp)
        container.removeEventListener("touchend", handlePointerUp)
      }
    }
  }, [])

  // 清除所有画布
  const clearAll = () => {
    const container = containerRef.current
    if (!container) return

    const canvases = container.querySelectorAll("canvas")
    canvases.forEach((canvas) => {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // 重新绘制网格
        const event = new Event("clear")
        canvas.dispatchEvent(event)
      }
    })
    setHasDrawn(false)
    // 强制重新渲染
    window.location.reload()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={containerRef} className="flex gap-2 p-3 bg-amber-50 rounded-2xl shadow-lg">
        {characters.map((char, index) => (
          <SingleGrid key={index} character={char} size={gridSize} />
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          擦除重写
        </button>
        {hasDrawn && onComplete && (
          <button
            onClick={onComplete}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            写好了
          </button>
        )}
      </div>
    </div>
  )
}
