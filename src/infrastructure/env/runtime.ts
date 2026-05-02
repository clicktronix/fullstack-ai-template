import { type InferOutput, object, optional, parse, picklist, string } from 'valibot'

const RuntimeEnvSchema = object({
  NODE_ENV: optional(picklist(['development', 'production', 'test'])),
  NEXT_RUNTIME: optional(picklist(['nodejs', 'edge'])),
  VERCEL_ENV: optional(picklist(['production', 'preview', 'development'])),
  VERCEL_PROJECT_PRODUCTION_URL: optional(string()),
  VERCEL_URL: optional(string()),
  LOG_LEVEL: optional(string()),
  SENTRY_TRACES_SAMPLE_RATE: optional(string()),
  SENTRY_SEND_DEFAULT_PII: optional(string()),
})

export type RuntimeEnv = InferOutput<typeof RuntimeEnvSchema>

let cachedRuntimeEnv: RuntimeEnv | null = null

function readRuntimeEnv(): RuntimeEnv {
  return parse(RuntimeEnvSchema, {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    LOG_LEVEL: process.env.LOG_LEVEL,
    SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE,
    SENTRY_SEND_DEFAULT_PII: process.env.SENTRY_SEND_DEFAULT_PII,
  })
}

export function getRuntimeEnv(): RuntimeEnv {
  if (process.env.NODE_ENV === 'test') return readRuntimeEnv()

  cachedRuntimeEnv ??= readRuntimeEnv()
  return cachedRuntimeEnv
}

export function isProductionEnvironment(): boolean {
  return getRuntimeEnv().NODE_ENV === 'production'
}

export function isDevelopmentEnvironment(): boolean {
  return getRuntimeEnv().NODE_ENV === 'development'
}

export function isTestEnvironment(): boolean {
  return getRuntimeEnv().NODE_ENV === 'test'
}
