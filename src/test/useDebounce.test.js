import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '../hooks/useDebounce'

describe('useDebounce', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 300))
        expect(result.current).toBe('initial')
    })

    it('does not update value before delay elapses', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: 'first' },
        })
        rerender({ value: 'second' })
        act(() => { vi.advanceTimersByTime(299) })
        expect(result.current).toBe('first')
    })

    it('updates value after delay elapses', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: 'first' },
        })
        rerender({ value: 'second' })
        act(() => { vi.advanceTimersByTime(300) })
        expect(result.current).toBe('second')
    })

    it('resets the timer on rapid updates and only fires once', () => {
        const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: 'a' },
        })
        rerender({ value: 'b' })
        act(() => { vi.advanceTimersByTime(100) })
        rerender({ value: 'c' })
        act(() => { vi.advanceTimersByTime(100) })
        rerender({ value: 'd' })
        // Total elapsed: 200ms — timer reset each time, so debounced value still 'a'
        expect(result.current).toBe('a')
        act(() => { vi.advanceTimersByTime(300) })
        expect(result.current).toBe('d')
    })
})
