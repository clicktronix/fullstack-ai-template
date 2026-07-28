import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useSignOut } from '@/modules/identity/client'
import { useAuth } from '@/modules/identity/ui'

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
