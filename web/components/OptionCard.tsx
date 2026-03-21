'use client'

import { ArrowUpRight, Sparkles } from 'lucide-react'

interface OptionCardProps {
  text: string
  onClick: () => void
  disabled?: boolean
}

function inferEmoji(text: string): string {
  if (/夜|深夜|凌晨|月|隧道/.test(text)) return '🌙'
  if (/雨|咖啡|窗边|微醺/.test(text)) return '☕'
  if (/路|车|兜风|高速/.test(text)) return '🚗'
  if (/海|风|户外|草地|公园/.test(text)) return '🌿'
  if (/专注|工作|学习|键盘|代码/.test(text)) return '🎧'
  if (/燃|运动|训练|冲刺|跑/.test(text)) return '🔥'
  return '✨'
}

export function OptionCard({ text, onClick, disabled }: OptionCardProps) {
  const emoji = inferEmoji(text)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative overflow-hidden w-full rounded-xl border border-white/15 bg-gradient-to-br from-slate-700/35 via-slate-800/25 to-black/35 p-3 text-left text-white hover:scale-[1.01] hover:border-white/30 hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_10px_20px_rgba(0,0,0,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.16),transparent_55%)] opacity-70" />
      <div className="relative flex items-start gap-2.5">
        <span className="text-base leading-none mt-0.5">{emoji}</span>
        <span className="flex-1 text-sm leading-relaxed">{text}</span>
        <span className="flex items-center gap-0.5 text-white/70 group-hover:text-white transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  )
}
