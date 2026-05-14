import { clsx } from '../../utils/clsx'

export default function SearchInput({
    value,
    onChange,
    placeholder = 'Search…',
    className = '',
    ...props
}) {
    return (
        <div className={clsx('relative', className)}>
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]" aria-hidden="true">
                search
            </span>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary placeholder-slate-400 outline-none transition-all"
                aria-label={placeholder}
                {...props}
            />
        </div>
    )
}
