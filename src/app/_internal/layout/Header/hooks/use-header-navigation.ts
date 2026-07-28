import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export type UseHeaderNavigationReturn = {
  pathname: string
  createTabChangeHandler: (path: string) => () => void
}

/**
 * Hook for managing navigation in Header
 * Handles tab changes and routing
 */
export function useHeaderNavigation(): UseHeaderNavigationReturn {
  const router = useRouter()
  const pathname = usePathname()

  const createTabChangeHandler = useCallback(
    (path: string) => () => {
      router.push(path)
    },
    [router]
  )

  return {
    pathname,
    createTabChangeHandler,
  }
}
