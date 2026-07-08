import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { getServerEnv, getSupabaseSecretKey } from '@/infrastructure/env/server'
import type { Database } from './types'

function getSupabaseUrl(): string {
  const env = getServerEnv()
  return env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
}

export const createAdminClient = cache(() =>
  createClient<Database>(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
)
