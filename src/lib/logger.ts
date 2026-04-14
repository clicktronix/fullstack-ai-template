import { isDevelopment } from './api-config'
import { isApiError } from './errors/api-error'

/**
 * Conditional logger that only logs in development.
 * Prevents log spam in production.
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args)
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Log API error with structured data.
   * Always logs to console, can be extended to send to error tracking service.
   *
   * @param context - Context where error occurred (e.g., 'UserAPI.getUser')
   * @param error - The error to log
   * @param metadata - Additional metadata
   */
  apiError: (context: string, error: unknown, metadata?: Record<string, unknown>) => {
    if (!isApiError(error)) {
      console.error(`[${context}] Non-API Error:`, error)
      return
    }

    const structured = {
      context,
      timestamp: new Date().toISOString(),
      error: error.toJSON(),
      metadata,
      retryable: error.isRetryable(),
      status: error.getStatus(),
    }

    // Console output with colors (dev only)
    if (isDevelopment) {
      console.group(`🔴 API Error in ${context}`)
      console.error('Message:', error.message)
      console.error('Status:', error.getStatus() ?? 'N/A')
      console.error('Retryable:', error.isRetryable())
      console.error('Details:', error.details)
      if (metadata) {
        console.error('Metadata:', metadata)
      }
      console.groupEnd()
    } else {
      // Production: compact JSON log
      console.error('[API Error]', JSON.stringify(structured))
    }

    // Here you can add integration with error tracking service:
    // - Sentry.captureException(error, { contexts: { api: structured } })
    // - LogRocket.captureException(error)
    // - Custom analytics endpoint
  },

  /**
   * Log successful API request (dev only for debugging)
   */
  apiSuccess: (context: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(`✅ [${context}]`, data || 'Success')
    }
  },
}
