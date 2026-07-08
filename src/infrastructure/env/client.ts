import type { PublicEnv } from './public'
import { getPublicEnv, getRequiredPublicEnv, getRequiredPublicSupabaseKey } from './public'

export type ClientEnv = PublicEnv & {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_KEY: string
}

let cachedClientEnv: ClientEnv | null = null

function readClientEnv(): ClientEnv {
  return {
    ...getPublicEnv(),
    NEXT_PUBLIC_SUPABASE_URL: getRequiredPublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
    NEXT_PUBLIC_SUPABASE_KEY: getRequiredPublicSupabaseKey(),
  }
}

export function getClientEnv(): ClientEnv {
  if (process.env.NODE_ENV === 'test') return readClientEnv()

  cachedClientEnv ??= readClientEnv()
  return cachedClientEnv
}
