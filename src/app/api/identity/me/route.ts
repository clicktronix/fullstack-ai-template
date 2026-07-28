import { readCurrentUser } from '@/modules/identity/server'
import { getRequestId } from '@/shared/server/api/context'
import { apiJson } from '@/shared/server/api/response'
import { withRouteErrorHandling } from '@/shared/server/api/with-route-error-handling'
import { createClient } from '@/shared/server/supabase/server'

export type IdentityRouteDependencies = {
  readCurrentUser: () => ReturnType<typeof readCurrentUser>
}

const defaultDependencies: IdentityRouteDependencies = {
  readCurrentUser: async () => readCurrentUser({ supabase: await createClient() }),
}

export function createIdentityRouteHandler(overrides: Partial<IdentityRouteDependencies> = {}) {
  const dependencies: IdentityRouteDependencies = { ...defaultDependencies, ...overrides }

  return withRouteErrorHandling('identity-me', async (request: Request) => {
    const user = await dependencies.readCurrentUser()
    return apiJson(user, getRequestId(request))
  })
}

export const GET = createIdentityRouteHandler()
