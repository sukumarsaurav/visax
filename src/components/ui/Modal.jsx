import { useEffect, useRef } from 'react'
import { clsx } from '../../utils/clsx'
import { useFocusTrap } from '../../hooks/useFocusTrap'

/**
 * Centered modal dialog with backdrop, Escape to close, ARIA support,
 * and smooth enter/exit animations.
 */
export default function Modal({
    open,
    onClose,
    title,
    children,
    maxWidth = 'max-w-md',
    className = '',
}) {
    const modalRef = useRef(null)
    useFocusTrap(modalRef, open)

    useEffect(() => {
        if (!open) return
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

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
                'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200',
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Dialog'}
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Content */}
            <div
                ref={modalRef}
                className={clsx(
                    'relative w-full rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200',
                    open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-2',
                    maxWidth,
                    className
                )}
            >
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            aria-label="Close dialog"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                )}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}
