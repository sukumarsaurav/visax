import { clsx } from '../../utils/clsx'

const sizes = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
    xl: 'size-20'
}

export default function Avatar({ src, alt, size = 'md', className = '' }) {
    return (
        <div
            className={clsx(
                'relative rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0',
                sizes[size],
                className
            )}
            role="img"
            aria-label={alt || 'User avatar'}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || ''}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined" aria-hidden="true">person</span>
                </div>
            )}
        </div>
    )
}
