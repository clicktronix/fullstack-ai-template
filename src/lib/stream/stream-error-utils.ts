/**
 * Stream Error Utilities
 *
 * Утилиты для обработки ошибок SSE streaming с поддержкой reconnect логики.
 */

/**
 * Константы для reconnect логики
 */
export const STREAM_RECONNECT_CONFIG = {
  MAX_ATTEMPTS: 3,
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 10_000,
  RATE_LIMIT_DELAY_MS: 60_000,
} as const

/**
 * Паттерны ошибок, которые не стоит повторять.
 * HTTP коды и специфичные сообщения об ошибках аутентификации/авторизации.
 */
const NON_RETRIABLE_PATTERNS = ['400', '401', '403', '404', '500', 'Session expired'] as const

/**
 * Вычисляет задержку перед переподключением с exponential backoff.
 *
 * @param attempt - номер попытки (0-based)
 * @param isRateLimit - true если ошибка rate limit
 * @returns задержка в миллисекундах
 *
 * @example
 * getReconnectDelay(0) // 1000ms
 * getReconnectDelay(1) // 2000ms
 * getReconnectDelay(2) // 4000ms
 * getReconnectDelay(3) // 8000ms (capped at MAX_DELAY_MS=10000)
 * getReconnectDelay(0, true) // 60000ms (rate limit)
 */
export function getReconnectDelay(attempt: number, isRateLimit = false): number {
  if (isRateLimit) {
    return STREAM_RECONNECT_CONFIG.RATE_LIMIT_DELAY_MS
  }
  const delay = STREAM_RECONNECT_CONFIG.BASE_DELAY_MS * Math.pow(2, attempt)
  return Math.min(delay, STREAM_RECONNECT_CONFIG.MAX_DELAY_MS)
}

/**
 * Проверяет, является ли ошибка неисправимой (не стоит retry).
 *
 * Неисправимые ошибки:
 * - HTTP 400 Bad Request
 * - HTTP 401 Unauthorized
 * - HTTP 403 Forbidden
 * - HTTP 404 Not Found
 * - HTTP 500 Internal Server Error
 * - Session expired
 *
 * @param error - ошибка для проверки
 * @returns true если ошибка неисправимая
 */
export function isNonRetriableError(error: Error): boolean {
  const message = error.message
  return NON_RETRIABLE_PATTERNS.some((pattern) => message.includes(pattern))
}

/**
 * Проверяет, является ли сообщение об ошибке неисправимым.
 *
 * @param message - сообщение об ошибке
 * @returns true если ошибка неисправимая
 */
export function isNonRetriableErrorMessage(message: string): boolean {
  return NON_RETRIABLE_PATTERNS.some((pattern) => message.includes(pattern))
}

/**
 * Проверяет, является ли ошибка rate limit.
 *
 * @param error - ошибка для проверки
 * @returns true если это rate limit ошибка
 */
export function isRateLimitError(error: Error): boolean {
  return error.message.toLowerCase().includes('rate limit')
}
