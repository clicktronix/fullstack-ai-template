'use server'

import { revalidateTag, updateTag } from 'next/cache'
import { actionClient, unwrapSafeActionResult } from '@/infrastructure/actions/safe-action'
import { cacheTags } from '@/infrastructure/cache/tags'
import {
  CreatePilotWorkItemSchema,
  type CreatePilotWorkItem,
  type PilotWorkItem,
} from './domain/work-item'
import { pilotWorkItemsServer } from './server'

const safeCreatePilotWorkItemAction = actionClient
  .inputSchema(CreatePilotWorkItemSchema)
  .action(async ({ parsedInput }): Promise<PilotWorkItem> => {
    const result = await pilotWorkItemsServer.create(parsedInput)
    updateTag(cacheTags.workItems.user(result.cacheScope.userId))
    updateTag(cacheTags.workItems.lists(result.cacheScope.userId))
    updateTag(cacheTags.workItems.detail(result.cacheScope.userId, result.cacheScope.id))
    revalidateTag(cacheTags.workItems.all, 'minutes')
    return result.item
  })

export async function createPilotWorkItemAction(formData: FormData): Promise<void> {
  const input: CreatePilotWorkItem = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? '') || null,
    priority: formData.get('priority') === 'on',
  }

  unwrapSafeActionResult(await safeCreatePilotWorkItemAction(input))
}
