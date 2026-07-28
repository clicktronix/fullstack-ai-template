'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { isDevelopmentEnvironment } from '@/shared/client/env/runtime'
import { getQueryClient } from '@/shared/ui/providers/query-client'
import { MutationErrorNotifier } from './MutationErrorNotifier'

// Dynamic DevTools import, loaded only in development.
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false }
)

const isDevelopment = isDevelopmentEnvironment()

type QueryProviderProps = {
  children: ReactNode
}

/**
 * QueryProvider wraps the application with TanStack Query context.
 *
 * Features:
 * - Server/Browser singleton pattern (via getQueryClient)
 * - DevTools in development mode
 *
 * Default Options (from getQueryClient):
 * - staleTime: 60 seconds
 * - gcTime: 5 minutes
 * - refetchOnMount: true (stale data is revalidated on mount)
 * - refetchOnWindowFocus: true
 * - Smart retry logic (only for 5xx/network errors)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Use getQueryClient() for App Router pattern
  // - Server: creates new client per request (prevents data leakage)
  // - Browser: reuses singleton (prevents recreation during suspense)
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MutationErrorNotifier />
      {children}
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
