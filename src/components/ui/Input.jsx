import { clsx } from '../../utils/clsx'

export default function Input({
    label,
    icon,
    error,
    className = '',
    type = 'text',
    ...props
}) {
    return (
        <label className="block space-y-2">
            {label && (
                <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{label}</span>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">
                            {icon}
                        </span>
                    </div>
                )}
                <input
                    type={type}
                    className={clsx(
                        'w-full h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-base',
                        icon ? 'pl-11 pr-4' : 'px-4',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </label>
    )
}
