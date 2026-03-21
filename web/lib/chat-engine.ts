import { getProviderById } from './providers'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatConfig {
  providerId: string
  apiKey: string
  model: string
}

export interface ChatResponse {
  content: string
  error?: string
}

export async function sendChatMessage(
  messages: ChatMessage[],
  config: ChatConfig
): Promise<ChatResponse> {
  const provider = getProviderById(config.providerId)
  if (!provider) {
    return { content: '', error: `未知的 AI 厂商: ${config.providerId}` }
  }

  if (!config.apiKey) {
    return { content: '', error: '请先配置 API Key' }
  }

  const url = `${provider.baseUrl}/v1/chat/completions`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.8,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { content: '', error: 'API Key 无效或已过期，请检查你的配置。' }
      }
      return { content: '', error: `API 请求失败 (${response.status})，请稍后重试。` }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    return { content }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { content: '', error: 'AI 响应超时，请检查网络连接后重试。' }
    }
    return { content: '', error: '网络连接失败，请检查网络状态后重试。' }
  }
}
