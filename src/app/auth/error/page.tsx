import { connection } from 'next/server'
import { Suspense } from 'react'
import { logger } from '@/lib/logger'
import { OAuthErrorView } from './_internal/ui/OAuthErrorView'

type SearchParams = Promise<{
  error?: string
  error_description?: string
}>

/**
 * OAuth Error Page (Server Component)
 *
 * Displays OAuth authentication errors.
 * Users are redirected here from /auth/callback/route.ts when auth fails.
 */
export default function OAuthErrorPage(props: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={null}>
      <OAuthErrorContent searchParams={props.searchParams} />
    </Suspense>
  )
}

async function OAuthErrorContent(props: { searchParams: SearchParams }) {
  await connection()
  const searchParams = await props.searchParams

  logger.error('[OAuth Error] Displaying error page:', {
    error: searchParams.error,
    description: searchParams.error_description,
  })

  return (
    <OAuthErrorView
      error={searchParams.error ?? 'unknown_error'}
      description={searchParams.error_description}
    />
  )
}
