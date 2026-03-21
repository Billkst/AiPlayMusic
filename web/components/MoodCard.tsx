'use client'

export const MOODS = [
  { emoji: '🔥', title: '极致燃向', desc: '肾上腺素拉满的时刻' },
  { emoji: '🌙', title: '深夜 emo', desc: '一个人的情绪角落' },
  { emoji: '🎯', title: '绝对专注', desc: '进入心流的通道' },
  { emoji: '🍷', title: '慵懒微醺', desc: '慢下来，享受此刻' },
  { emoji: '🚗', title: '户外兜风', desc: '风和自由的味道' },
  { emoji: '🌿', title: '助眠放空', desc: '把世界关在门外' },
]

const MOOD_GRADIENTS: Record<string, string> = {
  '极致燃向': 'from-red-900/40 to-orange-900/20',
  '深夜 emo': 'from-purple-900/40 to-indigo-900/20',
  '绝对专注': 'from-teal-900/40 to-cyan-900/20',
  '慵懒微醺': 'from-amber-900/40 to-yellow-900/20',
  '户外兜风': 'from-green-900/40 to-emerald-900/20',
  '助眠放空': 'from-indigo-900/40 to-blue-900/20',
}

interface MoodCardProps {
  emoji: string
  title: string
  desc: string
  onClick: () => void
  disabled?: boolean
}

export function MoodCard({ emoji, title, desc, onClick, disabled }: MoodCardProps) {
  const gradient = MOOD_GRADIENTS[title] ?? 'from-slate-800/40 to-zinc-800/20'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden flex flex-col items-center gap-2.5 p-5 bg-gradient-to-br ${gradient} border border-white/15 rounded-2xl hover:scale-[1.03] hover:border-white/30 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.25),0_10px_24px_rgba(0,0,0,0.28)] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-white/15 min-w-[140px]`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.14),transparent_60%)] opacity-70" />
      <span className="absolute right-3 top-2 text-base text-white/60 transition-transform duration-300 group-hover:rotate-12">✨</span>
      <span className="relative text-5xl drop-shadow-[0_0_12px_rgba(255,255,255,0.18)]">{emoji}</span>
      <span className="relative text-white font-bold text-sm tracking-wide">{title}</span>
      <span className="relative text-white/75 text-xs text-center leading-relaxed">{desc}</span>
    </button>
  )
}
