import 'server-only'

import { createAuthenticatedContext } from '@/infrastructure/auth/authenticated-context'
import { createActionError } from '@/lib/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/lib/errors/codes'

const REQUEST_ID_HEADER = 'x-request-id'

export type ApiHandlerContext = Awaited<ReturnType<typeof createAuthenticatedContext>> & {
  requestId: string
}

type CreateApiHandlerContextOptions = {
  allowedRoles?: readonly string[]
}

export function getRequestId(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID()
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
