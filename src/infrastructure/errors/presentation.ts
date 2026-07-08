import type { MessageDescriptor } from 'react-intl'
import { extractErrorCode } from './action-error'
import {
  type ApiError,
  ForbiddenError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  ServerError,
  UnauthorizedError,
  ValidationError,
  getErrorCode,
  isApiError,
  isRateLimitErrorCode,
  isRetryableErrorCode,
} from './api-error'
import messages from './presentation.messages.json'

export type ErrorKind =
  | 'network'
  | 'rate_limit'
  | 'auth'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'server'
  | 'unknown'

export type ErrorPresentation = {
  /** Pre-formatted title string (English default, for logging) */
  title: string
  /** Pre-formatted message string (English default, for logging) */
  message: string
  /** Message descriptor for translatable title */
  titleDescriptor: MessageDescriptor
  /** Message descriptor for translatable message */
  messageDescriptor: MessageDescriptor
  /** Values for message interpolation (e.g., {seconds} for rate limits) */
  messageValues?: Record<string, string | number>
  /** Error category for UI styling */
  kind: ErrorKind
  /** Whether retry button should be shown */
  showRetry: boolean
  /** Seconds to wait before retry (rate limits) */
  retryAfterSeconds?: number
  /** Backend error code if available */
  code?: string
}

type ErrorConfig = {
  titleDescriptor: MessageDescriptor
  messageDescriptor: MessageDescriptor
  kind: ErrorKind
  showRetry: boolean
}

/** Static error configurations for known error types */
const ERROR_CONFIGS: Record<string, ErrorConfig> = {
  network: {
    titleDescriptor: messages.networkTitle,
    messageDescriptor: messages.networkMessage,
    kind: 'network',
    showRetry: true,
  },
  unauthorized: {
    titleDescriptor: messages.authTitle,
    messageDescriptor: messages.authMessage,
    kind: 'auth',
    showRetry: false,
  },
  forbidden: {
    titleDescriptor: messages.forbiddenTitle,
    messageDescriptor: messages.forbiddenMessage,
    kind: 'forbidden',
    showRetry: false,
  },
  notFound: {
    titleDescriptor: messages.notFoundTitle,
    messageDescriptor: messages.notFoundMessage,
    kind: 'not_found',
    showRetry: false,
  },
  validation: {
    titleDescriptor: messages.validationTitle,
    messageDescriptor: messages.validationMessage,
    kind: 'validation',
    showRetry: false,
  },
  server: {
    titleDescriptor: messages.serverTitle,
    messageDescriptor: messages.serverMessage,
    kind: 'server',
    showRetry: true,
  },
  rateLimit: {
    titleDescriptor: messages.rateLimitTitle,
    messageDescriptor: messages.rateLimitMessage,
    kind: 'rate_limit',
    showRetry: true,
  },
  unknown: {
    titleDescriptor: messages.unknownTitle,
    messageDescriptor: messages.unknownMessage,
    kind: 'unknown',
    showRetry: true,
  },
}

/** Map backend error codes to title descriptors */
const CODE_TO_TITLE: Record<string, MessageDescriptor> = {
  AUTHENTICATION_ERROR: messages.authTitle,
  AUTHORIZATION_ERROR: messages.forbiddenTitle,
  RATE_LIMIT_EXCEEDED: messages.rateLimitTitle,
  VALIDATION_ERROR: messages.validationTitle,
  RESOURCE_NOT_FOUND: messages.notFoundTitle,
  DATA_FETCH_ERROR: messages.temporaryTitle,
  DATA_PROVIDER_ERROR: messages.temporaryTitle,
  ANALYSIS_ERROR: messages.requestFailedTitle,
  AGENT_PROCESSING_ERROR: messages.requestFailedTitle,
  INTERNAL_ERROR: messages.serverTitle,
  BUSINESS_LOGIC_ERROR: messages.validationTitle,
  CONFLICT_ERROR: messages.requestFailedTitle,
  HTTP_ERROR: messages.requestFailedTitle,
  ADMIN_OPERATION_ERROR: messages.requestFailedTitle,
  CONNECTION_ERROR: messages.networkTitle,
  TIMEOUT: messages.networkTitle,
  UNKNOWN_ERROR: messages.unknownTitle,
}

/** Map backend error codes to message descriptors */
const CODE_TO_MESSAGE: Record<string, MessageDescriptor> = {
  AUTHENTICATION_ERROR: messages.authMessage,
  AUTHORIZATION_ERROR: messages.forbiddenMessage,
  RATE_LIMIT_EXCEEDED: messages.rateLimitMessage,
  VALIDATION_ERROR: messages.validationMessage,
  RESOURCE_NOT_FOUND: messages.notFoundMessage,
  DATA_FETCH_ERROR: messages.networkMessage,
  DATA_PROVIDER_ERROR: messages.networkMessage,
  ANALYSIS_ERROR: messages.requestFailedMessage,
  AGENT_PROCESSING_ERROR: messages.requestFailedMessage,
  INTERNAL_ERROR: messages.serverMessage,
  BUSINESS_LOGIC_ERROR: messages.validationMessage,
  CONFLICT_ERROR: messages.requestFailedMessage,
  HTTP_ERROR: messages.requestFailedMessage,
  ADMIN_OPERATION_ERROR: messages.requestFailedMessage,
  CONNECTION_ERROR: messages.networkMessage,
  TIMEOUT: messages.networkMessage,
  UNKNOWN_ERROR: messages.unknownMessage,
}

/** Build presentation from config */
function buildPresentation(
  config: ErrorConfig,
  overrides?: Partial<ErrorPresentation>
): ErrorPresentation {
  return {
    title: String(config.titleDescriptor.defaultMessage),
    message: String(config.messageDescriptor.defaultMessage),
    titleDescriptor: config.titleDescriptor,
    messageDescriptor: config.messageDescriptor,
    kind: config.kind,
    showRetry: config.showRetry,
    ...overrides,
  }
}

/** Get error kind from backend error code */
function getKindFromCode(code: string): ErrorKind {
  if (code === 'AUTHENTICATION_ERROR') return 'auth'
  if (code === 'AUTHORIZATION_ERROR') return 'forbidden'
  if (isRateLimitErrorCode(code)) return 'rate_limit'
  if (code === 'VALIDATION_ERROR') return 'validation'
  if (code === 'RESOURCE_NOT_FOUND') return 'not_found'
  if (code === 'INTERNAL_ERROR') return 'server'
  return 'unknown'
}

/** Handle strongly-typed error instances */
function presentTypedError(error: Error): ErrorPresentation | null {
  if (error instanceof NetworkError) {
    return buildPresentation(ERROR_CONFIGS.network)
  }

  if (error instanceof RateLimitError) {
    const retrySeconds = Math.max(0, error.retryAfter)
    return buildPresentation(ERROR_CONFIGS.rateLimit, {
      message: messages.rateLimitMessage.defaultMessage.replace('{seconds}', String(retrySeconds)),
      messageValues: { seconds: retrySeconds },
      retryAfterSeconds: retrySeconds,
      code: error.details.errorCode,
    })
  }

  if (error instanceof UnauthorizedError) {
    return buildPresentation(ERROR_CONFIGS.unauthorized, { code: error.details.errorCode })
  }

  if (error instanceof ForbiddenError) {
    return buildPresentation(ERROR_CONFIGS.forbidden, { code: error.details.errorCode })
  }

  if (error instanceof NotFoundError) {
    return buildPresentation(ERROR_CONFIGS.notFound, { code: error.details.errorCode })
  }

  if (error instanceof ValidationError) {
    return buildPresentation(ERROR_CONFIGS.validation, {
      message: error.message || String(messages.validationMessage.defaultMessage),
    })
  }

  if (error instanceof ServerError) {
    return buildPresentation(ERROR_CONFIGS.server, { code: error.details.errorCode })
  }

  return null
}

/** Handle ApiError with backend error codes */
function presentApiError(error: ApiError): ErrorPresentation {
  const code = getErrorCode(error)

  if (code) {
    const titleDescriptor = CODE_TO_TITLE[code] ?? messages.requestFailedTitle
    const messageDescriptor = CODE_TO_MESSAGE[code] ?? messages.requestFailedMessage

    return {
      title: String(titleDescriptor.defaultMessage ?? 'Request Failed'),
      message: error.message ?? String(messageDescriptor.defaultMessage),
      titleDescriptor,
      messageDescriptor,
      kind: getKindFromCode(code),
      showRetry: isRetryableErrorCode(code) || error.isRetryable(),
      code,
    }
  }

  return {
    title: String(messages.requestFailedTitle.defaultMessage),
    message: error.message || String(messages.requestFailedMessage.defaultMessage),
    titleDescriptor: messages.requestFailedTitle,
    messageDescriptor: messages.requestFailedMessage,
    kind: 'unknown',
    showRetry: error.isRetryable(),
  }
}

/**
 * Convert any error into a user-friendly presentation.
 * Provides titles, messages, and metadata for UI display.
 */
export function presentError(error: unknown): ErrorPresentation {
  // No error - return default
  if (!error) {
    return buildPresentation(ERROR_CONFIGS.unknown)
  }

  // Try [CODE] format from server actions first
  if (error instanceof Error) {
    const codeFromMessage = extractErrorCode(error.message)
    if (codeFromMessage) {
      const titleDescriptor = CODE_TO_TITLE[codeFromMessage] ?? messages.requestFailedTitle
      const messageDescriptor = CODE_TO_MESSAGE[codeFromMessage] ?? messages.requestFailedMessage
      return buildPresentation(
        {
          titleDescriptor,
          messageDescriptor,
          kind: getKindFromCode(codeFromMessage),
          showRetry: isRetryableErrorCode(codeFromMessage),
        },
        { code: codeFromMessage }
      )
    }
  }

  // Try strongly-typed errors
  if (error instanceof Error) {
    const typed = presentTypedError(error)
    if (typed) return typed
  }

  // Handle ApiError with backend codes
  if (isApiError(error)) {
    return presentApiError(error)
  }

  // Fallback for unknown errors: never expose raw internal error messages to UI
  return {
    title: String(messages.unexpectedTitle.defaultMessage),
    message: String(messages.unknownMessage.defaultMessage),
    titleDescriptor: messages.unexpectedTitle,
    messageDescriptor: messages.unknownMessage,
    kind: 'unknown',
    showRetry: true,
  }
}

export function getUserFacingErrorMessage(error: unknown): string {
  return presentError(error).message
}

export function getUserFacingErrorTitle(error: unknown): string {
  return presentError(error).title
}
