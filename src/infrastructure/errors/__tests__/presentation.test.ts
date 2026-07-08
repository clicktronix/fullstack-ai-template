import { describe, expect, test } from 'bun:test'
import { createActionError } from '../action-error'
import {
  AUTHENTICATION_ERROR,
  AUTHORIZATION_ERROR,
  INTERNAL_ERROR,
  VALIDATION_ERROR,
} from '../codes'
import { presentError } from '../presentation'

describe('presentError with [CODE] format', () => {
  test('resolves VALIDATION_ERROR to validation kind', () => {
    const error = createActionError(VALIDATION_ERROR, 'createBlogAction')
    const presentation = presentError(error)

    expect(presentation.kind).toBe('validation')
    expect(presentation.code).toBe('VALIDATION_ERROR')
    expect(presentation.showRetry).toBe(false)
    expect(presentation.titleDescriptor.id).toBe('error.validation.title')
    expect(presentation.messageDescriptor.id).toBe('error.validation.message')
  })

  test('resolves INTERNAL_ERROR to server kind without retry (permanent error)', () => {
    const error = createActionError(INTERNAL_ERROR, 'test')
    const presentation = presentError(error)

    expect(presentation.kind).toBe('server')
    expect(presentation.code).toBe('INTERNAL_ERROR')
    expect(presentation.showRetry).toBe(false)
    expect(presentation.titleDescriptor.id).toBe('error.server.title')
    expect(presentation.messageDescriptor.id).toBe('error.server.message')
  })

  test('resolves AUTHENTICATION_ERROR to auth kind', () => {
    const error = createActionError(AUTHENTICATION_ERROR, 'login')
    const presentation = presentError(error)

    expect(presentation.kind).toBe('auth')
    expect(presentation.code).toBe('AUTHENTICATION_ERROR')
    expect(presentation.titleDescriptor.id).toBe('error.auth.title')
    expect(presentation.messageDescriptor.id).toBe('error.auth.message')
  })

  test('resolves AUTHORIZATION_ERROR to forbidden kind', () => {
    const error = createActionError(AUTHORIZATION_ERROR, 'assertOwnerRole')
    const presentation = presentError(error)

    expect(presentation.kind).toBe('forbidden')
    expect(presentation.code).toBe('AUTHORIZATION_ERROR')
    expect(presentation.titleDescriptor.id).toBe('error.forbidden.title')
    expect(presentation.messageDescriptor.id).toBe('error.forbidden.message')
  })

  test('treats invalid codes as regular errors', () => {
    const error = new Error('[BANANA_CODE] test')
    const presentation = presentError(error)

    // extractErrorCode now validates against known codes, so this is treated as a regular error
    expect(presentation.code).toBeUndefined()
    expect(presentation.kind).toBe('unknown')
  })

  test('handles regular Error without code', () => {
    const error = new Error('Something went wrong')
    const presentation = presentError(error)

    expect(presentation.code).toBeUndefined()
    expect(presentation.kind).toBe('unknown')
  })

  test('handles null/undefined error', () => {
    const presentation = presentError(null)

    expect(presentation.kind).toBe('unknown')
    expect(presentation.titleDescriptor.id).toBe('error.unknown.title')
  })
})
