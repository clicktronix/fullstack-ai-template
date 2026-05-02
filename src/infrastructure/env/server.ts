import 'server-only'

import { type InferOutput, minLength, object, optional, parse, pipe, string, url } from 'valibot'

const ServerEnvSchema = object({
  NEXT_PUBLIC_SUPABASE_URL: pipe(string(), url()),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: pipe(string(), minLength(1)),
  NEXT_PUBLIC_SITE_URL: optional(pipe(string(), url())),
  SUPABASE_URL: optional(pipe(string(), url())),
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
}

function readServerEnv(): ServerEnv {
  assertNoPublicSecrets()
  return parse(ServerEnvSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    AI_SUGGESTIONS_API_URL: process.env.AI_SUGGESTIONS_API_URL,
    AI_SUGGESTIONS_API_KEY: process.env.AI_SUGGESTIONS_API_KEY,
    EXAMPLE_WEBHOOK_SECRET: process.env.EXAMPLE_WEBHOOK_SECRET,
  })
}

export function getServerEnv(): ServerEnv {
  if (process.env.NODE_ENV === 'test') return readServerEnv()

  cachedServerEnv ??= readServerEnv()
  return cachedServerEnv
}

export function getRequiredServerEnv(name: 'SUPABASE_SERVICE_ROLE_KEY'): string {
  const value = getServerEnv()[name]

  if (!value) {
    throw new Error(`${name} is required in this server context`)
  }

  return value
}
