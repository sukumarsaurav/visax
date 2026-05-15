import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { clsx } from '../../utils/clsx'
import { navItems } from '../../data/navConfig'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const logoConfig = {
    client:        { name: 'Immizy', subtitle: 'Client Portal',    icon: 'flight_takeoff' },
    individual:    { name: 'Immizy', subtitle: 'Professional Portal', icon: 'flight_takeoff' },
    agency_admin:  { name: 'Immizy', subtitle: 'Agency Console',   icon: 'business' },
    agency_member: { name: 'Immizy', subtitle: 'Team Portal',      icon: 'groups' },
    admin:         { name: 'Immizy', subtitle: 'Admin Dashboard',  icon: 'flight_takeoff' },
}

const rootPaths = ['/client', '/consultant', '/agency', '/team-member', '/admin']

/**
 * Mobile drawer navigation — slides in from left on small screens.
 * Provides access to ALL nav items, solving the MobileNav 5-item limit.
 */
export default function MobileDrawerNav({ open, onClose, userType = 'client', consultantType = null }) {
    const navigate = useNavigate()
    const { signOut, profile } = useAuth()

    const navKey = userType === 'consultant' && consultantType ? consultantType : userType
    const items = navItems[navKey] || navItems[userType] || []
    const logoKey = navKey in logoConfig ? navKey : userType
    const logo = logoConfig[logoKey] || logoConfig.client

    // Close on Escape
    useEffect(() => {
        if (!open) return
        function handleKeyDown(e) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    // Lock body scroll
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [open])

    async function handleLogout() {
        onClose()
        const { error } = await signOut()
        if (error) toast.error('Failed to log out')
        else {
            toast.success('Logged out successfully')
            navigate('/login')
        }
    }



    return (
        <div
            className={clsx(
                'fixed inset-0 z-50 md:hidden transition-all duration-300',
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            aria-hidden={!open}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <aside className={clsx(
                'absolute inset-y-0 left-0 w-72 flex flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out',
                open ? 'translate-x-0' : '-translate-x-full'
            )}>
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                            <span className="material-symbols-outlined material-filled text-lg">
                                {logo.icon}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-base font-black text-slate-900 dark:text-white">{logo.name}</h1>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{logo.subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close menu"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 overflow-y-auto p-3">
                    <div className="flex flex-col gap-1">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={rootPaths.includes(item.path)}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    clsx(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-sm font-medium',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    )
                                }
                            >
                                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                                <span className="flex-1">{item.label}</span>
                                {item.badge && (
                                    <span className="flex size-2 rounded-full bg-red-500" />
                                )}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User + Logout */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    {profile && (
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                            <Avatar src={profile.avatar_url} alt={profile.full_name} size="sm" />
                            <div className="flex min-w-0 flex-col">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{profile.full_name}</p>
                                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{profile.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400"
                    >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
                        Log Out
                    </button>
                </div>
            </aside>
        </div>
    )
}
