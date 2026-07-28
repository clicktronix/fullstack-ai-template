import { isValidErrorCode, type ErrorCode } from './codes'

export function createActionError(code: ErrorCode, context: string): Error {
  return new Error(`[${code}] ${context}`)
}

export function extractErrorCode(message: string): ErrorCode | null {
  const match = message.match(/^\[([A-Z_]+)\]/)
  if (!match) return null
  return isValidErrorCode(match[1]) ? match[1] : null
}

const CAPTURED_ACTION_CONTEXT_SUFFIX = ':captured'

export function withCapturedActionContext(context: string): string {
  return `${context}${CAPTURED_ACTION_CONTEXT_SUFFIX}`
}

export function isAlreadyCapturedActionErrorMessage(message: string): boolean {
  return message.endsWith(CAPTURED_ACTION_CONTEXT_SUFFIX)
}
