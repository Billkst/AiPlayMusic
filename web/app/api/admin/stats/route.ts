import { NextRequest, NextResponse } from 'next/server'
import { getUsageStats, getRateLimitConfig } from '@/lib/rate-limiter'

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
  
  return NextResponse.json({ ...stats, ...config })
}
