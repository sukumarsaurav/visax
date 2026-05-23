import { useEffect, useRef, useCallback } from 'react'

/**
 * Returns an `AbortSignal` whose lifetime matches the component's mount.
 * Pass it to fetch / signed-url / repo calls so in-flight requests are
 * cancelled when the component unmounts, preventing:
 *   - setState-on-unmounted-component warnings
 *   - wasted bandwidth on stale navigation
 *   - race conditions where late responses overwrite newer state
 *
 * Usage:
 *   const getSignal = useAbortable()
 *   useEffect(() => {
 *     const signal = getSignal()
 *     fetch(url, { signal })
 *       .then(...)
 *       .catch(e => { if (e.name !== 'AbortError') ... })
 *   }, [])
 */
export function useAbortable() {
    const controllerRef = useRef(null)

    // Call to get the current signal (lazily creates a controller).
    const getSignal = useCallback(() => {
        if (!controllerRef.current) controllerRef.current = new AbortController()
        return controllerRef.current.signal
    }, [])

    useEffect(() => {
        return () => {
            controllerRef.current?.abort()
        }
    }, [])

    return getSignal
}

/**
 * Variant that resets the signal each time a dependency changes — useful
 * when you want to abort the previous request before starting a new one
 * (e.g. when search text changes).
 *
 *   const getSignal = useResettableAbortable([searchQuery])
 */
export function useResettableAbortable(deps = []) {
    const controllerRef = useRef(null)

    const getSignal = useCallback(() => {
        controllerRef.current?.abort()
        controllerRef.current = new AbortController()
        return controllerRef.current.signal
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    useEffect(() => {
        return () => controllerRef.current?.abort()
    }, [])

    return getSignal
}
