/**
 * Supabase server client for Server Components, Route Handlers, and Server Actions.
 *
 * This client is designed for use in server-side code only.
 * It properly handles cookies for session management in Next.js App Router.
 *
 * IMPORTANT: This module can only be imported in server-side code.
 * Importing it in client components will cause an error.
 *
 * Uses environment variables:
 * - SUPABASE_URL (falls back to NEXT_PUBLIC_SUPABASE_URL) — see getSupabaseUrl()
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (falls back to legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '@/generated/supabase/types'
import { getSupabasePublishableKey, getSupabaseUrl } from '@/shared/server/env/server'

// Cookie type for setAll
type CookieToSet = {
  name: string
  value: string
  options?: Record<string, unknown>
}

/**
 * Create Supabase server client for Server Components, Route Handlers, and Server Actions.
 *
 * Uses try-catch in setAll because Next.js throws an error when cookies are set
 * from Server Components. This is safe because proxy handles session refresh.
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 *
 * @returns Supabase client configured for server environment
 *
 * Capability-private stores receive this client through the authenticated
 * context. Routes, UI, and shared helpers do not query product tables directly.
 */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[], _cacheHeaders: Record<string, string>) {
        // Next.js throws an error if cookies are set from Server Components.
        // This can be safely ignored because proxy handles session refresh.
        // @see https://supabase.com/docs/guides/auth/server-side/nextjs
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if proxy handles session refresh.
        }
      },
    },
  })
})
