import { memo } from 'react'
import { clsx } from '../../utils/clsx'

const iconColors = {
    primary: 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400',
    green:   'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple:  'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange:  'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    slate:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    red:     'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
}

export default memo(function StatCard({
    label,
    title,       // alias for label
    value,
    icon,
    trend,
    trendLabel,
    subtitle,    // small text below value
    iconColor = 'primary',
    color,       // alias for iconColor
    className = ''
}) {
    // Normalise aliases
    label = label || title
    iconColor = color || iconColor
    const isPositiveTrend = trend && trend > 0

    return (
        <div
            className={clsx(
                'flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                {icon && (
                    <div className={clsx('flex size-8 items-center justify-center rounded-lg', iconColors[iconColor])}>
                        <span className="material-symbols-outlined text-lg" aria-hidden="true">{icon}</span>
                    </div>
                )}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                {trend !== undefined && (
                    <span
                        className={clsx(
                            'flex items-center text-xs font-semibold',
                            isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}
                    >
                        <span className="material-symbols-outlined mr-0.5 text-sm">
                            {isPositiveTrend ? 'trending_up' : 'trending_down'}
                        </span>
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            {(trendLabel || subtitle) && (
                <p className="text-xs text-slate-400 dark:text-slate-500">{trendLabel || subtitle}</p>
            )}
        </div>
    )
})
