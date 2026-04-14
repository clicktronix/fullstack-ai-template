import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useAuth } from '@/ui/providers/AuthContext'
import type { AuthLayoutViewProps } from './interfaces'

export type AuthLayoutProps = {
  /** Where to redirect if user is already authenticated */
  redirectTo?: string
  /** Content to render */
  children: React.ReactNode
}

/**
 * Hook for AuthLayout component.
 * Handles authentication state and redirect logic for public auth pages.
 *
 * If user is already authenticated, redirects to dashboard.
 */
export function useAuthLayoutProps({
  redirectTo = '/admin/work-items',
  children,
}: AuthLayoutProps): AuthLayoutViewProps {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const handleRedirect = useCallback(() => {
    router.push(redirectTo)
  }, [router, redirectTo])

  // If authenticated and not loading, trigger redirect
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      handleRedirect()
    }
  }, [isAuthenticated, isLoading, handleRedirect])

  return {
    isLoading,
    isAuthenticated,
    children,
  }
}
