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
  
  const { data: session } = await supabase
    .from('anonymous_sessions')
    .select('*')
    .eq('session_token', token)
    .single()
  
  if (!session) {
    const { data: newSession } = await supabase
      .from('anonymous_sessions')
      .insert({ session_token: token })
      .select()
      .single()
    
    return newSession
  }
  
  return session
}

export async function checkGuestQuota() {
  const session = await getOrCreateGuestSession()
  console.log('Guest session quota check:', {
    id: session?.id,
    used: session?.guest_quota_used,
    limit: session?.guest_quota_limit
  })
  if (!session) return false
  return (session.guest_quota_used || 0) < (session.guest_quota_limit || 20)
}

export async function consumeGuestQuota() {
  const session = await getOrCreateGuestSession()
  if (!session) return
  const supabase = await createClient()
  
  await supabase
    .from('anonymous_sessions')
    .update({ 
      guest_quota_used: (session.guest_quota_used || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.id)
}
