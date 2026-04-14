import type { PostgrestError } from '@supabase/supabase-js'

/**
 * PostgreSQL error codes that indicate transient connection/pooling issues.
 * These errors are safe to retry — they usually resolve on the next attempt.
 *
 * @see https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
const TRANSIENT_PG_CODES = new Set([
  '42P05', // prepared statement already exists (PgBouncer transaction mode)
  '08006', // connection failure
  '08003', // connection does not exist
  '08001', // unable to establish connection
  '08004', // rejected connection
  '57P01', // admin shutdown
  '57P03', // cannot connect now
  '40001', // serialization failure
])

/** Substring patterns in error messages that indicate transient issues */
const TRANSIENT_MESSAGE_PATTERNS = [
  'prepared statement',
  'connection',
  'pgbouncer',
  'too many clients',
]

/**
 * Check if a PostgrestError is a transient error that can be retried.
 */
function isTransientError(error: PostgrestError): boolean {
  if (error.code && TRANSIENT_PG_CODES.has(error.code)) {
    return true
  }
  const msg = error.message.toLowerCase()
  return TRANSIENT_MESSAGE_PATTERNS.some((pattern) => msg.includes(pattern))
}

/**
 * Get a user-friendly message for transient database errors.
 * Hides raw PostgreSQL/PgBouncer internals from users.
 */
function getSanitizedMessage(error: PostgrestError, operation: string): string {
  if (isTransientError(error)) {
    return `Failed to ${operation}: temporary database issue, please try again`
  }
  return `Failed to ${operation}: ${error.message}`
}

/**
 * Type guard that throws an error if the Supabase operation failed.
 *
 * Sanitizes transient database errors (PgBouncer, connection pooling)
 * to prevent raw PostgreSQL messages from reaching the UI.
 *
 * @param error - PostgrestError from Supabase operation or null
 * @param operation - Description of the operation (e.g., "get labels", "create work item")
 * @throws Error with formatted message if error is not null
 */
export function throwIfError(
  error: PostgrestError | null,
  operation: string
): asserts error is null {
  if (error) {
    throw new Error(getSanitizedMessage(error, operation))
  }
}

/**
 * Execute a Supabase query with automatic retry for transient errors.
 *
 * PgBouncer in transaction mode can return "prepared statement already exists"
 * when connections are reused. A single retry usually resolves this.
 *
 * @param queryFn - Async function that performs the Supabase query
 * @param operation - Description of the operation for error messages
 * @param maxRetries - Maximum number of retries (default: 1)
 * @returns The query result data
 * @throws Error if all retries fail
 *
 * @example
 * ```ts
 * const workItems = await withRetry(
 *   async () => {
 *     const { data, error } = await supabase.from('work_items').select('*')
 *     throwIfError(error, 'get work items')
 *     return data
 *   },
 *   'get work items'
 * )
 * ```
 */
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  operation: string,
  maxRetries = 1
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error) {
      lastError = error
      const isLastAttempt = attempt === maxRetries
      // Only retry if the error message looks transient
      const message = error instanceof Error ? error.message.toLowerCase() : ''
      const isTransient = TRANSIENT_MESSAGE_PATTERNS.some((p) => message.includes(p))
      if (isLastAttempt || !isTransient) {
        throw error
      }
      // Brief delay before retry
      await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)))
    }
  }
  throw lastError
}
