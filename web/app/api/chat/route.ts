import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGuestQuota, consumeGuestQuota } from '@/lib/guest-session'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    const hasQuota = await checkGuestQuota()
    if (!hasQuota) {
      return NextResponse.json(
        { error: '今日体验次数已用完，请登录继续使用' },
        { status: 429 }
      )
    }
  }

  try {
    const { messages, providerId, model, sessionId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '无效的请求参数' }, { status: 400 })
    }

    const apiKey = process.env.AI_API_KEY
    const provider = (providerId || process.env.AI_PROVIDER || 'deepseek').toLowerCase()
    const modelName = model || process.env.AI_MODEL || 'deepseek-chat'

    if (!apiKey) {
      return NextResponse.json(
        { error: '服务端未配置 API Key' },
        { status: 503 }
      )
    }

    // 获取 baseUrl
    const baseUrls: Record<string, string> = {
      deepseek: 'https://api.deepseek.com',
      openai: 'https://api.openai.com',
      moonshot: 'https://api.moonshot.cn',
      zhipu: 'https://open.bigmodel.cn/api/paas',
      qwen: 'https://dashscope.aliyuncs.com/compatible-mode',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
    }

    const baseUrl = baseUrls[provider] || baseUrls.deepseek
    const url = `${baseUrl}/v1/chat/completions`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        temperature: 0.8,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API Error:', response.status, errorText)
      
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          { error: '服务端 API Key 配置错误' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `AI 服务暂时不可用 (${response.status})` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    if (!user) {
      await consumeGuestQuota()
    }

    return NextResponse.json({ content })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI 响应超时，请稍后重试' },
        { status: 504 }
      )
    }

    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
