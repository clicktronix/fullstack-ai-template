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
 * Prefer `authActionClient` from `src/infrastructure/actions/safe-action.ts`
 * for user-facing Server Actions that accept input. Keep this helper for
 * low-level server-only wrappers and tests.
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
 * Prefer `authActionClient` for user-facing Server Actions that accept input.
 * Use this only for low-level server-only wrappers that need access to userId
 * in addition to the Supabase client.
 *
 * @example
 * ```ts
 * const loadCurrentUserSettings = withAuthContext((ctx) =>
 *   readSettings(ctx.supabase, ctx.userId)
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
 * Verifies that the user does NOT have the 'pending' role.
 * Users with the 'pending' role must not access protected data.
 * The role comes from the cached context, with no additional DB queries.
 */
function assertNotPendingRole(ctx: AuthenticatedContext): void {
  if (ctx.role === 'pending') {
    throw createActionError(AUTHORIZATION_ERROR, 'assertNotPendingRole: account pending approval')
  }
}

/**
 * Verifies that the user can access the admin area.
 * Roles 'admin' and 'owner' are allowed. Pending and all other roles are forbidden.
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
 * Verifies that the user has the 'owner' role.
 * Also checks the pending role for a consistent error message.
 * The role comes from the cached context, with no additional DB queries.
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
 *
 * Prefer `adminActionClient` for user-facing Server Actions that accept input.
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
 *
 * Prefer `adminActionClient` for user-facing Server Actions that accept input.
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
