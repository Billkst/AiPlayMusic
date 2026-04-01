import { NextResponse } from 'next/server'
import { getOrCreateGuestSession } from '@/lib/guest-session'

export async function GET() {
  const session = await getOrCreateGuestSession()
  
  if (!session) {
    return NextResponse.json({ used: 0, limit: 20 })
  }
  
  return NextResponse.json({
    used: session.guest_quota_used ?? 0,
    limit: session.guest_quota_limit ?? 20,
  })
}
