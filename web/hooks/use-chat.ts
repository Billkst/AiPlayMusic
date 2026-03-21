import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getCatalogForPrompt, getTracksByIds, type Track } from '@/lib/catalog'
import { buildSystemPrompt } from '@/lib/prompt-builder'
import { parseRecommendations, parseOptions } from '@/lib/response-parser'
import { sendChatMessage, type ChatConfig, type ChatMessage } from '@/lib/chat-engine'
import { TurnController } from '@/lib/turn-controller'
import { AI_PROVIDERS } from '@/lib/providers'
import { MOODS } from '@/components/MoodCard'

const STORAGE_KEYS = {
  providerId: 'ai_provider_id',
  apiKey: 'ai_api_key',
  model: 'ai_model',
} as const

export interface UIMessage {
  role: 'user' | 'model'
  text: string
  options?: string[]
  recommendations?: Array<{ track: Track; reason: string }>
  isError?: boolean
}

function getInitialMessages(): UIMessage[] {
  return [
    {
      role: 'model',
      text: '👋 你好！我是你的 AI 音乐助手。先告诉我你现在想要的氛围，我会按你的感觉来选歌。',
      options: MOODS.map(mood => mood.title),
    },
  ]
}

function toApiMessages(messages: UIMessage[]): ChatMessage[] {
  return messages.map(message => ({
    role: message.role === 'model' ? 'assistant' : 'user',
    content: message.text,
  }))
}

function readConfigFromStorage(): ChatConfig | null {
  if (typeof window === 'undefined') return null

  const defaultProvider = AI_PROVIDERS[0]
  const providerId = localStorage.getItem(STORAGE_KEYS.providerId) || defaultProvider.id
  const apiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || ''
  const model = localStorage.getItem(STORAGE_KEYS.model) || defaultProvider.defaultModels[0]

  return { providerId, apiKey, model }
}

export function useChat() {
  const turnControllerRef = useRef(new TurnController())
  const [messages, setMessages] = useState<UIMessage[]>(getInitialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null)

  const refreshConfig = useCallback(() => {
    setChatConfig(readConfigFromStorage())
  }, [])

  useEffect(() => {
    refreshConfig()
  }, [refreshConfig])

  const appendModelResponse = useCallback((baseMessages: UIMessage[], content: string, isError = false): UIMessage[] => {
    const parsedRecommendations = parseRecommendations(content)
    const parsedOptions = parseOptions(parsedRecommendations.cleanText)

    const recommendationReasonMap = new Map(
      parsedRecommendations.recommendations.map(item => [item.id, item.reason])
    )

    const recommendations = getTracksByIds(
      parsedRecommendations.recommendations.map(item => item.id)
    ).map(track => ({
      track,
      reason: recommendationReasonMap.get(track.id) || '为你挑选的推荐',
    }))

    const nextMessages = [
      ...baseMessages,
      {
        role: 'model' as const,
        text: parsedOptions.cleanText,
        options: parsedOptions.options.length > 0 ? parsedOptions.options : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        isError,
      },
    ]

    setMessages(nextMessages)
    return nextMessages
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      const messageText = text.trim()
      if (!messageText || isLoading) return

      const config = chatConfig ?? readConfigFromStorage()
      if (!config?.apiKey) return

      const nextMessages: UIMessage[] = [...messages, { role: 'user', text: messageText }]
      setMessages(nextMessages)
      setIsLoading(true)

      turnControllerRef.current.recordUserTurn()

      const systemPrompt = buildSystemPrompt({
        catalogJson: getCatalogForPrompt(),
        currentTurn: turnControllerRef.current.currentTurn,
        rejectedIds: turnControllerRef.current.rejectedIds,
      })

      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...toApiMessages(nextMessages),
      ]

      try {
        const response = await sendChatMessage(apiMessages, config)

        if (response.error) {
          appendModelResponse(nextMessages, response.error, true)
          return
        }

        appendModelResponse(nextMessages, response.content)
      } catch {
        appendModelResponse(nextMessages, '抱歉，当前服务暂时不可用，请稍后再试。', true)
      } finally {
        setIsLoading(false)
      }
    },
    [appendModelResponse, chatConfig, isLoading, messages]
  )

  const handleNotMyVibe = useCallback(
    async (rejectedIds: string[]) => {
      if (isLoading || rejectedIds.length === 0) return

      const config = chatConfig ?? readConfigFromStorage()
      if (!config?.apiKey) return

      turnControllerRef.current.addRejectedIds(rejectedIds)
      turnControllerRef.current.resetForNewVibe()
      setIsLoading(true)

      const systemPrompt = `${buildSystemPrompt({
        catalogJson: getCatalogForPrompt(),
        currentTurn: turnControllerRef.current.currentTurn,
        rejectedIds: turnControllerRef.current.rejectedIds,
      })}

系统请求：用户刚刚点击了 "Not My Vibe"，请排除被拒绝的歌曲并直接给出新一批推荐。`

      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...toApiMessages(messages),
        {
          role: 'user',
          content: '这批不太对味，请换一批，不要再出现刚刚那些歌。',
        },
      ]

      try {
        const response = await sendChatMessage(apiMessages, config)

        if (response.error) {
          appendModelResponse(messages, response.error, true)
          return
        }

        appendModelResponse(messages, response.content)
      } catch {
        appendModelResponse(messages, '抱歉，换一批时出现了问题，请稍后再试。', true)
      } finally {
        setIsLoading(false)
      }
    },
    [appendModelResponse, chatConfig, isLoading, messages]
  )

  const resetChat = useCallback(() => {
    turnControllerRef.current.reset()
    setMessages(getInitialMessages())
  }, [])

  const hasApiKey = useMemo(() => Boolean(chatConfig?.apiKey?.trim()), [chatConfig])

  return {
    messages,
    isLoading,
    hasApiKey,
    sendMessage,
    handleNotMyVibe,
    resetChat,
    refreshConfig,
  }
}
