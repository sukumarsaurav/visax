import { useNetworkStatus } from '../hooks/useNetworkStatus'

/**
 * Slim banner that appears at the top of the viewport when the browser
 * goes offline. Mount once near the root.
 *
 * Why: silent network failures are confusing — users blame themselves or
 * the product. A persistent banner tells them "this isn't you" and
 * disappears the instant connectivity returns.
 */
export default function OfflineBanner() {
    const online = useNetworkStatus()
    if (online) return null

    return (
        <div className="fixed top-0 inset-x-0 z-[200] bg-amber-500 text-white text-sm font-semibold py-2 px-4 text-center shadow-lg animate-slide-down">
            <span className="material-symbols-outlined text-[18px] align-middle mr-1">wifi_off</span>
            You appear to be offline. Some actions may fail until your connection is restored.
        </div>
    )
}
