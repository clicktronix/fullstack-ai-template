/**
 * Shared "capture once" helper for reporting unexpected errors to Sentry.
 *
 * Isomorphic by design (no `server-only` import): the same helper is used from
 * server-only boundaries (route handlers, RSC read wrappers) and from
 * environment-agnostic code that also runs in the browser (the TanStack Query
 * QueryCache config). `@sentry/nextjs` resolves to the correct client/server
 * SDK wherever this executes.
 *
 * Redaction is applied globally via `beforeSend: redactSentryEvent` in
 * sentry.server.config.ts, sentry.edge.config.ts, and src/instrumentation-client.ts
 * — callers do not need to redact `tags`/`extra` themselves.
 */

let sentryPromise: Promise<typeof import('@sentry/nextjs')> | null = null
function getSentry() {
  sentryPromise ??= import('@sentry/nextjs')
  return sentryPromise
}

export type CaptureErrorContext = {
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

/**
 * Capture an error to Sentry. Callers are responsible for calling this exactly
 * once per error, at the boundary where the error is first handled — see the
 * "no double-capture" comment at each boundary (safe-action, route handlers,
 * server-read wrapper, QueryCache) for which layer owns which errors.
 */
export function captureError(error: unknown, context: CaptureErrorContext = {}): void {
  getSentry()
    .then((Sentry) => {
      Sentry.captureException(error, {
        tags: context.tags,
        extra: context.extra,
      })
    })
    .catch(() => {})
}
