// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init } from '@sentry/nextjs'
import { getSentrySendDefaultPii, getSentryTracesSampleRate } from './src/lib/sentry/config'

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust via env vars if needed.
  tracesSampleRate: getSentryTracesSampleRate(),

  // Disable default PII unless explicitly enabled by env.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: getSentrySendDefaultPii(),
})
