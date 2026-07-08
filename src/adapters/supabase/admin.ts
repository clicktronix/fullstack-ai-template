import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { cache } from 'react'
import { getSupabaseSecretKey, getSupabaseUrl } from '@/infrastructure/env/server'
import type { Database } from './types'

export const createAdminClient = cache(() =>
  createClient<Database>(getSupabaseUrl(), getSupabaseSecretKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
)
