import { useId } from 'react'
import { clsx } from '../../utils/clsx'

export default function Select({
    label,
    error,
    options = [],
    placeholder = 'Select…',
    className = '',
    ...props
}) {
    const selectId = useId()
    const errorId = error ? `${selectId}-error` : undefined

    return (
        <div className="block space-y-2">
            {label && (
                <label htmlFor={selectId} className="text-sm font-bold text-slate-900 dark:text-slate-200">{label}</label>
            )}
            <select
                id={selectId}
                className={clsx(
                    'w-full h-12 rounded-lg border bg-white dark:bg-slate-800 px-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all focus-ring',
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-slate-700',
                    className
                )}
                aria-invalid={!!error}
                aria-describedby={errorId}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => {
                    const val = typeof opt === 'string' ? opt : opt.value
                    const optLabel = typeof opt === 'string' ? opt : opt.label
                    return <option key={val} value={val}>{optLabel}</option>
                })}
            </select>
            {error && <p id={errorId} className="text-xs text-red-500" role="alert">{error}</p>}
        </div>
    )
}
