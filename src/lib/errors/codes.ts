/**
 * Unified error codes for the application.
 *
 * These codes can be used for:
 * - Displaying user-friendly error messages
 * - Error tracking and monitoring
 * - Conditional error handling logic
 */

// ===== Core Error Codes =====

/** Generic internal server error */
export const INTERNAL_ERROR = 'INTERNAL_ERROR'

/** Failed to fetch data from external source */
export const DATA_FETCH_ERROR = 'DATA_FETCH_ERROR'

/** Error during analysis processing */
export const ANALYSIS_ERROR = 'ANALYSIS_ERROR'

/** Error in AI agent processing */
export const AGENT_PROCESSING_ERROR = 'AGENT_PROCESSING_ERROR'

/** Request validation failed (422) */
export const VALIDATION_ERROR = 'VALIDATION_ERROR'

/** Requested resource not found (404) */
export const RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND'

/** Authentication required or failed (401) */
export const AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'

/** User lacks permission for this action (403) */
export const AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR'

/** Rate limit exceeded (429) */
export const RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'

/** Business logic constraint violation (400) */
export const BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR'

/** Resource conflict, e.g., duplicate (409) */
export const CONFLICT_ERROR = 'CONFLICT_ERROR'

/** Generic HTTP error */
export const HTTP_ERROR = 'HTTP_ERROR'

/** Generic data provider error (502) */
export const DATA_PROVIDER_ERROR = 'DATA_PROVIDER_ERROR'

/** Admin operation failed */
export const ADMIN_OPERATION_ERROR = 'ADMIN_OPERATION_ERROR'

// ===== SSE/Streaming Error Codes =====

/** SSE connection error */
export const CONNECTION_ERROR = 'CONNECTION_ERROR'

/** SSE timeout */
export const TIMEOUT = 'TIMEOUT'

/** Unknown SSE error */
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'

// ===== Error Code Type =====

/** All possible error codes */
export type ErrorCode =
  | typeof INTERNAL_ERROR
  | typeof DATA_FETCH_ERROR
  | typeof ANALYSIS_ERROR
  | typeof AGENT_PROCESSING_ERROR
  | typeof VALIDATION_ERROR
  | typeof RESOURCE_NOT_FOUND
  | typeof AUTHENTICATION_ERROR
  | typeof AUTHORIZATION_ERROR
  | typeof RATE_LIMIT_EXCEEDED
  | typeof BUSINESS_LOGIC_ERROR
  | typeof CONFLICT_ERROR
  | typeof HTTP_ERROR
  | typeof DATA_PROVIDER_ERROR
  | typeof ADMIN_OPERATION_ERROR
  | typeof CONNECTION_ERROR
  | typeof TIMEOUT
  | typeof UNKNOWN_ERROR

// ===== Error Code Helpers =====

/** Set of all valid error codes for runtime validation */
const ALL_ERROR_CODES: Set<string> = new Set([
  INTERNAL_ERROR,
  DATA_FETCH_ERROR,
  ANALYSIS_ERROR,
  AGENT_PROCESSING_ERROR,
  VALIDATION_ERROR,
  RESOURCE_NOT_FOUND,
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  RATE_LIMIT_EXCEEDED,
  BUSINESS_LOGIC_ERROR,
  CONFLICT_ERROR,
  HTTP_ERROR,
  DATA_PROVIDER_ERROR,
  ADMIN_OPERATION_ERROR,
  CONNECTION_ERROR,
  TIMEOUT,
  UNKNOWN_ERROR,
])

/**
 * Type guard: check if a string is a valid ErrorCode
 */
export function isValidErrorCode(code: string): code is ErrorCode {
  return ALL_ERROR_CODES.has(code)
}

/** Retryable error codes (module-level for performance).
 *
 * Note: INTERNAL_ERROR is NOT retryable — it covers permanent errors like bugs,
 * invalid queries, and constraint violations. Transient errors should use
 * DATA_FETCH_ERROR or DATA_PROVIDER_ERROR instead.
 */
const RETRYABLE_CODES: ReadonlySet<string> = new Set([
  DATA_FETCH_ERROR,
  DATA_PROVIDER_ERROR,
  RATE_LIMIT_EXCEEDED,
  CONNECTION_ERROR,
  TIMEOUT,
])

/** Auth error codes (module-level for performance) */
const AUTH_CODES: ReadonlySet<string> = new Set([AUTHENTICATION_ERROR, AUTHORIZATION_ERROR])

/**
 * Check if error code indicates a retryable error
 */
export function isRetryableErrorCode(code: string): boolean {
  return RETRYABLE_CODES.has(code)
}

/**
 * Check if error code indicates a rate limit
 */
export function isRateLimitErrorCode(code: string): boolean {
  return code === RATE_LIMIT_EXCEEDED
}

/**
 * Check if error code indicates an authentication/authorization issue
 */
export function isAuthErrorCode(code: string): boolean {
  return AUTH_CODES.has(code)
}
