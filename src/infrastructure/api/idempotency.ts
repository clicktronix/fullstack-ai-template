import 'server-only'

import { createHash } from 'node:crypto'
import type { Json } from '@/adapters/supabase/types'
import { createActionError } from '@/lib/errors/action-error'
import { CONFLICT_ERROR, VALIDATION_ERROR } from '@/lib/errors/codes'
import type { ApiHandlerContext } from './context'

type IdempotencyRow = {
  key: string
  user_id: string
  method: string
  path: string
  request_hash: string
  status_code: number | null
  response_body: Json | null
}

type RunIdempotentCommandOptions<TData extends Json> = {
  context: ApiHandlerContext
  key: string
  method: string
  path: string
  requestBody: unknown
  statusCode: number
  command: () => Promise<TData>
}

type RunIdempotentCommandResult<TData extends Json> = {
  data: TData
  replayed: boolean
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`)
      .join(',')}}`
  }

  return JSON.stringify(value) ?? 'null'
}

function hashRequestBody(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex')
}

function assertValidIdempotencyKey(key: string): void {
  if (key.trim().length === 0 || key.length > 160) {
    throw createActionError(VALIDATION_ERROR, 'idempotency: invalid key')
  }
}

function replayExistingRow<TData extends Json>(
  row: IdempotencyRow,
  requestHash: string
): RunIdempotentCommandResult<TData> {
  if (row.request_hash !== requestHash) {
    throw createActionError(CONFLICT_ERROR, 'idempotency: request body mismatch')
  }

  if (row.response_body === null) {
    throw createActionError(CONFLICT_ERROR, 'idempotency: command already in progress')
  }

  return { data: row.response_body as TData, replayed: true }
}

async function findExistingRow(
  context: ApiHandlerContext,
  key: string,
  method: string,
  path: string
): Promise<IdempotencyRow | null> {
  const { data, error } = await context.supabase
    .from('idempotency_keys')
    .select('key, user_id, method, path, request_hash, status_code, response_body')
    .eq('key', key)
    .eq('user_id', context.userId)
    .eq('method', method)
    .eq('path', path)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function runIdempotentCommand<TData extends Json>({
  context,
  key,
  method,
  path,
  requestBody,
  statusCode,
  command,
}: RunIdempotentCommandOptions<TData>): Promise<RunIdempotentCommandResult<TData>> {
  assertValidIdempotencyKey(key)

  const requestHash = hashRequestBody(requestBody)
  const existing = await findExistingRow(context, key, method, path)

  if (existing) {
    return replayExistingRow<TData>(existing, requestHash)
  } else {
    const { error } = await context.supabase.from('idempotency_keys').insert({
      key,
      user_id: context.userId,
      method,
      path,
      request_hash: requestHash,
    })

    if (error) {
      const raced = await findExistingRow(context, key, method, path)
      if (!raced) {
        throw error
      }
      return replayExistingRow<TData>(raced, requestHash)
    }
  }

  let data: TData

  try {
    data = await command()
  } catch (error) {
    await context.supabase
      .from('idempotency_keys')
      .delete()
      .eq('key', key)
      .eq('user_id', context.userId)
      .eq('method', method)
      .eq('path', path)
    throw error
  }

  const { error } = await context.supabase
    .from('idempotency_keys')
    .update({
      status_code: statusCode,
      response_body: data,
    })
    .eq('key', key)
    .eq('user_id', context.userId)
    .eq('method', method)
    .eq('path', path)

  if (error) throw error
  return { data, replayed: false }
}
