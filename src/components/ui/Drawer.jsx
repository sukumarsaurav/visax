import { useEffect, useRef } from 'react'
import { clsx } from '../../utils/clsx'
import { useFocusTrap } from '../../hooks/useFocusTrap'

/**
 * Slide-in drawer panel from the right.
 * Handles backdrop, Escape to close, accessibility, and smooth enter/exit animations.
 */
export default function Drawer({
    open,
    onClose,
    children,
    title,
    width = 'max-w-lg',
    className = '',
}) {
    const drawerRef = useRef(null)
    useFocusTrap(drawerRef, open)

    // Close on Escape key
    useEffect(() => {
        if (!open) return
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    return (
        <div
            className={clsx(
                'fixed inset-0 z-50 overflow-hidden transition-all duration-300',
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Panel'}
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                <div
                    ref={drawerRef}
                    className={clsx(
                        'w-screen flex flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out',
                        open ? 'translate-x-0' : 'translate-x-full',
                        width,
                        className
                    )}
                >
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                            <button
                                onClick={onClose}
                                className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                aria-label="Close panel"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
