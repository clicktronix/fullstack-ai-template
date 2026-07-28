import { useAuth } from '@/modules/identity/ui'

/**
 * Hook for ProfileView
 */
export function useProfileViewProps() {
  const { user } = useAuth()

  return {
    user: user ?? null,
    error: null,
  }
}
