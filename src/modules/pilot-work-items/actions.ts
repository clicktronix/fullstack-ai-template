'use server'

import { updateTag } from 'next/cache'
import { adminActionClient, unwrapSafeActionResult } from '@/infrastructure/actions/safe-action'
import { cacheTags } from '@/infrastructure/cache/tags'
import {
  CreatePilotWorkItemSchema,
  type CreatePilotWorkItem,
  type PilotWorkItem,
} from './domain/work-item'
import { createPilotWorkItemsServer } from './server'

const safeCreatePilotWorkItemAction = adminActionClient
  .inputSchema(CreatePilotWorkItemSchema)
  .action(async ({ ctx, parsedInput }): Promise<PilotWorkItem> => {
    const item = await createPilotWorkItemsServer(ctx).create(parsedInput)
    updateTag(cacheTags.workItems.user(ctx.userId))
    updateTag(cacheTags.workItems.lists(ctx.userId))
    return item
  })

export async function createPilotWorkItemAction(formData: FormData): Promise<void> {
  const input: CreatePilotWorkItem = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? '') || null,
    priority: formData.get('priority') === 'on',
  }

  unwrapSafeActionResult(await safeCreatePilotWorkItemAction(input))
}
