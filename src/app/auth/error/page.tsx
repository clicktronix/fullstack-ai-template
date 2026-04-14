import { logger } from '@/lib/logger'
import { OAuthErrorView } from './_internal/ui/OAuthErrorView'

// Force dynamic rendering - we need fresh query params on every request
export const dynamic = 'force-dynamic'

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
export default async function OAuthErrorPage(props: { searchParams: SearchParams }) {
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
