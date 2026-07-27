import 'server-only'

import { createAuthenticatedContext } from '@/infrastructure/auth/authenticated-context'
import { createActionError } from '@/infrastructure/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/infrastructure/errors/codes'
import type { CreatePilotWorkItem, PilotWorkItem } from './domain/work-item'
import { createPilotWorkItemsStore } from './server/store'

export type PilotWorkItemsIdentity = {
  role: string
  userId: string
}

export type PilotWorkItemsServer = {
  create(input: CreatePilotWorkItem): Promise<{
    cacheScope: { id: string; userId: string }
    item: PilotWorkItem
  }>
  list(): Promise<PilotWorkItem[]>
}

type PilotWorkItemsStore = {
  create(input: CreatePilotWorkItem): Promise<PilotWorkItem>
  list(): Promise<PilotWorkItem[]>
}

type PilotWorkItemsRuntime = {
  identity: PilotWorkItemsIdentity
  store: PilotWorkItemsStore
}

type PilotWorkItemsServerDependencies = {
  resolveRuntime(): Promise<PilotWorkItemsRuntime>
}

function assertCanManagePilotWorkItems(identity: PilotWorkItemsIdentity): void {
  if (identity.role !== 'admin' && identity.role !== 'owner') {
    throw createActionError(AUTHORIZATION_ERROR, 'pilotWorkItems: insufficient role')
  }
}

export function createPilotWorkItemsServer(
  dependencies: PilotWorkItemsServerDependencies
): PilotWorkItemsServer {
  return {
    async create(input) {
      const runtime = await dependencies.resolveRuntime()
      assertCanManagePilotWorkItems(runtime.identity)
      const item = await runtime.store.create(input)
      return {
        cacheScope: { id: item.id, userId: runtime.identity.userId },
        item,
      }
    },
    async list() {
      const runtime = await dependencies.resolveRuntime()
      assertCanManagePilotWorkItems(runtime.identity)
      return runtime.store.list()
    },
  }
}

export const pilotWorkItemsServer = createPilotWorkItemsServer({
  async resolveRuntime() {
    const context = await createAuthenticatedContext()
    return {
      identity: { role: context.role, userId: context.userId },
      store: createPilotWorkItemsStore(context.supabase, context.userId),
    }
  },
})
