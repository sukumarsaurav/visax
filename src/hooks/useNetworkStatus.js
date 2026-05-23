import { useEffect, useState } from 'react'

/**
 * Tracks the browser's online/offline state.
 *
 * Note: `navigator.onLine` is best-effort — it tells you whether the
 * browser believes it has a network connection, not whether your server
 * is actually reachable. Use it for UX hints ("You appear to be offline"),
 * not as a substitute for proper request retry / error handling.
 *
 * Pair with a periodic ping if you need stronger guarantees.
 */
export function useNetworkStatus() {
    const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

    useEffect(() => {
        if (typeof window === 'undefined') return
        const goOnline  = () => setOnline(true)
        const goOffline = () => setOnline(false)
        window.addEventListener('online',  goOnline)
        window.addEventListener('offline', goOffline)
        return () => {
            window.removeEventListener('online',  goOnline)
            window.removeEventListener('offline', goOffline)
        }
    }, [])

    return online
}
