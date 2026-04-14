function parseSampleRate(rawValue: string | undefined): number | null {
  if (!rawValue) return null

  const parsed = Number(rawValue)
  if (!Number.isFinite(parsed)) return null
  if (parsed < 0 || parsed > 1) return null
  return parsed
}

export function getSentryTracesSampleRate(): number {
  const fromEnv = parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? process.env.SENTRY_TRACES_SAMPLE_RATE
  )
  if (fromEnv !== null) return fromEnv
  return process.env.NODE_ENV === 'production' ? 0.1 : 1
}

export function getSentrySendDefaultPii(): boolean {
  const rawValue =
    process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII ?? process.env.SENTRY_SEND_DEFAULT_PII
  return rawValue === 'true'
}
