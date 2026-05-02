# Optional Sentry Setup

Sentry is included in the template as an optional monitoring integration. You do not need it to run the baseline app, unit tests, or E2E suite.

## What is already wired

- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation-client.ts`
- `src/lib/sentry/config.ts`

These files already read environment variables and initialize `@sentry/nextjs`.

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

You can remove:

- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation-client.ts`
- `src/lib/sentry/config.ts`
- `@sentry/nextjs` from `package.json`

The rest of the template does not depend on Sentry.
