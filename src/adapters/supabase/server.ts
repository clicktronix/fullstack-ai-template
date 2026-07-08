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
import { getSupabasePublishableKey, getSupabaseUrl } from '@/infrastructure/env/server'
import type { Database } from './types'

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
 * @example
 * ```tsx
 * export default async function Page() {
 *   const supabase = await createClient()
 *   const { data: workItems } = await supabase.from('work_items').select('*')
 *   return <pre>{JSON.stringify(workItems, null, 2)}</pre>
 * }
 * ```
 *
 * @example
 * ```ts
 * // In a Server Action
 * 'use server'
 * export async function createWorkItem(data: { title: string }) {
 *   const supabase = await createClient()
 *   return supabase.from('work_items').insert(data)
 * }
 * ```
 */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
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
