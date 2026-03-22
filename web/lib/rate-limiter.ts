interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const LIMIT = 20
const WINDOW_MS = 24 * 60 * 60 * 1000

export async function rateLimit(ip: string): Promise<boolean> {
  const now = Date.now()
  const entry = store.get(ip)

  if (!entry || now > entry.resetAt) {
    store.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })
    return true
  }

  if (entry.count >= LIMIT) {
    return false
  }

  entry.count++
  return true
}

export function getRemainingQuota(ip: string): number {
  const entry = store.get(ip)
  if (!entry || Date.now() > entry.resetAt) {
    return LIMIT
  }
  return Math.max(0, LIMIT - entry.count)
}
