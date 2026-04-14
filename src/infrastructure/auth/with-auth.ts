import { createActionError, extractErrorCode, handleActionError } from '@/lib/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/lib/errors/codes'
import { createAuthenticatedContext, type AuthenticatedContext } from './authenticated-context'

/**
 * Re-throws already-coded errors without double Sentry reporting.
 * Codes uncoded errors via handleActionError.
 */
function handleWrappedError(error: unknown, wrapperName: string): never {
  // Already coded errors (from inner handleActionError/createActionError) — re-throw as-is
  if (error instanceof Error && extractErrorCode(error.message)) {
    throw error
  }
  handleActionError(error, wrapperName)
}

/**
 * Higher-order function that wraps an async function with authentication.
 * Automatically creates authenticated context and passes supabase client.
 * Catches uncoded errors from adapters and encodes them with error codes.
 *
 * @example
 * ```ts
 * // Simple action
 * export const listLabelsAction = withAuth(listLabels)
 *
 * // Action with arguments
 * export const archiveWorkItemAction = withAuth(archiveWorkItem)
 * // Called as: archiveWorkItemAction(id)
 * ```
 */
export function withAuth<TArgs extends unknown[], TResult>(
  fn: (supabase: AuthenticatedContext['supabase'], ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const ctx = await createAuthenticatedContext()
      assertNotPendingRole(ctx)
      return await fn(ctx.supabase, ...args)
    } catch (error) {
      handleWrappedError(error, 'withAuth')
    }
  }
}

/**
 * Higher-order function that wraps an async function with authentication
 * and passes the full context (supabase + userId).
 *
 * Use this when you need access to userId in addition to supabase client.
 *
 * @example
 * ```ts
 * export const createWorkItemAction = withAuthContext(
 *   (ctx, input) => createWorkItem(ctx.supabase, ctx.userId, input)
 * )
 * ```
 */
export function withAuthContext<TArgs extends unknown[], TResult>(
  fn: (ctx: AuthenticatedContext, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const ctx = await createAuthenticatedContext()
      assertNotPendingRole(ctx)
      return await fn(ctx, ...args)
    } catch (error) {
      handleWrappedError(error, 'withAuthContext')
    }
  }
}

/**
 * Проверяет, что пользователь НЕ имеет роль 'pending'.
 * Пользователи с ролью 'pending' не должны иметь доступ к защищённым данным.
 * Роль берётся из кэшированного контекста — без дополнительных DB-запросов.
 */
function assertNotPendingRole(ctx: AuthenticatedContext): void {
  if (ctx.role === 'pending') {
    throw createActionError(AUTHORIZATION_ERROR, 'assertNotPendingRole: account pending approval')
  }
}

/**
 * Проверяет, что пользователь имеет доступ к admin-разделу.
 * Разрешены роли 'admin' и 'owner'. Pending и любые другие роли запрещены.
 */
function assertAdminRole(ctx: AuthenticatedContext): void {
  if (ctx.role === 'pending') {
    throw createActionError(AUTHORIZATION_ERROR, 'assertNotPendingRole: account pending approval')
  }
  if (ctx.role !== 'admin' && ctx.role !== 'owner') {
    throw createActionError(AUTHORIZATION_ERROR, 'assertAdminRole: insufficient role')
  }
}

/**
 * Проверяет, что пользователь имеет роль 'owner'.
 * Также проверяет pending-роль для единообразного сообщения об ошибке.
 * Роль берётся из кэшированного контекста — без дополнительных DB-запросов.
 */
function assertOwnerRole(ctx: AuthenticatedContext): void {
  if (ctx.role === 'pending') {
    throw createActionError(AUTHORIZATION_ERROR, 'assertNotPendingRole: account pending approval')
  }
  if (ctx.role !== 'owner') {
    throw createActionError(AUTHORIZATION_ERROR, 'assertOwnerRole: not owner')
  }
}

/**
 * Higher-order function that wraps an async function with owner-only access control.
 * Verifies that current user has 'owner' role before executing.
 * Catches uncoded errors from adapters and encodes them with error codes.
 *
 */
export function withOwnerAuth<TArgs extends unknown[], TResult>(
  fn: (supabase: AuthenticatedContext['supabase'], ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const ctx = await createAuthenticatedContext()
      assertOwnerRole(ctx)
      return await fn(ctx.supabase, ...args)
    } catch (error) {
      handleWrappedError(error, 'withOwnerAuth')
    }
  }
}

/**
 * Higher-order function that wraps an async function with admin access control.
 * Verifies that current user has 'admin' or 'owner' role before executing.
 */
export function withAdminAuth<TArgs extends unknown[], TResult>(
  fn: (supabase: AuthenticatedContext['supabase'], ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const ctx = await createAuthenticatedContext()
      assertAdminRole(ctx)
      return await fn(ctx.supabase, ...args)
    } catch (error) {
      handleWrappedError(error, 'withAdminAuth')
    }
  }
}

/**
 * Higher-order function that wraps an async function with owner-only access control
 * and passes the full context (supabase + userId).
 *
 * Use this when you need access to userId in addition to supabase client for owner-only actions.
 *
 * @example
 * ```ts
 * export const createThreadAction = withOwnerAuthContext(
 *   (ctx, input) => createThread(ctx.supabase, ctx.userId, input)
 * )
 * ```
 */
export function withOwnerAuthContext<TArgs extends unknown[], TResult>(
  fn: (ctx: AuthenticatedContext, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const ctx = await createAuthenticatedContext()
      assertOwnerRole(ctx)
      return await fn(ctx, ...args)
    } catch (error) {
      handleWrappedError(error, 'withOwnerAuthContext')
    }
  }
}

/**
 * Higher-order function that wraps an async function with admin access control
 * and passes the full context (supabase + userId).
 */
export function withAdminAuthContext<TArgs extends unknown[], TResult>(
  fn: (ctx: AuthenticatedContext, ...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const ctx = await createAuthenticatedContext()
      assertAdminRole(ctx)
      return await fn(ctx, ...args)
    } catch (error) {
      handleWrappedError(error, 'withAdminAuthContext')
    }
  }
}
