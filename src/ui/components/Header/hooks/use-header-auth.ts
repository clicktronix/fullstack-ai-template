import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useAuth } from '@/ui/providers/AuthContext'
import { useSignOut } from '@/ui/server-state/auth/mutations'

export type UseHeaderAuthReturn = {
  user: ReturnType<typeof useAuth>['user']
  isLoading: boolean
  isLoggingOut: boolean
  onLogout: () => void
}

/**
 * Hook for managing authentication in Header
 * Handles logout state and navigation
 */
export function useHeaderAuth(): UseHeaderAuthReturn {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { mutate: signOutMutate, isPending: isLoggingOut } = useSignOut()

  const handleLogout = useCallback(() => {
    signOutMutate(undefined, {
      onSettled: () => {
        router.push('/login')
      },
    })
  }, [signOutMutate, router])

  return {
    user,
    isLoading,
    isLoggingOut,
    onLogout: handleLogout,
  }
}
