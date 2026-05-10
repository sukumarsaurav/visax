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
                'rounded-full bg-cover bg-center bg-slate-200 dark:bg-slate-700',
                sizes[size],
                className
            )}
            style={{ backgroundImage: src ? `url(${src})` : undefined }}
            title={alt}
        >
            {!src && (
                <div className="flex h-full w-full items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined">person</span>
                </div>
            )}
        </div>
    )
}
