import { registerOTel } from '@vercel/otel'
import { getRuntimeEnv } from '@/infrastructure/env/runtime'

export async function register() {
  const runtime = getRuntimeEnv().NEXT_RUNTIME

  registerOTel('fullstack-ai-template')

  if (runtime === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (runtime === 'edge') {
    await import('../sentry.edge.config')
  }
}

export { captureRequestError as onRequestError } from '@sentry/nextjs'
