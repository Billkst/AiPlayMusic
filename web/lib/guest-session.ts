import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

const GUEST_TOKEN_COOKIE = 'guest_session_token'

export async function getOrCreateGuestSession() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  let token = cookieStore.get(GUEST_TOKEN_COOKIE)?.value
  
  if (!token) {
    token = crypto.randomUUID()
    cookieStore.set(GUEST_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
  }
  
  // 关键修复：确保查询获取到所有列，包含新添加的 quota 列
  let { data: session } = await supabase
    .from('anonymous_sessions')
    .select('id, session_token, guest_quota_used, guest_quota_limit')
    .eq('session_token', token)
    .single()
  
  if (!session) {
    const { data: newSession, error } = await supabase
      .from('anonymous_sessions')
      .insert({ 
        session_token: token,
        guest_quota_used: 0,
        guest_quota_limit: 20
      })
      .select('id, session_token, guest_quota_used, guest_quota_limit')
      .single()
    
    if (error) {
      console.error('创建游客会话失败:', error)
      return null
    }
    return newSession
  }
  
  return session
}

export async function checkGuestQuota() {
  const session = await getOrCreateGuestSession()
  console.log('Guest session quota check:', {
    id: session?.id,
    used: session?.guest_quota_used ?? 0,
    limit: session?.guest_quota_limit ?? 20
  })
  if (!session) return false 
  // 确保使用默认值进行比较
  return (session.guest_quota_used ?? 0) < (session.guest_quota_limit ?? 20)
}

export async function consumeGuestQuota() {
  const session = await getOrCreateGuestSession()
  if (!session) return
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('anonymous_sessions')
    .update({ 
      guest_quota_used: (session.guest_quota_used || 0) + 1
    })
    .eq('id', session.id)
  
  if (error) {
    console.error('消费配额失败:', error)
  } else {
    console.log('配额已消费:', (session.guest_quota_used || 0) + 1)
  }
}
