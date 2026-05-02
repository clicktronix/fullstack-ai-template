import type { ErrorEvent, EventHint } from '@sentry/nextjs'
import { redactSensitiveData } from '@/lib/log-redaction'

export function redactSentryEvent(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
  event.request = redactSensitiveData(event.request) as ErrorEvent['request']
  event.extra = redactSensitiveData(event.extra) as ErrorEvent['extra']
  event.contexts = redactSensitiveData(event.contexts) as ErrorEvent['contexts']
  event.user = redactSensitiveData(event.user) as ErrorEvent['user']
  event.tags = redactSensitiveData(event.tags) as ErrorEvent['tags']

  return event
}
