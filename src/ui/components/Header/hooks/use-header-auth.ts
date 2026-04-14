import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useAuth } from '@/ui/providers/AuthContext'
import type { Locale } from '@/ui/providers/LocaleContext'
import { useLocale } from '@/ui/providers/LocaleContext'
import { useSignOut } from '@/ui/server-state/auth/mutations'

export type UseHeaderAuthReturn = {
  user: ReturnType<typeof useAuth>['user']
  isLoading: boolean
  isLoggingOut: boolean
  onLogout: () => void
  locale: Locale
  setLocale: (locale: Locale) => void
}

/**
 * Hook for managing authentication in Header
 * Handles logout and locale changes
 */
export function useHeaderAuth(): UseHeaderAuthReturn {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { mutate: signOutMutate, isPending: isLoggingOut } = useSignOut()
  const { locale, setLocale } = useLocale()

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
    locale,
    setLocale,
  }
}
