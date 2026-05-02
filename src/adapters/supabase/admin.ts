import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { getRequiredServerEnv, getServerEnv } from '@/infrastructure/env/server'
import type { Database } from './types'

function getSupabaseUrl(): string {
  const env = getServerEnv()
  return env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL
}

function getSupabaseServiceRoleKey(): string {
  return getRequiredServerEnv('SUPABASE_SERVICE_ROLE_KEY')
}

export const createAdminClient = cache(() =>
  createClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
)
