"use client"

// 萌芽小苗吉祥物组件
export function SproutMascot({
  size = "md",
  mood = "happy",
}: {
  size?: "sm" | "md" | "lg"
  mood?: "happy" | "excited" | "thinking"
}) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  }

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* 花盆 */}
        <path d="M25 70 L35 95 L65 95 L75 70 Z" fill="#D4956A" stroke="#B8845A" strokeWidth="2" />
        <ellipse cx="50" cy="70" rx="28" ry="8" fill="#E8A87C" />

        {/* 泥土 */}
        <ellipse cx="50" cy="70" rx="23" ry="5" fill="#8B6914" />

        {/* 茎 */}
        <path d="M50 70 Q48 50 50 35" stroke="#7CC47C" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* 叶子左 */}
        <ellipse cx="38" cy="45" rx="12" ry="6" fill="#9AE59A" transform="rotate(-30 38 45)" />
        <path d="M38 45 Q44 48 50 50" stroke="#7CC47C" strokeWidth="1" fill="none" />

        {/* 叶子右 */}
        <ellipse cx="62" cy="45" rx="12" ry="6" fill="#9AE59A" transform="rotate(30 62 45)" />
        <path d="M62 45 Q56 48 50 50" stroke="#7CC47C" strokeWidth="1" fill="none" />

        {/* 头部（小芽） */}
        <ellipse cx="50" cy="28" rx="16" ry="14" fill="#B8E986" />

        {/* 眼睛 */}
        <ellipse cx="44" cy="26" rx="3" ry="4" fill="#333" />
        <ellipse cx="56" cy="26" rx="3" ry="4" fill="#333" />
        <circle cx="45" cy="25" r="1" fill="#fff" />
        <circle cx="57" cy="25" r="1" fill="#fff" />

        {/* 嘴巴 */}
        {mood === "happy" && (
          <path d="M45 32 Q50 36 55 32" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {mood === "excited" && <ellipse cx="50" cy="33" rx="4" ry="3" fill="#FF6B6B" />}
        {mood === "thinking" && <ellipse cx="50" cy="33" rx="3" ry="2" fill="#333" />}

        {/* 脸红 */}
        <ellipse cx="40" cy="30" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />
        <ellipse cx="60" cy="30" rx="3" ry="2" fill="#FFB6C1" opacity="0.6" />

        {/* 顶部小叶子 */}
        <ellipse cx="50" cy="15" rx="4" ry="8" fill="#7CC47C" />
      </svg>
    </div>
  )
}
