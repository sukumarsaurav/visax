import { clsx } from '../../utils/clsx'

export default function EmptyState({
    icon = 'folder_open',
    title = 'Nothing here yet',
    description,
    action,
    className = '',
}) {
    return (
        <div className={clsx('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
            <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600" aria-hidden="true">
                {icon}
            </span>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            {description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    )
}
