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
    console.log('API Quota check result for guest:', hasQuota) // 关键调试日志
    if (!hasQuota) {
      return NextResponse.json(
        { error: '今日体验次数已用完，请登录继续使用' },
        { status: 429 }
      )
    }
  }

  try {
    const { messages, sessionId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '无效的请求参数' }, { status: 400 })
    }

    const apiKey = process.env.AI_API_KEY
    const provider = (process.env.AI_PROVIDER || 'deepseek').toLowerCase()
    const modelName = process.env.AI_MODEL || 'deepseek-chat'

    console.log('[DEBUG] API Config:', { provider, modelName, hasApiKey: !!apiKey })

    if (!apiKey) {
      return NextResponse.json(
        { error: '服务端未配置 API Key' },
        { status: 503 }
      )
    }

    const baseUrls: Record<string, string> = {
      deepseek: 'https://api.deepseek.com/v1/chat/completions',
      openai: 'https://api.openai.com/v1/chat/completions',
      moonshot: 'https://api.moonshot.cn/v1/chat/completions',
      zhipu: 'https://open.bigmodel.cn/api/paas/v1/chat/completions',
      qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      google: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    }

    const url = baseUrls[provider] || baseUrls.deepseek

    console.log('[DEBUG] Request URL:', url)
    console.log('[DEBUG] Request body:', JSON.stringify({ model: modelName, messages, temperature: 0.8, max_tokens: 2048 }))

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

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

    console.log('[DEBUG] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[DEBUG] AI API Error:', response.status, errorText)
      
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

    console.log('[DEBUG] AI Response content:', content)

    if (!user) {
      await consumeGuestQuota()
    }

    return NextResponse.json({ content })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI 响应超时（60秒），请重试或简化问题' },
        { status: 504 }
      )
    }

    if (error.code === 'UND_ERR_SOCKET' || error.cause?.code === 'UND_ERR_SOCKET') {
      return NextResponse.json(
        { error: 'AI 服务连接中断，请重试' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
}
