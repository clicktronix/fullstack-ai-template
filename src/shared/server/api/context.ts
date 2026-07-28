import 'server-only'

import { createAuthenticatedContext } from '@/shared/server/auth/authenticated-context'

const REQUEST_ID_HEADER = 'x-request-id'

export type ApiHandlerContext = Awaited<ReturnType<typeof createAuthenticatedContext>> & {
  requestId: string
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
  authenticate: typeof createAuthenticatedContext = createAuthenticatedContext
): Promise<ApiHandlerContext> {
  const authContext = await authenticate()
  const requestId = getRequestId(request)
  return { ...authContext, requestId }
}
