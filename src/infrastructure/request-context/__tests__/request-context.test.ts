import { describe, expect, test } from 'bun:test'
import {
  createReportingRequestContext,
  getReportingRequestContext,
  runWithReportingRequestContext,
} from '../request-context'

describe('reporting request context', () => {
  test('keeps concurrent request metadata isolated', async () => {
    const observed = await Promise.all(
      ['request-a', 'request-b'].map((requestId) =>
        runWithReportingRequestContext(
          createReportingRequestContext({ requestId, actorId: `${requestId}-actor` }),
          async () => {
            await Promise.resolve()
            return getReportingRequestContext()
          }
        )
      )
    )

    expect(observed).toEqual([
      { requestId: 'request-a', actorId: 'request-a-actor' },
      { requestId: 'request-b', actorId: 'request-b-actor' },
    ])
    expect(getReportingRequestContext()).toBeUndefined()
  })
})
