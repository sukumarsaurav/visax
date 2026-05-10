import { clsx } from '../../utils/clsx'

export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={clsx(
                'rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={clsx('mb-4 flex items-center justify-between', className)}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={clsx('text-lg font-bold text-slate-900 dark:text-white', className)}>
            {children}
        </h3>
    )
}
