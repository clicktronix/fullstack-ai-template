import 'server-only'

import { getRuntimeEnv, isProductionEnvironment } from '@/shared/server/env/runtime'

function parseSampleRate(rawValue: string | undefined): number | null {
  if (!rawValue) return null

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) return null
  return parsed
}

export function getSentryTracesSampleRate(): number {
  const fromEnv = parseSampleRate(getRuntimeEnv().SENTRY_TRACES_SAMPLE_RATE)
  return fromEnv ?? (isProductionEnvironment() ? 0.1 : 1)
}

export function getSentrySendDefaultPii(): boolean {
  return getRuntimeEnv().SENTRY_SEND_DEFAULT_PII === 'true'
}
