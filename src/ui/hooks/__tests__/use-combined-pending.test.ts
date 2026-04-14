import { renderHook } from '@testing-library/react'
import { describe, test, expect } from 'bun:test'
import { useCombinedPending } from '../use-combined-pending'

describe('useCombinedPending', () => {
  test('returns false when all mutations are not pending', () => {
    const { result } = renderHook(() =>
      useCombinedPending({ isPending: false }, { isPending: false })
    )
    expect(result.current).toBe(false)
  })

  test('returns true when any mutation is pending', () => {
    const { result } = renderHook(() =>
      useCombinedPending({ isPending: false }, { isPending: true }, { isPending: false })
    )
    expect(result.current).toBe(true)
  })

  test('returns true when all mutations are pending', () => {
    const { result } = renderHook(() =>
      useCombinedPending({ isPending: true }, { isPending: true }, { isPending: true })
    )
    expect(result.current).toBe(true)
  })

  test('returns false with single non-pending mutation', () => {
    const { result } = renderHook(() => useCombinedPending({ isPending: false }))
    expect(result.current).toBe(false)
  })

  test('returns true with single pending mutation', () => {
    const { result } = renderHook(() => useCombinedPending({ isPending: true }))
    expect(result.current).toBe(true)
  })

  test('returns false with no mutations', () => {
    const { result } = renderHook(() => useCombinedPending())
    expect(result.current).toBe(false)
  })

  test('handles many mutations correctly', () => {
    const mutations = Array.from({ length: 10 }, (_, i) => ({
      isPending: i === 7, // Only mutation at index 7 is pending
    }))

    const { result } = renderHook(() => useCombinedPending(...mutations))
    expect(result.current).toBe(true)
  })

  test('updates when mutation state changes', () => {
    const mutation1 = { isPending: false }
    const mutation2 = { isPending: false }

    const { result, rerender } = renderHook(({ m1, m2 }) => useCombinedPending(m1, m2), {
      initialProps: { m1: mutation1, m2: mutation2 },
    })

    expect(result.current).toBe(false)

    // Simulate mutation starting
    rerender({ m1: { isPending: true }, m2: mutation2 })
    expect(result.current).toBe(true)

    // Simulate mutation completing
    rerender({ m1: { isPending: false }, m2: mutation2 })
    expect(result.current).toBe(false)
  })
})
