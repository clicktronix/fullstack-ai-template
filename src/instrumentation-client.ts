// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { init } from '@sentry/nextjs'
import { getPublicEnv } from '@/infrastructure/env/public'
import { getSentrySendDefaultPii, getSentryTracesSampleRate } from '@/lib/sentry/config'

const env = getPublicEnv()

init({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust via env vars if needed.
  tracesSampleRate: getSentryTracesSampleRate(),

  // Disable default PII unless explicitly enabled by env.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: getSentrySendDefaultPii(),
})

export { captureRouterTransitionStart as onRouterTransitionStart } from '@sentry/nextjs'
