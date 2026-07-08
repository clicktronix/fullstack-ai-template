const REDACTED = '[Redacted]'

const SENSITIVE_KEY_PATTERN =
  /^(authorization|cookie|set-cookie|password|access_token|refresh_token|api[_-]?key|token|secret|service_role|supabase_service_role_key)$/i

export const pinoRedactPaths = [
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'access_token',
  'refresh_token',
  'apiKey',
  'api_key',
  'token',
  'secret',
  'service_role',
  'supabase_service_role_key',
  'headers.authorization',
  'headers.cookie',
  'headers["set-cookie"]',
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'request.headers.authorization',
  'request.headers.cookie',
  'request.headers["set-cookie"]',
  'metadata.authorization',
  'metadata.cookie',
  'metadata.password',
  'metadata.access_token',
  'metadata.refresh_token',
] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function redactSensitiveData(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item))
  }

  if (!isRecord(value)) {
    return value
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, childValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactSensitiveData(childValue),
    ])
  )
}
