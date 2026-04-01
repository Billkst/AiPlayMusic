import { NextRequest, NextResponse } from 'next/server'
import { getUsageStats, getRateLimitConfig } from '@/lib/rate-limiter'
import { createClient } from '@/lib/supabase/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  const password = request.headers.get('x-admin-password')
  
  if (!verifyPassword(password || '')) {
    return NextResponse.json({ error: '未授权' }, { status: 401 })
  }
  
  const stats = getUsageStats()
  const config = getRateLimitConfig()
  
  const supabase = await createClient()
  const { data: sessions } = await supabase
    .from('anonymous_sessions')
    .select('id, guest_quota_used, guest_quota_limit, created_at, updated_at')
    .order('updated_at', { ascending: false })
  
  const guestStats = {
    totalSessions: sessions?.length || 0,
    totalUsage: sessions?.reduce((sum, s) => sum + (s.guest_quota_used || 0), 0) || 0,
    activeSessions: sessions?.filter(s => (s.guest_quota_used || 0) > 0).length || 0,
    recentSessions: sessions?.slice(0, 20) || [],
  }
  
  return NextResponse.json({ ...stats, ...config, guest: guestStats })
}
