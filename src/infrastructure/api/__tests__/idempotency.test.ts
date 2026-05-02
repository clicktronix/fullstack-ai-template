import { describe, expect, mock, test } from 'bun:test'
import type { Json } from '@/adapters/supabase/types'
import type { ApiHandlerContext } from '@/infrastructure/api/context'
import { runIdempotentCommand } from '@/infrastructure/api/idempotency'

type QueryResult = {
  data: Json | null
  error: Error | null
}

type MutationResult = {
  error: Error | null
}

type EqChain = {
  eq: (column: string, value: string) => EqChain | Promise<MutationResult>
}

function createEqChain(result: MutationResult) {
  let eqCalls = 0
  const eq = mock((_column: string, _value: string) => {
    eqCalls += 1
    return eqCalls >= 4 ? Promise.resolve(result) : chain
  })
  const chain: EqChain = { eq }

  return { chain, eq }
}

function createMockContext(options: {
  queryResults: QueryResult[]
  insertResult?: MutationResult
  updateResult?: MutationResult
  deleteResult?: MutationResult
}) {
  const queryResults = [...options.queryResults]
  const insert = mock(async () => options.insertResult ?? { error: null })
  const updateChain = createEqChain(options.updateResult ?? { error: null })
  const deleteChain = createEqChain(options.deleteResult ?? { error: null })
  const update = mock(() => updateChain.chain)
  const deleteMutation = mock(() => deleteChain.chain)

  const selectBuilder = {
    eq() {
      return this
    },
    maybeSingle: mock(async () => queryResults.shift() ?? { data: null, error: null }),
  }

  const supabase = {
    from: mock(() => ({
      select: () => selectBuilder,
      insert,
      update,
      delete: deleteMutation,
    })),
  } as unknown as ApiHandlerContext['supabase']

  return {
    context: {
      supabase,
      requestId: 'request-123',
      userId: 'user-123',
      role: 'admin',
    } satisfies ApiHandlerContext,
    insert,
    update,
    deleteMutation,
  }
}

describe('runIdempotentCommand', () => {
  test('replays a stored response for the same key and request body', async () => {
    const stored = { id: 'work-item-1' }
    const { context } = createMockContext({
      queryResults: [
        {
          data: {
            key: 'key-1',
            user_id: 'user-123',
            method: 'POST',
            path: '/api/work-items',
            request_hash: '0a695889923be709dcc2648f3ebc9e10975219a240371119d41d5eb10b60214e',
            status_code: 201,
            response_body: stored,
          },
          error: null,
        },
      ],
    })
    const command = mock(async () => ({ id: 'new-work-item' }))

    const result = await runIdempotentCommand({
      context,
      key: 'key-1',
      method: 'POST',
      path: '/api/work-items',
      requestBody: { title: 'Backend task' },
      statusCode: 201,
      command,
    })

    expect(result).toEqual({ data: stored, replayed: true })
    expect(command).not.toHaveBeenCalled()
  })

  test('does not re-run an in-progress command with the same key', async () => {
    const { context } = createMockContext({
      queryResults: [
        {
          data: {
            key: 'key-1',
            user_id: 'user-123',
            method: 'POST',
            path: '/api/work-items',
            request_hash: '0a695889923be709dcc2648f3ebc9e10975219a240371119d41d5eb10b60214e',
            status_code: null,
            response_body: null,
          },
          error: null,
        },
      ],
    })
    const command = mock(async () => ({ id: 'new-work-item' }))

    await expect(
      runIdempotentCommand({
        context,
        key: 'key-1',
        method: 'POST',
        path: '/api/work-items',
        requestBody: { title: 'Backend task' },
        statusCode: 201,
        command,
      })
    ).rejects.toThrow('[CONFLICT_ERROR] idempotency: command already in progress')
    expect(command).not.toHaveBeenCalled()
  })

  test('deletes the placeholder when the command itself fails', async () => {
    const { context, deleteMutation } = createMockContext({
      queryResults: [{ data: null, error: null }],
    })
    const command = mock(async () => {
      throw new Error('command failed')
    })

    await expect(
      runIdempotentCommand({
        context,
        key: 'key-1',
        method: 'POST',
        path: '/api/work-items',
        requestBody: { title: 'Backend task' },
        statusCode: 201,
        command,
      })
    ).rejects.toThrow('command failed')
    expect(deleteMutation).toHaveBeenCalled()
  })

  test('keeps the placeholder when response persistence fails after command success', async () => {
    const persistError = new Error('persist failed')
    const { context, deleteMutation } = createMockContext({
      queryResults: [{ data: null, error: null }],
      updateResult: { error: persistError },
    })
    const command = mock(async () => ({ id: 'work-item-1' }))

    await expect(
      runIdempotentCommand({
        context,
        key: 'key-1',
        method: 'POST',
        path: '/api/work-items',
        requestBody: { title: 'Backend task' },
        statusCode: 201,
        command,
      })
    ).rejects.toThrow('persist failed')
    expect(command).toHaveBeenCalledTimes(1)
    expect(deleteMutation).not.toHaveBeenCalled()
  })
})
