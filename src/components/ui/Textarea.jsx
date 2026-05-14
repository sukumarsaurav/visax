import { clsx } from '../../utils/clsx'

export default function Textarea({
    label,
    error,
    maxLength,
    className = '',
    value,
    ...props
}) {
    return (
        <label className="block space-y-2">
            {label && (
                <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{label}</span>
            )}
            <textarea
                value={value}
                className={clsx(
                    'w-full rounded-lg border bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none',
                    error
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 dark:border-slate-700',
                    className
                )}
                {...props}
            />
            <div className="flex justify-between">
                {error && <p className="text-xs text-red-500">{error}</p>}
                {maxLength && (
                    <p className="text-xs text-right text-slate-400 ml-auto">
                        {(value || '').length}/{maxLength}
                    </p>
                )}
            </div>
        </label>
    )
}
