import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus within a container when active.
 * - On open: focuses the first focusable element
 * - Tab / Shift+Tab cycle within the container
 * - On close: returns focus to the element that triggered the overlay
 */
export function useFocusTrap(ref, active) {
    const previousFocus = useRef(null)

    useEffect(() => {
        if (!active || !ref.current) return

        // Save the currently focused element to restore later
        previousFocus.current = document.activeElement

        // Small delay to allow animations to settle / DOM to render
        const timer = setTimeout(() => {
            if (!ref.current) return
            const focusable = ref.current.querySelectorAll(FOCUSABLE_SELECTOR)
            if (focusable.length) focusable[0].focus()
        }, 50)

        function handleKeyDown(e) {
            if (e.key !== 'Tab' || !ref.current) return

            const focusable = ref.current.querySelectorAll(FOCUSABLE_SELECTOR)
            if (focusable.length === 0) return

            const first = focusable[0]
            const last = focusable[focusable.length - 1]

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        return () => {
            clearTimeout(timer)
            document.removeEventListener('keydown', handleKeyDown)
            // Restore focus to the trigger element
            if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
                previousFocus.current.focus()
            }
        }
    }, [active, ref])
}
