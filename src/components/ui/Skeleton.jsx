import { clsx } from '../../utils/clsx'

/**
 * Skeleton loading placeholder.
 * 
 * Variants:
 *   <Skeleton /> — single line (h-4)
 *   <Skeleton variant="card" /> — card-sized block (h-28)
 *   <Skeleton variant="row" /> — table row (h-12)
 *   <Skeleton variant="avatar" /> — circular (size-10)
 *   <Skeleton className="h-20 w-40" /> — custom size
 */
export default function Skeleton({ variant = 'line', count = 1, className = '' }) {
    const variants = {
        line: 'h-4 w-full rounded',
        card: 'h-28 w-full rounded-xl',
        row: 'h-12 w-full rounded-lg',
        avatar: 'size-10 rounded-full',
        text: 'h-3 w-3/4 rounded',
    }

    const items = Array.from({ length: count })

    return (
        <>
            {items.map((_, i) => (
                <div
                    key={i}
                    className={clsx(
                        'animate-pulse bg-slate-200 dark:bg-slate-800',
                        variants[variant],
                        className
                    )}
                    role="status"
                    aria-label="Loading"
                />
            ))}
        </>
    )
}
