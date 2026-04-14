'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { isDevelopment } from '@/lib/api-config'
import { getQueryClient } from '@/lib/query-client'
import { useRealtimeInvalidation } from '@/ui/server-state/realtime/use-realtime-invalidation'
import { MutationErrorNotifier } from './MutationErrorNotifier'

// Динамический импорт DevTools — загружается только в development
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools),
  { ssr: false }
)

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
 * - refetchOnMount: false (trust SSR data)
 * - refetchOnWindowFocus: true
 * - Smart retry logic (only for 5xx/network errors)
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
 */
function RealtimeSync() {
  useRealtimeInvalidation()
  return null
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Use getQueryClient() for App Router pattern
  // - Server: creates new client per request (prevents data leakage)
  // - Browser: reuses singleton (prevents recreation during suspense)
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MutationErrorNotifier />
      <RealtimeSync />
      {children}
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
