# Optional Sentry

Sentry is wired but remains a no-op when the DSN is empty.

## Files

| Runtime | Configuration                                                        |
| ------- | -------------------------------------------------------------------- |
| Server  | `sentry.server.config.ts`, `src/shared/server/observability/*`       |
| Edge    | `sentry.edge.config.ts`, `src/shared/server/observability/*`         |
| Browser | `src/instrumentation-client.ts`, `src/shared/client/observability/*` |

Redaction is runtime-specific. Unexpected failures are captured once at the owning boundary:

- Server Actions: `src/shared/server/actions/safe-action.ts`
- Route Handlers: `src/shared/server/api/with-route-error-handling.ts`
- Browser queries: `src/shared/ui/providers/query-client.ts`

Expected domain/application failures are returned or mapped, not reported as unexpected errors.

## Configuration

```bash
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII=false
```

Keep PII disabled unless the product has an explicit data policy. Keep production sourcemap upload
disabled until CI uploads private maps and verifies they are not served from `.next/static`.

## Removal

To remove Sentry:

1. replace server and client `captureError` implementations with no-ops or remove their callers;
2. delete Sentry config and instrumentation files;
3. remove `@sentry/nextjs` and its env variables;
4. run typecheck, tests, and production build.
