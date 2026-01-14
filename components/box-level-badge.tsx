"use client"

import { type BoxLevel, BOX_NAMES } from "@/lib/types"

// 盒子等级徽章颜色
const LEVEL_COLORS: Record<BoxLevel, string> = {
  0: "bg-gray-200 text-gray-600",
  1: "bg-sky-100 text-sky-600",
  2: "bg-amber-100 text-amber-600",
  3: "bg-emerald-100 text-emerald-600",
  4: "bg-pink-100 text-pink-600",
}

export function BoxLevelBadge({ level }: { level: BoxLevel }) {
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${LEVEL_COLORS[level]}`}>{BOX_NAMES[level]}</span>
}
