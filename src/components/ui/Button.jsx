import { clsx } from '../../utils/clsx'

const variants = {
    primary: 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/30',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white',
    outline: 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30'
}

const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    className = '',
    disabled,
    ...props
}) {
    const isDisabled = disabled || loading

    return (
        <button
            className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all active:scale-[0.98] focus-ring',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isDisabled}
            {...props}
        >
            {loading && (
                <span className="material-symbols-outlined text-[18px] animate-spin" aria-hidden="true">progress_activity</span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{icon}</span>
            )}
            {children}
            {!loading && icon && iconPosition === 'right' && (
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{icon}</span>
            )}
        </button>
    )
}
