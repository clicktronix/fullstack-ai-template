import 'server-only'

import pino from 'pino'
import { pinoRedactPaths } from '@/shared/kernel/logging/redact'
import { getRuntimeEnv, isDevelopmentEnvironment } from '@/shared/server/env/runtime'

export const serverLogger = pino({
  level: getRuntimeEnv().LOG_LEVEL ?? (isDevelopmentEnvironment() ? 'debug' : 'info'),
  base: undefined,
  redact: {
    paths: [...pinoRedactPaths],
    censor: '[Redacted]',
  },
})
