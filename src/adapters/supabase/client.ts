/**
 * Supabase browser client for client-side operations.
 *
 * This client is designed for use in React Client Components.
 * It automatically handles cookie-based authentication with Supabase Auth.
 *
 * Uses @supabase/ssr for proper cookie handling in Next.js App Router.
 *
 * Uses environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createBrowserClient } from '@supabase/ssr'
import { getClientEnv } from '@/infrastructure/env/client'
import type { Database } from './types'

/**
 * Create Supabase browser client.
 *
 * Uses createBrowserClient from @supabase/ssr for proper cookie handling
 * in Next.js App Router. This ensures cookies are properly shared between
 * server and client for session management.
 *
 * @returns Supabase client configured for browser environment with typed Database
 */
export function createClient() {
  const env = getClientEnv()

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Lazy-initialized singleton for Supabase client.
 * Uses Proxy to defer initialization until first access.
 * This allows tests to mock the module before any real client is created.
 */
let _supabase: ReturnType<typeof createClient> | null = null

function getSupabaseClient() {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}

/**
 * Singleton instance for direct usage.
 * Uses Proxy for lazy initialization - client is only created on first method call.
 * This is critical for test mocking to work correctly on Linux/CI.
 */
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getSupabaseClient() as unknown as Record<string, unknown>)[prop as string]
  },
})
