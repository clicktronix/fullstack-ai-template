import 'server-only'

import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'

export type ReportingRequestContext = {
  requestId: string
  actorId?: string
  tenantId?: string
}

const storage = new AsyncLocalStorage<ReportingRequestContext>()

export function createReportingRequestContext(
  values: Omit<ReportingRequestContext, 'requestId'> & { requestId?: string } = {}
): ReportingRequestContext {
  return {
    ...values,
    requestId: values.requestId ?? randomUUID(),
  }
}

export function runWithReportingRequestContext<T>(
  context: ReportingRequestContext,
  callback: () => T
): T {
  return storage.run(context, callback)
}

export function getReportingRequestContext(): ReportingRequestContext | undefined {
  return storage.getStore()
}
