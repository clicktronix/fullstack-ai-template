import { type InferOutput, object, optional, parse, pipe, string, url } from 'valibot'

const PublicEnvSchema = object({
  NEXT_PUBLIC_SUPABASE_URL: optional(pipe(string(), url())),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(string()),
  NEXT_PUBLIC_SITE_URL: optional(pipe(string(), url())),
  NEXT_PUBLIC_API_URL: optional(string()),
  NEXT_PUBLIC_SENTRY_DSN: optional(string()),
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: optional(string()),
  NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII: optional(string()),
})

export type PublicEnv = InferOutput<typeof PublicEnvSchema>

let cachedPublicEnv: PublicEnv | null = null

function readPublicEnv(): PublicEnv {
  return parse(PublicEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII: process.env.NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII,
  })
}

export function getPublicEnv(): PublicEnv {
  if (process.env.NODE_ENV === 'test') return readPublicEnv()

  cachedPublicEnv ??= readPublicEnv()
  return cachedPublicEnv
}

export function getRequiredPublicEnv(
  name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
): string {
  const value = getPublicEnv()[name]

  if (!value) {
    throw new Error(`${name} is required in this client context`)
  }

  return value
}
