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
  apiContent?: string
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
    content: message.role === 'user' ? (message.apiContent ?? message.text) : message.text,
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

    let text = parsedOptions.cleanText
    if (!isError && recommendations.length === 0 && content.includes('RECOMMENDATIONS:')) {
      text += '\n\n*(注：未能成功解析推荐列表，请尝试重新描述或重试)*'
    }

    const nextMessages = [
      ...baseMessages,
      {
        role: 'model' as const,
        text,
        options: parsedOptions.options.length > 0 ? parsedOptions.options : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        isError,
      },
    ]

    setMessages(nextMessages)
    return nextMessages
  }, [])

  const sendUserMessage = useCallback(
    async (message: UIMessage) => {
      const messageText = message.text.trim()
      const apiContent = message.apiContent?.trim()
      if (!messageText || isLoading) return

      const config = chatConfig ?? readConfigFromStorage()
      if (!config?.apiKey) {
        return
      }

      const nextMessages: UIMessage[] = [
        ...messages,
        {
          role: 'user',
          text: messageText,
          apiContent: apiContent && apiContent !== messageText ? apiContent : undefined,
        },
      ]
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
          appendModelResponse(nextMessages, `发送失败: ${response.error}`, true)
          return
        }

        appendModelResponse(nextMessages, response.content)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误'
        appendModelResponse(nextMessages, `抱歉，当前服务暂时不可用 (${errorMessage})，请稍后再试。`, true)
      } finally {
        setIsLoading(false)
      }
    },
    [appendModelResponse, chatConfig, isLoading, messages]
  )

  const sendMessage = useCallback(
    async (text: string) => sendUserMessage({ role: 'user', text }),
    [sendUserMessage]
  )

  const sendCardSelection = useCallback(
    async (displayText: string, contextHint: string) =>
      sendUserMessage({ role: 'user', text: displayText, apiContent: contextHint }),
    [sendUserMessage]
  )

  const retryLastMessage = useCallback(async () => {
    if (isLoading) return

    const lastUserIndex = [...messages].reverse().findIndex(m => m.role === 'user')
    if (lastUserIndex === -1) return

    const actualIndex = messages.length - 1 - lastUserIndex
    const lastUserMessage = messages[actualIndex]

    const baseMessages = messages.slice(0, actualIndex)
    setMessages(baseMessages)

    await sendUserMessage({
      role: 'user',
      text: lastUserMessage.text,
      apiContent: lastUserMessage.apiContent,
    })
  }, [isLoading, messages, sendUserMessage])

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
          appendModelResponse(messages, `换一批失败: ${response.error}`, true)
          return
        }

        appendModelResponse(messages, response.content)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '未知错误'
        appendModelResponse(messages, `抱歉，换一批时出现了问题 (${errorMessage})，请稍后再试。`, true)
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
    sendCardSelection,
    retryLastMessage,
    handleNotMyVibe,
    resetChat,
    refreshConfig,
  }
}
