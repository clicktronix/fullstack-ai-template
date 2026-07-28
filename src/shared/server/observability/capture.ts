import 'server-only'

import * as Sentry from '@sentry/nextjs'

export type CaptureErrorContext = {
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

export function captureError(error: unknown, context: CaptureErrorContext = {}): void {
  Sentry.captureException(error, {
    tags: context.tags,
    extra: context.extra,
  })
}
