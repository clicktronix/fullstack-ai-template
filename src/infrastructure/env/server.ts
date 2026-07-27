import 'server-only'

import {
  check,
  type InferOutput,
  minLength,
  object,
  optional,
  parse,
  pipe,
  string,
  url,
} from 'valibot'
import { emptyStringToUndefined } from './empty-string'

// Both the new publishable key and the legacy anon key are individually optional (either
// name may be used), but the browser client needs *one* of them to authenticate — so at
// least one must be present. Before the publishable/secret key migration, only the legacy
// NEXT_PUBLIC_SUPABASE_ANON_KEY existed and was a required field, so this parse-time check
// restores the original boot-time fail-fast instead of deferring the failure to whenever
// getSupabasePublishableKey() first happens to be called.
const ServerEnvSchema = pipe(
  object({
    NEXT_PUBLIC_SUPABASE_URL: pipe(string(), url()),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional(pipe(string(), minLength(1))),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optional(pipe(string(), minLength(1))),
    NEXT_PUBLIC_SITE_URL: optional(pipe(string(), url())),
    SUPABASE_URL: optional(pipe(string(), url())),
    SUPABASE_SECRET_KEY: optional(pipe(string(), minLength(1))),
    SUPABASE_SERVICE_ROLE_KEY: optional(pipe(string(), minLength(1))),
    AI_SUGGESTIONS_API_URL: optional(pipe(string(), url())),
    AI_SUGGESTIONS_API_KEY: optional(string()),
    WORK_ITEMS_API_URL: optional(pipe(string(), url())),
    EXAMPLE_WEBHOOK_SECRET: optional(pipe(string(), minLength(1))),
  }),
  check(
    (input) =>
      Boolean(input.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
      Boolean(input.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY) is required'
  )
)

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
    WORK_ITEMS_API_URL: emptyStringToUndefined(process.env.WORK_ITEMS_API_URL),
    EXAMPLE_WEBHOOK_SECRET: emptyStringToUndefined(process.env.EXAMPLE_WEBHOOK_SECRET),
  })
}

export function getServerEnv(): ServerEnv {
  if (process.env.NODE_ENV === 'test') return readServerEnv()

  cachedServerEnv ??= readServerEnv()
  return cachedServerEnv
}

/**
 * Supabase project URL. Prefers the private `SUPABASE_URL` (e.g. for a direct/internal
 * host distinct from the public one) and falls back to `NEXT_PUBLIC_SUPABASE_URL`.
 *
 * Single source of truth for every server-side Supabase client (admin, SSR/cookie-based) —
 * they previously each defined their own `getSupabaseUrl` with divergent precedence
 * (one honored `SUPABASE_URL`, the other didn't), which could point them at different hosts.
 */
export function getSupabaseUrl(): string {
  const env = getServerEnv()
  return env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
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
