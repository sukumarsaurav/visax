import { useEffect, useRef } from 'react'

/**
 * Warns the user before they navigate away while there are unsaved
 * changes. Specifically:
 *
 *   • Browser-level: native `beforeunload` prompt on tab close / refresh /
 *     hard navigation. The browser dictates the wording; you can't custom-
 *     ise it, but the prompt does appear.
 *
 *   • SPA-level: NOT covered here. React Router v7 has its own
 *     `useBlocker` for client-side route changes — wrap that separately
 *     if you need both.
 *
 * Usage:
 *   const [dirty, setDirty] = useState(false)
 *   useUnsavedChangesGuard(dirty)
 *
 *   // mark dirty whenever the form changes:
 *   <input onChange={e => { setName(e.target.value); setDirty(true) }} />
 *
 *   // clear it after successful save / cancel:
 *   await save(); setDirty(false)
 */
export function useUnsavedChangesGuard(isDirty) {
    // Use a ref so we can update on every render without re-binding the listener.
    const dirtyRef = useRef(isDirty)
    dirtyRef.current = isDirty

    useEffect(() => {
        function handler(e) {
            if (!dirtyRef.current) return
            // Modern browsers ignore the returned message — they show a
            // generic warning — but we still need preventDefault + returnValue.
            e.preventDefault()
            e.returnValue = ''
            return ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [])
}
