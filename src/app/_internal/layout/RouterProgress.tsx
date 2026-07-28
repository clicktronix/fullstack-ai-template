'use client'

import { nprogress } from '@mantine/nprogress'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Tracks Next.js App Router navigation and triggers Mantine NProgress bar.
 *
 * Starts progress on pathname/searchParams change, completes after render.
 * Placed inside ClientProviders to access router hooks.
 */
export function RouterProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip first render (SSR → hydration, no navigation happened)
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // URL changed → complete progress (navigation finished)
    nprogress.complete()
  }, [pathname, searchParams])

  return null
}

/**
 * Call this before router.push() to start the progress bar.
 * Works with any navigation trigger (links, programmatic, filters).
 */
export function startNavigationProgress() {
  nprogress.start()
}
