import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, mock, test } from 'bun:test'
import { useCountdown } from '../use-countdown'

// Helper for waiting
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('useCountdown', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('initial state', () => {
    test('returns 0 when initialSeconds is null', () => {
      const { result } = renderHook(() => useCountdown(null))

      expect(result.current.remaining).toBe(0)
      expect(result.current.isActive).toBe(false)
    })

    test('returns 0 when initialSeconds is undefined', () => {
      const { result } = renderHook(() => useCountdown(undefined))

      expect(result.current.remaining).toBe(0)
      expect(result.current.isActive).toBe(false)
    })

    test('returns initial value when positive', () => {
      const { result } = renderHook(() => useCountdown(30))

      expect(result.current.remaining).toBe(30)
      expect(result.current.isActive).toBe(true)
    })

    test('returns 0 when initialSeconds is negative', () => {
      const { result } = renderHook(() => useCountdown(-5))

      expect(result.current.remaining).toBe(0)
      expect(result.current.isActive).toBe(false)
    })

    test('returns 0 when initialSeconds is 0', () => {
      const { result } = renderHook(() => useCountdown(0))

      expect(result.current.remaining).toBe(0)
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('countdown behavior', () => {
    test('decrements remaining every second', async () => {
      const { result } = renderHook(() => useCountdown(3))

      expect(result.current.remaining).toBe(3)

      // Wait for 1 second + buffer
      await act(async () => {
        await delay(1100)
      })

      await waitFor(() => {
        expect(result.current.remaining).toBe(2)
      })
    })

    test('stops at 0 and becomes inactive', async () => {
      const { result } = renderHook(() => useCountdown(2))

      expect(result.current.isActive).toBe(true)

      // Wait for countdown to complete
      await act(async () => {
        await delay(2200)
      })

      await waitFor(() => {
        expect(result.current.remaining).toBe(0)
        expect(result.current.isActive).toBe(false)
      })
    })
  })

  describe('reset function', () => {
    test('resets countdown to initial value', async () => {
      const { result } = renderHook(() => useCountdown(5))

      // Count down a bit
      await act(async () => {
        await delay(2100)
      })

      await waitFor(() => {
        expect(result.current.remaining).toBeLessThanOrEqual(3)
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.remaining).toBe(5)
      expect(result.current.isActive).toBe(true)
    })

    test('reset does nothing when initialSeconds is null', () => {
      const { result } = renderHook(() => useCountdown(null))

      act(() => {
        result.current.reset()
      })

      expect(result.current.remaining).toBe(0)
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('initialSeconds changes', () => {
    test('updates remaining when initialSeconds changes', () => {
      const { result, rerender } = renderHook(({ seconds }) => useCountdown(seconds), {
        initialProps: { seconds: 10 as number | null },
      })

      expect(result.current.remaining).toBe(10)

      // Change to new value
      rerender({ seconds: 20 })

      expect(result.current.remaining).toBe(20)
      expect(result.current.isActive).toBe(true)
    })

    test('resets to 0 when initialSeconds changes to null', () => {
      const { result, rerender } = renderHook(({ seconds }) => useCountdown(seconds), {
        initialProps: { seconds: 10 as number | null },
      })

      expect(result.current.remaining).toBe(10)

      rerender({ seconds: null })

      expect(result.current.remaining).toBe(0)
      expect(result.current.isActive).toBe(false)
    })
  })

  describe('stable function references', () => {
    test('reset function reference is stable across rerenders', () => {
      const { result, rerender } = renderHook(() => useCountdown(10))

      const firstReset = result.current.reset

      rerender()

      expect(result.current.reset).toBe(firstReset)
    })

    test('reset function reference updates when initialSeconds changes', () => {
      const { result, rerender } = renderHook(({ seconds }) => useCountdown(seconds), {
        initialProps: { seconds: 10 },
      })

      const firstReset = result.current.reset

      rerender({ seconds: 20 })

      // reset is memoized with initialSeconds as dependency
      expect(result.current.reset).not.toBe(firstReset)
    })
  })

  describe('cleanup', () => {
    test('stops interval on unmount', async () => {
      const { result, unmount } = renderHook(() => useCountdown(10))

      expect(result.current.isActive).toBe(true)

      unmount()

      // Should not throw or cause memory leaks
      await delay(100)
    })
  })
})
