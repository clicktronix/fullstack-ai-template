'use client'

import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { useEffect } from 'react'
import { object, nullable, parse } from 'valibot'
import { supabase } from '@/shared/client/supabase/client'
import { createHttpError } from '@/shared/kernel/errors/api-error'
import { STALE_TIME } from '@/shared/ui/query/constants'
import { UserSchema, type User } from '../../domain/user'
import { authKeys } from '../../query-cache'
import { onAuthStateChange } from '../auth-events'

const CurrentUserEnvelopeSchema = object({
  data: nullable(UserSchema),
})

async function getBrowserSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

async function fetchCurrentUser(): Promise<User | null> {
  const response = await fetch('/api/identity/me', {
    method: 'GET',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw createHttpError(response.status, `Request failed: ${response.statusText}`)
  }
  return parse(CurrentUserEnvelopeSchema, await response.json()).data
}

export function useSession(
  options?: Omit<UseQueryOptions<Session | null>, 'queryKey' | 'queryFn'>
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = onAuthStateChange((event, session) => {
      queryClient.setQueryData(authKeys.session(), session)
      if (event === 'SIGNED_OUT') {
        queryClient.setQueryData(authKeys.user(), null)
        queryClient.removeQueries({ queryKey: authKeys.user() })
      }
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getBrowserSession,
    staleTime: STALE_TIME.SESSION,
    ...options,
  })
}

export function useCurrentUser(
  options?: Omit<UseQueryOptions<User | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: STALE_TIME.REFERENCE_DATA,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('session')) return false
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    ...options,
  })
}
