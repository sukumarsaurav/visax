import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { clsx } from '../../utils/clsx'
import { navItems } from '../../data/navConfig'
import { useAuth } from '../../contexts/AuthContext'
import { useFocusTrap } from '../../hooks/useFocusTrap'

const RECENT_KEY = 'immizy-cmd-recent'
const MAX_RECENT = 5

function getRecent() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    } catch { return [] }
}

function saveRecent(item) {
    const recent = getRecent().filter(r => r.path !== item.path)
    recent.unshift({ label: item.label, path: item.path, icon: item.icon })
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

/**
 * Flatten grouped nav items into a searchable list.
 */
function flattenItems(items) {
    const flat = []
    for (const item of items) {
        if (item.group) {
            for (const child of item.items) flat.push(child)
        } else {
            flat.push(item)
        }
    }
    return flat
}

/**
 * Simple fuzzy match — checks if all characters of the query appear in order.
 */
function fuzzyMatch(text, query) {
    const lower = text.toLowerCase()
    const q = query.toLowerCase()
    let qi = 0
    for (let i = 0; i < lower.length && qi < q.length; i++) {
        if (lower[i] === q[qi]) qi++
    }
    return qi === q.length
}

export default function CommandPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [activeIndex, setActiveIndex] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()
    const inputRef = useRef(null)
    const containerRef = useRef(null)
    const { profile } = useAuth()

    useFocusTrap(containerRef, open)

    // Build searchable items from current user's nav
    const allItems = useMemo(() => {
        if (!profile?.role) return []
        const key = profile.consultant_type || profile.role
        const items = navItems[key] || navItems[profile.role] || []
        return flattenItems(items)
    }, [profile?.role, profile?.consultant_type])

    // Filter by query
    const filtered = useMemo(() => {
        if (!query.trim()) return []
        return allItems.filter(item => fuzzyMatch(item.label, query))
    }, [query, allItems])

    const recent = useMemo(() => getRecent(), [open])

    const results = query.trim() ? filtered : recent

    // Keyboard shortcut ⌘K / Ctrl+K
    useEffect(() => {
        function handleKey(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setOpen(v => !v)
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [])

    // Close on route change
    useEffect(() => {
        setOpen(false)
    }, [location.pathname])

    // Reset state on open
    useEffect(() => {
        if (open) {
            setQuery('')
            setActiveIndex(0)
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open])

    // Keep activeIndex in bounds
    useEffect(() => {
        setActiveIndex(0)
    }, [query])

    const selectItem = useCallback((item) => {
        saveRecent(item)
        navigate(item.path)
        setOpen(false)
    }, [navigate])

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            setOpen(false)
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[activeIndex]) {
            selectItem(results[activeIndex])
        }
    }

    // Platform detection for shortcut hint
    const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')
    const shortcutHint = isMac ? '⌘K' : 'Ctrl+K'

    return (
        <>
            {/* Trigger button in header */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-400 transition-colors hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 dark:hover:border-primary dark:hover:text-primary"
                aria-label="Search navigation"
            >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">search</span>
                <span className="hidden sm:inline">Search…</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                    {shortcutHint}
                </kbd>
            </button>

            {/* Palette overlay */}
            <div
                className={clsx(
                    'fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 transition-all duration-200',
                    open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                role="dialog"
                aria-modal="true"
                aria-label="Command palette"
                aria-hidden={!open}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />

                {/* Panel */}
                <div
                    ref={containerRef}
                    className={clsx(
                        'relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200',
                        open ? 'scale-100 translate-y-0' : 'scale-95 -translate-y-4'
                    )}
                    onKeyDown={handleKeyDown}
                >
                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]" aria-hidden="true">search</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search pages…"
                            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                            aria-label="Search pages"
                            autoComplete="off"
                        />
                        <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div className="max-h-[320px] overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                                <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                                    {query ? 'search_off' : 'schedule'}
                                </span>
                                <p className="text-sm">
                                    {query ? 'No pages found' : 'No recent pages'}
                                </p>
                            </div>
                        ) : (
                            <div role="listbox" aria-label="Results">
                                {!query.trim() && results.length > 0 && (
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent</p>
                                )}
                                {results.map((item, idx) => (
                                    <button
                                        key={item.path}
                                        role="option"
                                        aria-selected={idx === activeIndex}
                                        onClick={() => selectItem(item)}
                                        onMouseEnter={() => setActiveIndex(idx)}
                                        className={clsx(
                                            'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                                            idx === activeIndex
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                                            {item.icon || 'link'}
                                        </span>
                                        <span className="flex-1 font-medium">{item.label}</span>
                                        {idx === activeIndex && (
                                            <span className="text-[10px] text-slate-400">↵ Enter</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-[10px] text-slate-400">
                        <div className="flex items-center gap-3">
                            <span>↑↓ Navigate</span>
                            <span>↵ Select</span>
                            <span>ESC Close</span>
                        </div>
                        <span>Immizy Command Palette</span>
                    </div>
                </div>
            </div>
        </>
    )
}
