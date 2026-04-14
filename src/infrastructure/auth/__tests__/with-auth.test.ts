import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { AUTHORIZATION_ERROR, INTERNAL_ERROR } from '@/lib/errors/codes'

const mockCreateAuthenticatedContext = mock()

mock.module('../authenticated-context', () => ({
  createAuthenticatedContext: mockCreateAuthenticatedContext,
}))

// НЕ мокаем @/lib/errors/action-error — используем реальный модуль.
// mock.module в Bun загрязняет глобальный кеш модулей и ломает
// параллельные тесты в action-error.test.ts и presentation.test.ts.
// Реальный handleActionError работает корректно — Sentry.captureException
// является no-op без инициализированного SDK.

const { withAuth, withOwnerAuth, withAuthContext, withOwnerAuthContext } =
  await import('../with-auth')

/**
 * Создаёт мок контекста с указанной ролью.
 * Роль теперь часть AuthenticatedContext — DB-запрос не нужен.
 */
function createMockContext(role: string) {
  const supabase = { from: mock() }
  return { supabase, userId: `user-${role}`, role }
}

beforeEach(() => {
  mockCreateAuthenticatedContext.mockReset()
})

describe('withAuth', () => {
  test('passes supabase and args to wrapped function', async () => {
    const ctx = createMockContext('owner')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async (_supabase: unknown, id: string) => ({ ok: id }))
    const wrapped = withAuth(fn)

    const result = await wrapped('campaign-1')

    expect(result).toEqual({ ok: 'campaign-1' })
    expect(fn).toHaveBeenCalledWith(ctx.supabase, 'campaign-1')
  })

  test('rethrows coded errors as-is', async () => {
    const ctx = createMockContext('owner')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => {
      throw new Error(`[${INTERNAL_ERROR}] from-inner`)
    })
    const wrapped = withAuth(fn)

    await expect(wrapped()).rejects.toThrow(`[${INTERNAL_ERROR}] from-inner`)
  })

  test('delegates uncoded errors to handleActionError', async () => {
    const ctx = createMockContext('owner')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => {
      throw new Error('plain failure')
    })
    const wrapped = withAuth(fn)

    // Реальный handleActionError конвертирует generic Error → [INTERNAL_ERROR] withAuth
    await expect(wrapped()).rejects.toThrow('[INTERNAL_ERROR] withAuth')
  })
})

describe('withOwnerAuth', () => {
  test('allows execution for owner user', async () => {
    const ctx = createMockContext('owner')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withOwnerAuth(fn)
    const result = await wrapped()

    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('throws coded AUTHORIZATION_ERROR for non-owner', async () => {
    const ctx = createMockContext('admin')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withOwnerAuth(fn)

    await expect(wrapped()).rejects.toThrow(`[${AUTHORIZATION_ERROR}] assertOwnerRole: not owner`)
    expect(fn).not.toHaveBeenCalled()
  })

  test('blocks pending users before owner check', async () => {
    const ctx = createMockContext('pending')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withOwnerAuth(fn)

    await expect(wrapped()).rejects.toThrow(
      `[${AUTHORIZATION_ERROR}] assertNotPendingRole: account pending approval`
    )
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('withAuth — pending role', () => {
  test('blocks pending users with AUTHORIZATION_ERROR', async () => {
    const ctx = createMockContext('pending')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withAuth(fn)

    await expect(wrapped()).rejects.toThrow(
      `[${AUTHORIZATION_ERROR}] assertNotPendingRole: account pending approval`
    )
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('withAuthContext', () => {
  test('passes full context to wrapped function', async () => {
    const ctx = createMockContext('admin')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async (receivedCtx: unknown, id: string) => ({ ctx: receivedCtx, id }))
    const wrapped = withAuthContext(fn)

    const result = await wrapped('item-1')

    expect(result).toEqual({ ctx, id: 'item-1' })
    expect(fn).toHaveBeenCalledWith(ctx, 'item-1')
  })

  test('blocks pending users', async () => {
    const ctx = createMockContext('pending')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withAuthContext(fn)

    await expect(wrapped()).rejects.toThrow(
      `[${AUTHORIZATION_ERROR}] assertNotPendingRole: account pending approval`
    )
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('withOwnerAuthContext', () => {
  test('passes full context for owner', async () => {
    const ctx = createMockContext('owner')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async (receivedCtx: unknown) => ({ ctx: receivedCtx }))
    const wrapped = withOwnerAuthContext(fn)

    const result = await wrapped()

    expect(result).toEqual({ ctx })
  })

  test('blocks non-owner users', async () => {
    const ctx = createMockContext('admin')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withOwnerAuthContext(fn)

    await expect(wrapped()).rejects.toThrow(`[${AUTHORIZATION_ERROR}] assertOwnerRole: not owner`)
    expect(fn).not.toHaveBeenCalled()
  })

  test('blocks pending users before owner check', async () => {
    const ctx = createMockContext('pending')
    mockCreateAuthenticatedContext.mockResolvedValueOnce(ctx)

    const fn = mock(async () => 'ok')
    const wrapped = withOwnerAuthContext(fn)

    await expect(wrapped()).rejects.toThrow(
      `[${AUTHORIZATION_ERROR}] assertNotPendingRole: account pending approval`
    )
    expect(fn).not.toHaveBeenCalled()
  })
})
