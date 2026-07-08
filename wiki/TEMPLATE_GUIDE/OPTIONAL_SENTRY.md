# Optional Sentry Setup

Sentry is included in the template as an optional monitoring integration. You do not need it to run the baseline app, unit tests, or E2E suite.

## What is already wired

- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation-client.ts`
- `src/infrastructure/sentry/config.ts`

These files already read environment variables and initialize `@sentry/nextjs`. All three set
`beforeSend: redactSentryEvent` (`src/infrastructure/sentry/redact.ts`), so events are redacted
before they leave the server, edge runtime, or browser — including client-originated captures such
as `QueryCache.onError`.

Capture itself is centralized at a small set of boundaries, not scattered through business code —
`captureError()` (`src/infrastructure/sentry/capture.ts`) is called exactly once per error, from:
`infrastructure/actions/safe-action.ts` (Server Actions), `withRouteErrorHandling` (Route
Handlers), and `QueryCache.onError` (`src/ui/providers/query-client.ts`, client fetches and SSR
`prefetchQuery`). `withServerReadErrorHandling` (`src/infrastructure/errors/`) is the same pattern
for a direct DAL/RSC read outside TanStack Query, ready for when a Server Component needs one — see
[`../ARCHITECTURE/DATA_ACCESS.md`](../ARCHITECTURE/DATA_ACCESS.md#error-handling) and
[`../ARCHITECTURE/diagrams/security.html`](../ARCHITECTURE/diagrams/security.html) for the full
error-capture map.

Production sourcemap upload is disabled in `next.config.ts` by default. Keep it disabled for the baseline template. Enable it only after deciding how the project will upload and delete sourcemaps in CI, and verify that `.next/static` does not retain public `.map` files containing source identifiers.

## Minimal setup

Add these variables to `.env.local`:

```bash
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=1
NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII=false
```

Recommended defaults:

- development: `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=1`
- production: start with `0.1`
- keep `NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII=false` unless you explicitly need user-identifying data

## When to enable it

Enable Sentry when your project needs:

- production exception tracking
- performance traces
- release monitoring
- alerting for real user issues

If your project is still in prototype mode, you can leave the DSN empty.

## If you do not want Sentry at all

Unlike before, the error boundaries (`safe-action.ts`, `withRouteErrorHandling`,
`QueryCache.onError`) now call `captureError()` (`src/infrastructure/sentry/capture.ts`)
unconditionally, so removing Sentry is not just deleting the four config files. `captureError()`
dynamically imports `@sentry/nextjs` and swallows any rejection, so leaving the DSN empty is
enough to make it a safe no-op at runtime — but removing the `@sentry/nextjs` package outright
also requires either deleting `captureError()`'s callers at each boundary or replacing
`capture.ts` with a no-op implementation, since the dynamic `import('@sentry/nextjs')` would
otherwise fail to type-check once the package is gone.

To fully remove Sentry:

- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation-client.ts`
- `src/infrastructure/sentry/{config,redact,capture}.ts`
- the `captureError(...)` calls in `infrastructure/actions/safe-action.ts`,
  `infrastructure/api/with-route-error-handling.ts`, `infrastructure/errors/with-server-read-error-handling.ts`,
  and `ui/providers/query-client.ts`
- `@sentry/nextjs` from `package.json`
