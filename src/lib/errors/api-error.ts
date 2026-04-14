/**
 * Centralized API error handling with typed error responses.
 *
 * NOTE: Classes are used here as an intentional exception to the project's
 * "no classes" rule. Error hierarchies require `instanceof` checks for ergonomic
 * pattern matching, which is the idiomatic JavaScript approach for error types.
 *
 * Error Hierarchy:
 * - ApiError (base class)
 *   - NetworkError (fetch failed, timeout, etc.)
 *   - HttpError (4xx, 5xx responses)
 *     - ClientError (400-499)
 *       - UnauthorizedError (401)
 *       - ForbiddenError (403)
 *       - NotFoundError (404)
 *       - RateLimitError (429)
 *     - ServerError (500-599)
 *   - ValidationError (schema validation failed)
 */

import { RATE_LIMIT_EXCEEDED } from './codes'

export type ErrorDetails = {
  path?: string
  method?: string
  status?: number
  statusText?: string
  responseBody?: unknown
  cause?: Error
  /** Backend error code for structured error handling */
  errorCode?: string
  /** Retry-After header value in seconds (for 429 responses) */
  retryAfter?: number
}

/**
 * Base API error class with structured error details
 */
export class ApiError extends Error {
  public name = 'ApiError'
  public readonly details: ErrorDetails

  constructor(message: string, details?: ErrorDetails) {
    super(message)
    this.details = details ?? {}
  }

  /**
   * Check if error is retryable (network error or 5xx)
   */
  isRetryable(): boolean {
    const status = this.details.status
    return !status || status >= 500
  }

  /**
   * Get HTTP status code if available
   */
  getStatus(): number | undefined {
    return this.details.status
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      details: this.details,
      stack: this.stack,
    }
  }
}

/**
 * Network-level errors (fetch failed, timeout, CORS, etc.)
 */
export class NetworkError extends ApiError {
  public override name = 'NetworkError'

  constructor(message: string, details?: ErrorDetails) {
    super(message, details)
  }

  override isRetryable(): boolean {
    return true // Network errors are always retryable
  }
}

/**
 * HTTP errors (4xx, 5xx responses)
 */
export class HttpError extends ApiError {
  public override name = 'HttpError'
  public readonly status: number

  constructor(status: number, message: string, details?: ErrorDetails) {
    super(message, { ...details, status })
    this.status = status
  }

  override isRetryable(): boolean {
    // Only 5xx errors are retryable
    return this.status >= 500
  }
}

/**
 * Client errors (400-499)
 */
export class ClientError extends HttpError {
  public override name = 'ClientError'

  override isRetryable(): boolean {
    return false // Client errors should not be retried
  }
}

/**
 * Server errors (500-599)
 */
export class ServerError extends HttpError {
  public override name = 'ServerError'

  override isRetryable(): boolean {
    return true // Server errors can be retried
  }
}

/**
 * Unauthorized (401)
 */
export class UnauthorizedError extends ClientError {
  public override name = 'UnauthorizedError'

  constructor(message = 'Unauthorized', details?: ErrorDetails) {
    super(401, message, details)
  }
}

/**
 * Forbidden (403)
 */
export class ForbiddenError extends ClientError {
  public override name = 'ForbiddenError'

  constructor(message = 'Forbidden', details?: ErrorDetails) {
    super(403, message, details)
  }
}

/**
 * Not Found (404)
 */
export class NotFoundError extends ClientError {
  public override name = 'NotFoundError'

  constructor(message = 'Not Found', details?: ErrorDetails) {
    super(404, message, details)
  }
}

/**
 * Rate Limited (429)
 * Includes retryAfter for implementing exponential backoff
 */
export class RateLimitError extends ClientError {
  public override name = 'RateLimitError'
  /** Time in seconds to wait before retrying */
  public readonly retryAfter: number

  constructor(retryAfter: number, message = 'Too Many Requests', details?: ErrorDetails) {
    super(429, message, { ...details, retryAfter })
    this.retryAfter = retryAfter
  }

  /**
   * Get retry delay in milliseconds
   */
  getRetryDelayMs(): number {
    return this.retryAfter * 1000
  }
}

/**
 * Validation error (schema validation failed)
 */
export class ValidationError extends ApiError {
  public override name = 'ValidationError'

  constructor(message: string, details?: ErrorDetails) {
    super(message, details)
  }

  override isRetryable(): boolean {
    return false // Validation errors are not retryable
  }
}

/**
 * Factory function to create appropriate error based on status code
 */
export function createHttpError(
  status: number,
  message: string,
  details?: ErrorDetails
): HttpError {
  switch (status) {
    case 401: {
      return new UnauthorizedError(message, details)
    }
    case 403: {
      return new ForbiddenError(message, details)
    }
    case 404: {
      return new NotFoundError(message, details)
    }
    case 429: {
      // Default to 60 seconds if Retry-After not provided
      const retryAfter = details?.retryAfter ?? 60
      return new RateLimitError(retryAfter, message, details)
    }
    default: {
      if (status >= 400 && status < 500) {
        return new ClientError(status, message, details)
      }
      return new ServerError(status, message, details)
    }
  }
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Type guard to check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.isRetryable()
  }
  // Network errors (TypeError: Failed to fetch) should be retried
  return error instanceof TypeError
}

/**
 * Get HTTP status from any error
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.getStatus()
  }
  return undefined
}

/**
 * Type guard to check if error is RateLimitError
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError
}

/**
 * Rate limit info extracted from error
 */
export type RateLimitInfo = {
  /** Time in seconds to wait before retrying */
  retryAfter: number
}

/**
 * Extract rate limit info from any error.
 * Returns null if error is not rate-limit related.
 *
 * Handles:
 * - RateLimitError instances
 * - Errors with RATE_LIMIT_EXCEEDED code
 * - SSE error events with rate limit code
 */
export function getRateLimitInfo(error: unknown): RateLimitInfo | null {
  // Handle RateLimitError class
  if (error instanceof RateLimitError) {
    return { retryAfter: Math.max(1, error.retryAfter) }
  }

  // Handle error-like objects with code property (e.g., SSE error events)
  if (error && typeof error === 'object' && 'code' in error) {
    // SSE error events are untyped objects — narrowing via assertion
    const sseError = error as { code?: string; retryAfter?: number }
    if (sseError.code === RATE_LIMIT_EXCEEDED) {
      const retryAfter = Number(sseError.retryAfter) || 60
      return { retryAfter: Math.max(1, retryAfter) }
    }
  }

  return null
}

/**
 * Get backend error code from any error
 */
export function getErrorCode(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.details.errorCode
  }
  return undefined
}

/**
 * Re-export error code utilities for convenience
 */
export { isAuthErrorCode, isRateLimitErrorCode, isRetryableErrorCode } from './codes'
export type { ErrorCode } from './codes'
