import { type InferOutput, object, optional, safeParse, string } from 'valibot'
import { createHttpError, NetworkError, ValidationError } from '@/lib/errors/api-error'
import { logger } from '@/lib/logger'

const BackendErrorSchema = object({
  detail: optional(string()),
  error_code: optional(string()),
  message: optional(string()),
})

type BackendErrorBody = InferOutput<typeof BackendErrorSchema>

function parseBackendError(body: unknown): BackendErrorBody {
  if (typeof body === 'string') {
    return { detail: body }
  }
  const result = safeParse(BackendErrorSchema, body)
  if (result.success) {
    return result.output
  }
  return {}
}

export type SuccessResponse<T> = {
  success: boolean
  timestamp: string
  request_id?: string
  data: T
}

export type PaginatedResponse<T> = {
  success: boolean
  timestamp: string
  request_id?: string
  data: T[]
  pagination?: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
}

export type MessageResponse = {
  message: string
}

export type ApiFetchOptions = RequestInit & {
  data?: unknown
  next?: {
    revalidate?: number
    tags?: string[]
  }
  skipRetry?: boolean
  /**
   * Force retry behavior for non-idempotent methods (POST, PATCH, DELETE, PUT).
   * By default, only safe methods (GET, HEAD, OPTIONS) are retried on network errors.
   * Set to true to explicitly allow retries for non-safe methods when the operation is idempotent.
   */
  retryable?: boolean
  timeout?: number
  maxRetries?: number
}

export const DEFAULT_TIMEOUT = 30_000 // 30 seconds
export const DEFAULT_MAX_RETRIES = 2

/**
 * HTTP methods that are safe to retry on network errors.
 * These methods are idempotent and don't cause side effects when retried.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export type ExecuteFetchOptions = {
  maxRetries?: number
  /**
   * Override default retry behavior.
   * By default, only safe methods (GET, HEAD, OPTIONS) are retried.
   * Set to true to force retries for non-safe methods.
   */
  retryable?: boolean
}

/**
 * Checks if the HTTP method is safe to retry on network errors.
 */
function isSafeMethod(method: string | undefined): boolean {
  const normalizedMethod = (method ?? 'GET').toUpperCase()
  return SAFE_METHODS.has(normalizedMethod)
}

/**
 * Fetch with retry strategy and exponential backoff.
 *
 * By default, only safe/idempotent methods (GET, HEAD, OPTIONS) are retried
 * on network errors. This prevents double-submission of forms, double-creation
 * of resources, etc.
 *
 * Use the `retryable` option to explicitly allow retries for non-safe methods
 * when the operation is known to be idempotent.
 */
export async function executeFetch(
  url: string,
  init: RequestInit,
  path: string,
  options: ExecuteFetchOptions = {}
): Promise<Response> {
  const { maxRetries = DEFAULT_MAX_RETRIES, retryable } = options

  // Determine if this request should be retried on network errors
  const shouldRetryOnError = retryable ?? isSafeMethod(init.method)

  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, init)
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error')

      // Don't retry if the request was aborted
      if (init.signal?.aborted) {
        logger.log('[Fetch] Request aborted', { path })
        throw lastError
      }

      // Don't retry non-idempotent methods unless explicitly allowed
      if (!shouldRetryOnError) {
        logger.log('[Fetch] Not retrying non-idempotent method', {
          path,
          method: init.method,
          error: lastError.message,
        })
        throw new NetworkError(lastError.message, {
          path,
          method: init.method,
          cause: lastError,
        })
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) break

      // Exponential backoff: 1s, 2s, 4s, maximum 10s
      const delay = Math.min(1000 * Math.pow(2, attempt), 10_000)
      logger.log(`[Fetch] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, {
        path,
        error: lastError.message,
      })

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new NetworkError(lastError?.message ?? 'Network request failed', {
    path,
    method: init.method,
    cause: lastError,
  })
}

export async function parseErrorBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '')
  try {
    return text ? JSON.parse(text) : null
  } catch {
    return text
  }
}

export async function parseSuccessResponse<T>(
  response: Response,
  path: string,
  method: string | undefined
): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    throw new ValidationError(`Unexpected content-type: ${contentType}`, {
      path,
      method,
      status: response.status,
      responseBody: text,
    })
  }

  return (await response.json()) as T
}

/**
 * RefreshManager type - functional pattern for preventing race conditions
 * during token refresh operations.
 */
export type RefreshManager = {
  refresh: (refreshFn: () => Promise<boolean>) => Promise<boolean>
  reset: () => void
}

/**
 * Creates a RefreshManager using closures instead of class.
 * Prevents race conditions with multiple 401 responses.
 *
 * @returns RefreshManager instance with refresh and reset methods
 */
export function createRefreshManager(): RefreshManager {
  let promise: Promise<boolean> | null = null
  let isRefreshing = false

  return {
    async refresh(refreshFn: () => Promise<boolean>): Promise<boolean> {
      if (isRefreshing && promise) {
        return promise
      }

      isRefreshing = true
      promise = refreshFn().finally(() => {
        isRefreshing = false
        promise = null
      })

      return promise
    },

    reset() {
      isRefreshing = false
      promise = null
    },
  }
}

/**
 * Client-side token refresh using Supabase Auth.
 *
 * Supabase handles token refresh automatically, but this function
 * can be called explicitly when a 401 is received from the backend.
 *
 * Note: This only works on the client side where Supabase client is available.
 * Server-side code should use verifySession() from infrastructure/auth.
 *
 * @returns Object with success flag
 */
export async function refreshToken(): Promise<{ success: boolean }> {
  // Only works on client side
  if (globalThis.window === undefined) {
    logger.error('[RefreshToken] Cannot refresh on server side')
    return { success: false }
  }

  try {
    // Dynamic import to avoid server-side issues
    const { supabase } = await import('@/adapters/supabase/client')

    // Try to get current session - Supabase auto-refreshes if needed
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      logger.error('[RefreshToken] Session refresh failed', { error: error.message })
      return { success: false }
    }

    if (!data.session) {
      logger.log('[RefreshToken] No active session')
      return { success: false }
    }

    logger.log('[RefreshToken] Session is valid')
    return { success: true }
  } catch (error) {
    logger.error('[RefreshToken] Refresh error', { error })
    return { success: false }
  }
}

/**
 * Response handling - universal for client and server
 */
export async function handleResponse<T>(
  response: Response,
  path: string,
  method: string | undefined,
  skipRetry: boolean | undefined,
  onUnauthorized: () => Promise<T>
): Promise<T> {
  if (response.status === 401 && !skipRetry) {
    return onUnauthorized()
  }

  if (!response.ok) {
    const errorBody = await parseErrorBody(response)
    const parsed = parseBackendError(errorBody)
    const message = parsed.detail ?? parsed.message ?? response.statusText

    // Parse Retry-After header for rate limiting
    const retryAfterHeader = response.headers.get('Retry-After')
    const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined

    throw createHttpError(response.status, message, {
      path,
      method,
      status: response.status,
      statusText: response.statusText,
      responseBody: errorBody,
      errorCode: parsed.error_code,
      retryAfter: Number.isNaN(retryAfter) ? undefined : retryAfter,
    })
  }

  return parseSuccessResponse<T>(response, path, method)
}
