import 'server-only'

import { createAuthenticatedContext } from '@/infrastructure/auth/authenticated-context'
import { createPilotWorkItemsServer } from './server'

export async function readPilotWorkItemsForRsc() {
  const context = await createAuthenticatedContext()
  return createPilotWorkItemsServer(context).list()
}
