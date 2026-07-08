import 'server-only'

import { type InferOutput, minLength, object, optional, parse, pipe, string, url } from 'valibot'
import { emptyStringToUndefined } from './empty-string'

const ServerEnvSchema = object({
  NEXT_PUBLIC_SUPABASE_URL: pipe(string(), url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(pipe(string(), minLength(1))),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(pipe(string(), minLength(1))),
  NEXT_PUBLIC_SITE_URL: optional(pipe(string(), url())),
  SUPABASE_URL: optional(pipe(string(), url())),
  SUPABASE_SECRET_KEY: optional(pipe(string(), minLength(1))),
  SUPABASE_SERVICE_ROLE_KEY: optional(pipe(string(), minLength(1))),
  AI_SUGGESTIONS_API_URL: optional(pipe(string(), url())),
  AI_SUGGESTIONS_API_KEY: optional(string()),
  EXAMPLE_WEBHOOK_SECRET: optional(pipe(string(), minLength(1))),
})

export type ServerEnv = InferOutput<typeof ServerEnvSchema>

let cachedServerEnv: ServerEnv | null = null

function assertNoPublicSecrets(): void {
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must never use the NEXT_PUBLIC_ prefix')
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY) {
    throw new Error('SUPABASE_SECRET_KEY must never use the NEXT_PUBLIC_ prefix')
  }
}

function readServerEnv(): ServerEnv {
  assertNoPublicSecrets()
  return parse(ServerEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: emptyStringToUndefined(process.env.NEXT_PUBLIC_SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: emptyStringToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: emptyStringToUndefined(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    NEXT_PUBLIC_SITE_URL: emptyStringToUndefined(process.env.NEXT_PUBLIC_SITE_URL),
    SUPABASE_URL: emptyStringToUndefined(process.env.SUPABASE_URL),
    SUPABASE_SECRET_KEY: emptyStringToUndefined(process.env.SUPABASE_SECRET_KEY),
    SUPABASE_SERVICE_ROLE_KEY: emptyStringToUndefined(process.env.SUPABASE_SERVICE_ROLE_KEY),
    AI_SUGGESTIONS_API_URL: emptyStringToUndefined(process.env.AI_SUGGESTIONS_API_URL),
    AI_SUGGESTIONS_API_KEY: emptyStringToUndefined(process.env.AI_SUGGESTIONS_API_KEY),
    EXAMPLE_WEBHOOK_SECRET: emptyStringToUndefined(process.env.EXAMPLE_WEBHOOK_SECRET),
  })
}

export function getServerEnv(): ServerEnv {
  if (process.env.NODE_ENV === 'test') return readServerEnv()

  cachedServerEnv ??= readServerEnv()
  return cachedServerEnv
}

/** Prefers the new publishable key, falls back to the legacy anon key. */
export function getSupabasePublishableKey(): string {
  const env = getServerEnv()
  const value = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!value) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY) is required in this server context'
    )
  }

  return value
}

/** Prefers the new secret key, falls back to the legacy service role key. */
export function getSupabaseSecretKey(): string {
  const env = getServerEnv()
  const value = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY

  if (!value) {
    throw new Error(
      'SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) is required in this server context'
    )
  }

  return value
}
