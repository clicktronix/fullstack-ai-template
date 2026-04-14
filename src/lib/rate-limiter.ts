/**
 * In-memory sliding window rate limiter.
 * Tracks request timestamps per user and rejects requests that exceed the limit.
 */

type RateLimitConfig = {
  maxRequests: number
  windowMs: number
}

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds: number | null
}

const store = new Map<string, number[]>()

// Maximum number of keys in the store to prevent unbounded memory growth
const MAX_STORE_SIZE = 10_000

// Periodic cleanup to prevent memory leaks from inactive users
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let cleanupTimer: ReturnType<typeof setInterval> | null = null

function ensureCleanupScheduled(): void {
  if (cleanupTimer) return
  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, timestamps] of store) {
      const filtered = timestamps.filter((t) => now - t < CLEANUP_INTERVAL_MS)
      // Delete entries with empty timestamp arrays (more aggressive cleanup)
      if (filtered.length === 0) {
        store.delete(key)
      } else {
        store.set(key, filtered)
      }
    }
  }, CLEANUP_INTERVAL_MS)
  // Allow process to exit without waiting for cleanup
  if (typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref()
  }
}

/**
 * Evict oldest entries (FIFO) when store exceeds MAX_STORE_SIZE.
 * Map preserves insertion order, so the first entries are the oldest.
 * FIFO is sufficient for rate limiting — oldest keys are typically inactive users.
 */
function evictOldestEntries(): void {
  if (store.size <= MAX_STORE_SIZE) return

  const entriesToDelete = store.size - MAX_STORE_SIZE
  let deleted = 0
  for (const key of store.keys()) {
    if (deleted >= entriesToDelete) break
    store.delete(key)
    deleted++
  }
}

export function checkRateLimit(
  userId: string,
  config: RateLimitConfig,
  ip?: string
): RateLimitResult {
  ensureCleanupScheduled()

  const now = Date.now()
  // Use composite key: userId + ip for more granular limiting
  const key = ip
    ? `${userId}:${ip}:${config.maxRequests}:${config.windowMs}`
    : `${userId}:${config.maxRequests}:${config.windowMs}`
  const timestamps = store.get(key) ?? []

  // Remove expired timestamps outside the window
  const validTimestamps = timestamps.filter((t) => now - t < config.windowMs)

  if (validTimestamps.length >= config.maxRequests) {
    const oldestInWindow = validTimestamps[0]
    const retryAfterMs = config.windowMs - (now - oldestInWindow)
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    }
  }

  validTimestamps.push(now)
  store.set(key, validTimestamps)

  // Evict oldest entries if store grows beyond limit
  evictOldestEntries()

  return { allowed: true, retryAfterSeconds: null }
}

export const SUBMIT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
}

export const STREAM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60_000,
}
