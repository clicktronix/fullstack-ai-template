import 'server-only'

import type { SupabaseServerClient } from '@/adapters/supabase/types'
import type { CreatePilotWorkItem, PilotWorkItem } from './domain/work-item'
import { createPilotWorkItemsStore } from './server/store'

export type PilotWorkItemsContext = {
  role: string
  supabase: SupabaseServerClient
  userId: string
}

export type PilotWorkItemsServer = {
  create(input: CreatePilotWorkItem): Promise<PilotWorkItem>
  list(): Promise<PilotWorkItem[]>
}

function assertCanManagePilotWorkItems(context: PilotWorkItemsContext): void {
  if (context.role !== 'admin' && context.role !== 'owner') {
    throw new Error('Pilot work-items access denied')
  }
}

export function createPilotWorkItemsServer(context: PilotWorkItemsContext): PilotWorkItemsServer {
  assertCanManagePilotWorkItems(context)
  const store = createPilotWorkItemsStore(context.supabase, context.userId)

  return {
    create: (input) => store.create(input),
    list: () => store.list(),
  }
}
