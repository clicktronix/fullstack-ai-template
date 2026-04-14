import { useAuth } from '@/ui/providers/AuthContext'

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
