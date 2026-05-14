import { useState, useEffect } from 'react'
import { clsx } from '../../utils/clsx'

function getInitialTheme() {
    if (typeof window === 'undefined') return 'light'
    const stored = localStorage.getItem('visax-theme')
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        localStorage.setItem('visax-theme', theme)
    }, [theme])

    function toggle() {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    return (
        <button
            onClick={toggle}
            className={clsx(
                'flex size-10 items-center justify-center rounded-full border transition-colors',
                'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary',
                'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
                className
            )}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
        </button>
    )
}
