import { useRef, useCallback } from 'react'

/**
 * Client-side rate limiter for action handlers. Returns a function that
 * wraps your handler: if the user fires it too fast, the wrapped call is
 * dropped and the optional `onLimit` callback is invoked.
 *
 * This is UX protection, not security. Anyone determined to spam can
 * bypass it by reloading or calling the API directly — server-side rate
 * limits (Supabase quotas, edge function rate limiting) are the real
 * defence. But this prevents accidental double-submits, burst clicks on
 * "send" buttons, and runaway loops in development.
 *
 * Usage:
 *   const limitedSend = useRateLimit(handleSend, { max: 5, windowMs: 10_000 })
 *   <button onClick={limitedSend}>Send</button>
 */
export function useRateLimit(handler, { max = 5, windowMs = 10_000, onLimit } = {}) {
    const callsRef = useRef([])

    return useCallback((...args) => {
        const now = Date.now()
        // Drop calls outside the rolling window.
        callsRef.current = callsRef.current.filter(t => now - t < windowMs)
        if (callsRef.current.length >= max) {
            onLimit?.()
            return
        }
        callsRef.current.push(now)
        return handler(...args)
    }, [handler, max, windowMs, onLimit])
}
