import 'server-only'

import { createAuthenticatedContext } from '@/infrastructure/auth/authenticated-context'
import { createActionError } from '@/infrastructure/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/infrastructure/errors/codes'

const REQUEST_ID_HEADER = 'x-request-id'

export type ApiHandlerContext = Awaited<ReturnType<typeof createAuthenticatedContext>> & {
  requestId: string
}

type CreateApiHandlerContextOptions = {
  allowedRoles?: readonly string[]
}

// `getRequestId` is called once by `withRouteErrorHandling` and once more by
// `createApiHandlerContext` for the same incoming `Request`. When the request has no
// `x-request-id` header, each call previously minted its own `crypto.randomUUID()` — so the
// id used in a success response (from the handler context) and the id used in an error
// response / Sentry tag (from withRouteErrorHandling) could disagree. Memoize per-`Request`
// instance so both call sites agree on a single id.
const requestIdCache = new WeakMap<Request, string>()

export function getRequestId(request: Request): string {
  const cached = requestIdCache.get(request)
  if (cached) return cached

  const requestId = request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID()
  requestIdCache.set(request, requestId)
  return requestId
}

export async function createApiHandlerContext(
  request: Request,
  options: CreateApiHandlerContextOptions = {}
): Promise<ApiHandlerContext> {
  const authContext = await createAuthenticatedContext()
  const requestId = getRequestId(request)

  if (
    options.allowedRoles &&
    options.allowedRoles.length > 0 &&
    !options.allowedRoles.includes(authContext.role)
  ) {
    throw createActionError(AUTHORIZATION_ERROR, 'apiHandlerContext: insufficient role')
  }

  return { ...authContext, requestId }
}
