import 'server-only'

import pino from 'pino'
import { getRuntimeEnv, isDevelopmentEnvironment } from '@/infrastructure/env/runtime'
import { pinoRedactPaths } from './log-redaction'

export const serverLogger = pino({
  level: getRuntimeEnv().LOG_LEVEL ?? (isDevelopmentEnvironment() ? 'debug' : 'info'),
  base: undefined,
  redact: {
    paths: [...pinoRedactPaths],
    censor: '[Redacted]',
  },
})
