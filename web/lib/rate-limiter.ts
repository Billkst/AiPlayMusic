interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

let LIMIT = 20
let WINDOW_MS = 24 * 60 * 60 * 1000

export function updateRateLimit(limit: number, windowHours: number = 24) {
  LIMIT = limit
  WINDOW_MS = windowHours * 60 * 60 * 1000
}

export function getRateLimitConfig() {
  return { limit: LIMIT, windowHours: WINDOW_MS / (60 * 60 * 1000) }
}

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

export function getUsageStats() {
  const now = Date.now()
  let totalUsers = 0
  let totalRequests = 0
  
  store.forEach((entry) => {
    if (now <= entry.resetAt) {
      totalUsers++
      totalRequests += entry.count
    }
  })
  
  return { totalUsers, totalRequests, limit: LIMIT }
}
