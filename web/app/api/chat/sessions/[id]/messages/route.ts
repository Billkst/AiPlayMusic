import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { messages } = await request.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: '无效的消息数据' }, { status: 400 })
  }

  const messagesToInsert = messages.map(msg => ({
    chat_session_id: id,
    role: msg.role,
    content: msg.content,
  }))

  const { error } = await supabase
    .from('chat_messages')
    .insert(messagesToInsert)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ success: true })
}
