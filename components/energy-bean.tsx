"use client"

// 能量豆组件
export function EnergyBean({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 bg-secondary/80 rounded-full px-4 py-2 shadow-sm">
      <div className="relative w-6 h-6">
        <svg viewBox="0 0 24 24" className="w-full h-full">
          {/* 豆子形状 */}
          <ellipse cx="12" cy="12" rx="10" ry="8" fill="#FFD93D" />
          <ellipse cx="12" cy="10" rx="8" ry="5" fill="#FFE566" />
          {/* 高光 */}
          <ellipse cx="9" cy="9" rx="3" ry="2" fill="#FFF5CC" opacity="0.8" />
          {/* 豆子纹路 */}
          <path d="M12 6 Q12 12 12 18" stroke="#E6C235" strokeWidth="1" fill="none" />
        </svg>
        {/* 闪光效果 */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-200 rounded-full animate-pulse" />
      </div>
      <span className="font-bold text-lg text-amber-700">{count}</span>
    </div>
  )
}
