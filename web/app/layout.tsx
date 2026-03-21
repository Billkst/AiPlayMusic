import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/contexts/PlayerContext'

export const metadata: Metadata = {
  title: 'AiPlayMusic - AI 原生音乐播放器',
  description: '基于大模型的智能听歌体验，从被动搜索到意图共鸣',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        <PlayerProvider>{children}</PlayerProvider>
      </body>
    </html>
  )
}
