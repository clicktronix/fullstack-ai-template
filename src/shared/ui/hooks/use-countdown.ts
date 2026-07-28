import { useInterval } from '@mantine/hooks'
import { useCallback, useEffect, useState } from 'react'

/**
 * Countdown hook for rate limit retry delays.
 * Uses Mantine's useInterval internally.
 *
 * @param initialSeconds - Starting countdown value in seconds (null to disable)
 * @returns Object with remaining seconds and reset function
 *
 * @example
 * ```tsx
 * const { remaining, reset } = useCountdown(retryAfterSeconds)
 * const isDisabled = remaining > 0
 * ```
 */
export function useCountdown(initialSeconds: number | null | undefined) {
  const [remaining, setRemaining] = useState<number>(
    initialSeconds == null ? 0 : Math.max(0, initialSeconds)
  )

  const isActive = remaining > 0

  const interval = useInterval(() => {
    setRemaining((prev) => Math.max(0, prev - 1))
  }, 1000)

  // Start/stop interval based on active state.
  // `interval` is stable (useInterval returns stable object).
  // `isActive` is derived boolean -- effect only re-runs on active/inactive transitions.
  useEffect(() => {
    if (isActive) {
      interval.start()
    } else {
      interval.stop()
    }
    return interval.stop
  }, [isActive, interval])

  // Reset when initialSeconds changes.
  // useEffect is correct here: initialSeconds is a prop, and we need to sync
  // the derived countdown state when the parent provides a new value.
  useEffect(() => {
    if (initialSeconds == null) {
      setRemaining(0)
    } else {
      setRemaining(Math.max(0, initialSeconds))
    }
  }, [initialSeconds])

  const reset = useCallback(() => {
    if (initialSeconds == null) return
    setRemaining(Math.max(0, initialSeconds))
  }, [initialSeconds])

  return {
    /** Remaining seconds (0 when done) */
    remaining,
    /** Whether countdown is active */
    isActive,
    /** Reset countdown to initial value */
    reset,
  }
}
