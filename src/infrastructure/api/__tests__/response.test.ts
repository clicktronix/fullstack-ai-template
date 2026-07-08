import { describe, expect, test } from 'bun:test'
import {
  ADMIN_OPERATION_ERROR,
  AGENT_PROCESSING_ERROR,
  ANALYSIS_ERROR,
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  BUSINESS_LOGIC_ERROR,
  CONFLICT_ERROR,
  CONNECTION_ERROR,
  DATA_FETCH_ERROR,
  DATA_PROVIDER_ERROR,
  HTTP_ERROR,
  INTERNAL_ERROR,
  RATE_LIMIT_EXCEEDED,
  RESOURCE_NOT_FOUND,
  TIMEOUT,
  UNKNOWN_ERROR,
  VALIDATION_ERROR,
} from '@/infrastructure/errors/codes'
import { apiErrorWithCode, getStatusForCode } from '../response'

// Regression tests for Codex finding 6: getStatusForCode's switch previously had no case for
// most public ErrorCodes (RATE_LIMIT_EXCEEDED, BUSINESS_LOGIC_ERROR, DATA_PROVIDER_ERROR, ...),
// so they all silently collapsed to the `default: 500` branch — including RATE_LIMIT_EXCEEDED,
// which should be a 429. Every ErrorCode must now have an explicit, intentional mapping.
describe('getStatusForCode', () => {
  test.each([
    [VALIDATION_ERROR, 400],
    [BUSINESS_LOGIC_ERROR, 400],
    [AUTHENTICATION_ERROR, 401],
    [AUTHORIZATION_ERROR, 403],
    [RESOURCE_NOT_FOUND, 404],
    [CONFLICT_ERROR, 409],
    [RATE_LIMIT_EXCEEDED, 429],
    [DATA_FETCH_ERROR, 502],
    [DATA_PROVIDER_ERROR, 502],
    [CONNECTION_ERROR, 502],
    [TIMEOUT, 504],
    [INTERNAL_ERROR, 500],
    [ANALYSIS_ERROR, 500],
    [AGENT_PROCESSING_ERROR, 500],
    [ADMIN_OPERATION_ERROR, 500],
    [HTTP_ERROR, 500],
    [UNKNOWN_ERROR, 500],
  ] as const)('maps %s to %i', (code, expectedStatus) => {
    expect(getStatusForCode(code)).toBe(expectedStatus)
  })
})

// Regression for Codex round-2 non-blocking finding: statuses were mapped for every code but
// getPublicErrorMessage still collapsed the new codes to 'Internal server error' - a 429
// envelope said 'Internal server error'. Message and status must stay coherent per code.
describe('apiErrorWithCode public messages', () => {
  test('returns coherent status + public message for newly mapped codes', async () => {
    const rate = apiErrorWithCode(RATE_LIMIT_EXCEEDED, 'req-1')
    expect(rate.status).toBe(429)
    expect(((await rate.json()) as { error: { message: string } }).error.message).toBe(
      'Too many requests'
    )

    const provider = apiErrorWithCode(DATA_PROVIDER_ERROR, 'req-2')
    expect(provider.status).toBe(502)
    expect(((await provider.json()) as { error: { message: string } }).error.message).toBe(
      'Upstream service unavailable'
    )

    const timeout = apiErrorWithCode(TIMEOUT, 'req-3')
    expect(timeout.status).toBe(504)
    expect(((await timeout.json()) as { error: { message: string } }).error.message).toBe(
      'Upstream request timed out'
    )
  })
})
