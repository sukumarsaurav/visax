import { useState, useEffect, useCallback } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { clsx } from '../../utils/clsx'
import { navItems } from '../../data/navConfig'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const logoConfig = {
    client:        { name: 'VisaX', subtitle: 'Client Portal',    icon: 'flight_takeoff' },
    individual:    { name: 'VisaX', subtitle: 'Professional Portal', icon: 'flight_takeoff' },
    agency_admin:  { name: 'VisaX', subtitle: 'Agency Console',   icon: 'business' },
    agency_member: { name: 'VisaX', subtitle: 'Team Portal',      icon: 'groups' },
    admin:         { name: 'VisaX', subtitle: 'Admin Dashboard',  icon: 'flight_takeoff' },
}

const rootPaths = ['/client', '/consultant', '/agency', '/team-member', '/admin']

const STORAGE_KEY = 'visax-sidebar-groups'

function getStoredGroupState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function NavItem({ item }) {
    return (
        <NavLink
            key={item.path}
            to={item.path}
            end={rootPaths.includes(item.path)}
            className={({ isActive }) =>
                clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors text-sm font-medium',
                    isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )
            }
            aria-current={({ isActive }) => isActive ? 'page' : undefined}
        >
            <div className="relative flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{item.icon}</span>
                {item.badge && (
                    <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                )}
            </div>
            <span className="flex-1">{item.label}</span>
            {item.badgeCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-red-100 text-[10px] font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    {item.badgeCount}
                </span>
            )}
        </NavLink>
    )
}

function NavGroup({ group, items, collapsed, onToggle }) {
    const location = useLocation()
    const isAnyActive = items.some(item => location.pathname === item.path)

    return (
        <div>
            <button
                onClick={onToggle}
                className={clsx(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors',
                    isAnyActive
                        ? 'text-primary'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                )}
                aria-expanded={!collapsed}
            >
                <span>{group}</span>
                <span className={clsx(
                    'material-symbols-outlined text-[16px] transition-transform duration-200',
                    collapsed ? '' : 'rotate-180'
                )} aria-hidden="true">expand_more</span>
            </button>
            <div className={clsx(
                'flex flex-col gap-0.5 overflow-hidden transition-all duration-200',
                collapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
            )}>
                {items.map(item => <NavItem key={item.path} item={item} />)}
            </div>
        </div>
    )
}

export default function Sidebar({ userType = 'client', consultantType = null, user }) {
    const navigate = useNavigate()
    const { signOut } = useAuth()

    const navKey = userType === 'consultant' && consultantType ? consultantType : userType
    const items = navItems[navKey] || navItems[userType] || []
    const logoKey = navKey in logoConfig ? navKey : userType
    const logo = logoConfig[logoKey] || logoConfig.client

    const [collapsedGroups, setCollapsedGroups] = useState(() => getStoredGroupState())

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsedGroups))
    }, [collapsedGroups])

    const toggleGroup = useCallback((groupName) => {
        setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }))
    }, [])

    const handleLogout = useCallback(async () => {
        const { error } = await signOut()
        if (error) toast.error('Failed to log out')
        else {
            toast.success('Logged out successfully')
            navigate('/login')
        }
    }, [signOut, navigate])

    return (
        <aside className="hidden w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex" aria-label="Main navigation">
            <div className="flex flex-col gap-6">
                {/* Logo */}
                <div className="flex items-center gap-3 px-2 py-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                        <span className="material-symbols-outlined material-filled !text-xl">
                            {logo.icon}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-black leading-tight text-slate-900 dark:text-white tracking-tight">
                            {logo.name}
                        </h1>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {logo.subtitle}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1">
                    {items.map((item, idx) => {
                        // Grouped items (admin)
                        if (item.group) {
                            return (
                                <NavGroup
                                    key={item.group}
                                    group={item.group}
                                    items={item.items}
                                    collapsed={!!collapsedGroups[item.group]}
                                    onToggle={() => toggleGroup(item.group)}
                                />
                            )
                        }
                        // Flat items
                        return <NavItem key={item.path} item={item} />
                    })}
                </nav>
            </div>

            {/* User Profile & Logout */}
            <div className="flex flex-col gap-3">
                {user && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                        <Avatar src={user.avatar_url} alt={user.full_name} size="md" />
                        <div className="flex min-w-0 flex-col">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
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
    )
}
