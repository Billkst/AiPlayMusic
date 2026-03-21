"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { Loader2, RefreshCw, Send, Settings, Sparkles, X } from 'lucide-react'
import { MoodCard, MOODS } from '@/components/MoodCard'
import { SongCard } from '@/components/SongCard'
import { ProviderConfigPanel } from '@/components/ProviderConfigPanel'
import { useChat } from '@/hooks/use-chat'

interface AIChatPanelProps {
  onClose: () => void
}

function isMoodOptionSet(options: string[] | undefined): boolean {
  if (!options || options.length !== MOODS.length) return false
  const moodTitles = new Set(MOODS.map(mood => mood.title))
  return options.every(option => moodTitles.has(option))
}

export function AIChatPanel({ onClose }: AIChatPanelProps) {
  const [input, setInput] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, isLoading, hasApiKey, sendMessage, handleNotMyVibe, resetChat, refreshConfig } = useChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, showConfig])

  const latestRecommendations = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index--) {
      const message = messages[index]
      if (message.role === 'model' && message.recommendations && message.recommendations.length > 0) {
        return message.recommendations
      }
    }
    return []
  }, [messages])

  const handleSend = async (text: string) => {
    const value = text.trim()
    if (!value || isLoading) return
    setInput('')
    await sendMessage(value)
  }

  const handleConfigSaved = () => {
    refreshConfig()
    setShowConfig(false)
  }

  return (
    <div className="w-[350px] lg:w-[420px] bg-[#121212] rounded-lg flex flex-col overflow-hidden border border-[#282828] shadow-2xl flex-shrink-0 animate-in slide-in-from-right-8 duration-300">
      <div className="p-4 flex items-center justify-between border-b border-[#282828] bg-gradient-to-r from-[#1f1f1f] to-[#121212]">
        <div className="flex items-center gap-2 text-white font-bold">
          <Sparkles className="w-5 h-5 text-[#1db954]" />
          <span>AI 音乐助手</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowConfig(prev => !prev)}
            className={`p-1.5 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition ${showConfig ? 'text-white bg-[#2a2a2a]' : ''}`}
            title="提供商配置"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={resetChat}
            className="p-1.5 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition"
            title="重置对话"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a] transition"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showConfig ? (
        <ProviderConfigPanel onClose={() => setShowConfig(false)} onSave={handleConfigSaved} />
      ) : !hasApiKey ? (
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#333] bg-[#1a1a1a] p-4 space-y-2">
            <h3 className="text-white font-semibold">先完成 API 配置</h3>
            <p className="text-sm text-[#b3b3b3] leading-relaxed">
              你还没有配置 API Key。点击右上角设置图标，选择提供商并保存 Key 后即可开始聊天推荐。
            </p>
            <button
              onClick={() => setShowConfig(true)}
              className="mt-2 rounded-full bg-[#1db954] px-4 py-2 text-sm font-bold text-black hover:scale-[1.02] transition"
            >
              去配置
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
            {messages.map((message, index) => {
              const showMoodCards = message.role === 'model' && isMoodOptionSet(message.options)
              const showOptionPills = message.role === 'model' && !showMoodCards && (message.options?.length ?? 0) > 0
              const showRecommendations = message.role === 'model' && (message.recommendations?.length ?? 0) > 0

              return (
                <div key={index} className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm ${
                      message.role === 'user'
                        ? 'bg-[#2a2a2a] text-white rounded-tr-sm'
                        : message.isError
                          ? 'bg-[#2a1b16] border border-[#7a3a2d] text-[#ffd5c9]'
                          : 'bg-transparent text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p>{message.text}</p>
                    ) : (
                      <div className="prose prose-invert prose-p:my-2 max-w-none text-sm leading-relaxed">
                        <Markdown>{message.text}</Markdown>
                      </div>
                    )}
                  </div>

                  {showMoodCards && (
                    <div className="w-full grid grid-cols-2 gap-2.5">
                      {MOODS.map(mood => (
                        <MoodCard
                          key={mood.title}
                          emoji={mood.emoji}
                          title={mood.title}
                          desc={mood.desc}
                          onClick={() => handleSend(mood.title)}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  )}

                  {showOptionPills && (
                    <div className="w-full flex flex-wrap gap-2">
                      {message.options?.map(option => (
                        <button
                          key={option}
                          onClick={() => handleSend(option)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-full bg-[#242424] border border-[#333] text-xs text-white hover:bg-[#333] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {showRecommendations && (
                    <div className="w-full flex flex-col gap-2">
                      {message.recommendations?.map(item => (
                        <SongCard key={item.track.id} track={item.track} reason={item.reason} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {latestRecommendations.length > 0 && (
              <button
                onClick={() => handleNotMyVibe(latestRecommendations.map(item => item.track.id))}
                disabled={isLoading}
                className="self-start rounded-full border border-[#444] bg-[#1f1f1f] px-3 py-1.5 text-xs text-white hover:border-[#666] hover:bg-[#2a2a2a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Not My Vibe 换一批
              </button>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-[#b3b3b3]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在思考...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[#282828] bg-[#181818]">
            <div className="flex items-center bg-[#242424] rounded-full p-1 pr-2 border border-transparent focus-within:border-[#555] transition">
              <input
                type="text"
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    void handleSend(input)
                  }
                }}
                placeholder="告诉 AI 你想听什么..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm px-4 py-2 placeholder:text-[#8f8f8f]"
                disabled={isLoading}
              />
              <button
                onClick={() => void handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition"
                title="发送"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
