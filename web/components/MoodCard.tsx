'use client'

export const MOODS = [
  { emoji: '🔥', title: '极致燃向', desc: '肾上腺素拉满的时刻' },
  { emoji: '🌙', title: '深夜 emo', desc: '一个人的情绪角落' },
  { emoji: '🎯', title: '绝对专注', desc: '进入心流的通道' },
  { emoji: '🍷', title: '慵懒微醺', desc: '慢下来，享受此刻' },
  { emoji: '🚗', title: '户外兜风', desc: '风和自由的味道' },
  { emoji: '🌿', title: '助眠放空', desc: '把世界关在门外' },
]

interface MoodCardProps {
  emoji: string
  title: string
  desc: string
  onClick: () => void
  disabled?: boolean
}

export function MoodCard({ emoji, title, desc, onClick, disabled }: MoodCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 p-4 bg-[#1a1a1a] border border-[#333] rounded-xl hover:border-purple-500/50 hover:bg-[#242424] hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-[#333] min-w-[120px]"
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-white font-bold text-sm">{title}</span>
      <span className="text-[#b3b3b3] text-xs text-center">{desc}</span>
    </button>
  )
}
