import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const SESSION_WARNING_MS = 5 * 60 * 1000   // 5 min before expiry
const RECENT_ACTIVITY_MS  = 10 * 60 * 1000  // active within last 10 min ⇒ silent refresh
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart']

/**
 * Single-purpose side-effect: schedules a session-expiry toast or silent
 * refresh based on user activity. Extracted from AuthContext so the
 * provider only owns auth state, not toast UX.
 *
 * `session` is the current Supabase session (null if logged out). The hook
 * re-schedules whenever the session changes (e.g. TOKEN_REFRESHED).
 */
export function useSessionWarning(session) {
    const warningTimerRef = useRef(null)
    const lastActivityRef = useRef(Date.now())

    // Track user activity passively.
    useEffect(() => {
        const handler = () => { lastActivityRef.current = Date.now() }
        ACTIVITY_EVENTS.forEach(e => document.addEventListener(e, handler, { passive: true }))
        return () => ACTIVITY_EVENTS.forEach(e => document.removeEventListener(e, handler))
    }, [])

    useEffect(() => {
        clearTimeout(warningTimerRef.current)
        if (!session?.expires_at) return

        const expiresAtMs = session.expires_at * 1000
        const delay = expiresAtMs - SESSION_WARNING_MS - Date.now()
        if (delay <= 0) return

        warningTimerRef.current = setTimeout(async () => {
            const idleMs = Date.now() - lastActivityRef.current
            if (idleMs < RECENT_ACTIVITY_MS) {
                // Active user — silently refresh.
                await supabase.auth.refreshSession()
                return
            }
            // Idle — surface a "Stay signed in" toast.
            toast((t) => (
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-500">timer</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Session expiring soon</p>
                        <p className="text-xs text-slate-500">Click to stay signed in</p>
                    </div>
                    <button
                        onClick={async () => { await supabase.auth.refreshSession(); toast.dismiss(t.id) }}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
                    >
                        Stay
                    </button>
                </div>
            ), { duration: 30000, position: 'top-right' })
        }, delay)

        return () => clearTimeout(warningTimerRef.current)
    }, [session?.expires_at])
}
