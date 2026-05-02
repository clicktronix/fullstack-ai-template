import { getPublicEnv } from '@/infrastructure/env/public'
import { getRuntimeEnv, isProductionEnvironment } from '@/infrastructure/env/runtime'

function parseSampleRate(rawValue: string | undefined): number | null {
  if (!rawValue) return null

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed)) return null
  if (parsed < 0 || parsed > 1) return null
  return parsed
}

export function getSentryTracesSampleRate(): number {
  const publicEnv = getPublicEnv()
  const runtimeEnv = getRuntimeEnv()
  const fromEnv = parseSampleRate(
    publicEnv.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? runtimeEnv.SENTRY_TRACES_SAMPLE_RATE
  )
  if (fromEnv !== null) return fromEnv
  return isProductionEnvironment() ? 0.1 : 1
}

export function getSentrySendDefaultPii(): boolean {
  const publicEnv = getPublicEnv()
  const runtimeEnv = getRuntimeEnv()
  const rawValue =
    publicEnv.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII ?? runtimeEnv.SENTRY_SEND_DEFAULT_PII
  return rawValue === 'true'
}
