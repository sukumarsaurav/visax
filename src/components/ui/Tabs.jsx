import { clsx } from '../../utils/clsx'

/**
 * Reusable tab bar. Usage:
 *   <Tabs tabs={['overview','activity']} active={tab} onChange={setTab} />
 */
export default function Tabs({ tabs, active, onChange, className = '' }) {
    return (
        <div className={clsx('flex items-center gap-1 border-b border-slate-100 dark:border-slate-800', className)} role="tablist">
            {tabs.map((tab) => {
                const label = typeof tab === 'string' ? tab : tab.label
                const value = typeof tab === 'string' ? tab : tab.value
                const isActive = active === value
                return (
                    <button
                        key={value}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(value)}
                        className={clsx(
                            'px-4 py-2 text-sm font-medium capitalize transition-colors',
                            isActive
                                ? 'text-primary border-b-2 border-primary font-bold'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                        )}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}
