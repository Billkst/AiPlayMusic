import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/contexts/PlayerContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { PostHogProvider } from '@/lib/posthog-provider'
import { PostHogPageView } from '@/lib/posthog-pageview'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'AiPlayMusic - AI 原生音乐播放器',
  description: '基于大模型的智能听歌体验，从被动搜索到意图共鸣',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body suppressHydrationWarning>
        <AuthProvider>
          <PostHogProvider>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            <PlayerProvider>{children}</PlayerProvider>
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
