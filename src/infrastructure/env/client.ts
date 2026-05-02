import type { PublicEnv } from './public'
import { getPublicEnv, getRequiredPublicEnv } from './public'

export type ClientEnv = PublicEnv & {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
}

let cachedClientEnv: ClientEnv | null = null

function readClientEnv(): ClientEnv {
  return {
    ...getPublicEnv(),
    NEXT_PUBLIC_SUPABASE_URL: getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  }
}

export function getClientEnv(): ClientEnv {
  if (process.env.NODE_ENV === 'test') return readClientEnv()

  cachedClientEnv ??= readClientEnv()
  return cachedClientEnv
}
