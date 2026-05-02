import { describe, expect, test } from 'bun:test'
import { createActionError } from '@/lib/errors/action-error'
import { UnauthorizedError, createHttpError } from '@/lib/errors/api-error'
import { AUTHENTICATION_ERROR, INTERNAL_ERROR, VALIDATION_ERROR } from '@/lib/errors/codes'
import { actionClient, unwrapSafeActionResult } from '../safe-action'

describe('actionClient error mapping', () => {
  test('maps auth API errors to authentication action errors', async () => {
    const action = actionClient.action(async () => {
      throw new UnauthorizedError('Invalid credentials')
    })

    const result = await action()

    expect(result.serverError).toStartWith(`[${AUTHENTICATION_ERROR}]`)
    expect(() => unwrapSafeActionResult(result)).toThrow(`[${AUTHENTICATION_ERROR}]`)
  })

  test('maps client validation HTTP errors to validation action errors', async () => {
    const action = actionClient.action(async () => {
      throw createHttpError(400, 'Invalid signup input')
    })

    const result = await action()

    expect(result.serverError).toStartWith(`[${VALIDATION_ERROR}]`)
  })

  test('preserves already-coded action errors', async () => {
    const action = actionClient.action(async () => {
      throw createActionError(VALIDATION_ERROR, 'testAction')
    })

    const result = await action()

    expect(result.serverError).toBe(`[${VALIDATION_ERROR}] testAction`)
  })

  test('keeps generic errors internal', async () => {
    const action = actionClient.action(async () => {
      throw new Error('database connection detail')
    })

    const result = await action()

    expect(result.serverError).toBe(`[${INTERNAL_ERROR}] safeAction`)
  })
})
