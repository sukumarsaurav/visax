import { NavLink } from 'react-router-dom'
import { clsx } from '../../utils/clsx'
import { navItems } from '../../data/navConfig'

const rootPaths = ['/client', '/consultant', '/agency', '/team-member', '/admin']

export default function MobileNav({ userType = 'client', consultantType = null, onMorePress }) {
    const navKey = userType === 'consultant' && consultantType ? consultantType : userType
    const allItems = navItems[navKey] || navItems[userType] || []
    // Show first 4 items + a "More" button to access the full drawer
    const items = allItems.slice(0, 4)
    const hasMore = allItems.length > 4

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:hidden"
            aria-label="Quick navigation"
        >
            {items.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={rootPaths.includes(item.path)}
                    className={({ isActive }) =>
                        clsx(
                            'flex flex-1 flex-col items-center gap-1 py-2.5 px-1 text-[10px] font-medium transition-colors',
                            isActive
                                ? 'text-primary'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        )
                    }
                >
                    <div className="relative">
                        <span className="material-symbols-outlined text-[22px]" aria-hidden="true">{item.icon}</span>
                        {item.badge && (
                            <span className="absolute -right-1 -top-1 flex h-2 w-2">
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </span>
                        )}
                    </div>
                    <span className="truncate max-w-[56px] text-center">{item.label}</span>
                </NavLink>
            ))}

            {/* "More" tab — opens MobileDrawerNav to access all features */}
            {hasMore && (
                <button
                    onClick={onMorePress}
                    className="flex flex-1 flex-col items-center gap-1 py-2.5 px-1 text-[10px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors"
                    aria-label="Show more navigation options"
                >
                    <span className="material-symbols-outlined text-[22px]" aria-hidden="true">more_horiz</span>
                    <span>More</span>
                </button>
            )}
        </nav>
    )
}
