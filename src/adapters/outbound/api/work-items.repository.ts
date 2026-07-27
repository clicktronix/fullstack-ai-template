import 'server-only'

import { array, number, object, parse } from 'valibot'
import {
  WorkItemSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
} from '@/domain/work-item/work-item'
import { getServerEnv } from '@/infrastructure/env/server'
import { createHttpError } from '@/infrastructure/errors/api-error'
import type { WorkItemsRepository } from '@/use-cases/work-items/ports'
import type { WorkItemListParams } from '@/use-cases/work-items/types'

const WorkItemPageSchema = object({
  items: array(WorkItemSchema),
  total: number(),
  page: number(),
  pageSize: number(),
})

type HttpFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

type HttpWorkItemsRepositoryOptions = {
  baseUrl?: string
  userId: string
  fetcher?: HttpFetcher
}

function listQuery(params: WorkItemListParams): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  return query.size > 0 ? `?${query}` : ''
}

export function createHttpWorkItemsRepository({
  baseUrl = getServerEnv().WORK_ITEMS_API_URL,
  userId,
  fetcher = fetch,
}: HttpWorkItemsRepositoryOptions): WorkItemsRepository {
  if (!baseUrl) throw new Error('WORK_ITEMS_API_URL is required')

  async function request(path: string, init?: RequestInit): Promise<unknown> {
    const response = await fetcher(new URL(path, baseUrl), {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-user-id': userId,
        ...init?.headers,
      },
    })
    if (!response.ok) {
      throw createHttpError(response.status, `Work-items API failed with ${response.status}`)
    }
    return response.json()
  }

  return {
    async list(params) {
      return parse(WorkItemPageSchema, await request(`/work-items${listQuery(params)}`))
    },
    async getById(id) {
      return parse(WorkItemSchema, await request(`/work-items/${encodeURIComponent(id)}`))
    },
    async create(input: CreateWorkItem) {
      return parse(
        WorkItemSchema,
        await request('/work-items', { method: 'POST', body: JSON.stringify(input) })
      )
    },
    async update(id: string, input: UpdateWorkItem) {
      return parse(
        WorkItemSchema,
        await request(`/work-items/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(input),
        })
      )
    },
    async archive(id) {
      return parse(
        WorkItemSchema,
        await request(`/work-items/${encodeURIComponent(id)}/archive`, { method: 'POST' })
      )
    },
    async restore(id) {
      return parse(
        WorkItemSchema,
        await request(`/work-items/${encodeURIComponent(id)}/restore`, { method: 'POST' })
      )
    },
  }
}
