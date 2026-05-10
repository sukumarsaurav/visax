import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clsx } from '../../utils/clsx'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'

const typeConfig = {
    case_update:  { icon: 'folder_open',    bg: 'bg-primary/10',                              text: 'text-primary' },
    appointment:  { icon: 'calendar_month', bg: 'bg-purple-50 dark:bg-purple-900/20',          text: 'text-purple-600 dark:text-purple-400' },
    message:      { icon: 'chat_bubble',    bg: 'bg-green-50 dark:bg-green-900/20',            text: 'text-green-600 dark:text-green-400' },
    invoice:      { icon: 'payments',       bg: 'bg-emerald-50 dark:bg-emerald-900/20',        text: 'text-emerald-600 dark:text-emerald-400' },
    announcement: { icon: 'campaign',       bg: 'bg-amber-50 dark:bg-amber-900/20',            text: 'text-amber-600 dark:text-amber-400' },
    system:       { icon: 'info',           bg: 'bg-slate-100 dark:bg-slate-800',              text: 'text-slate-500' },
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

export default function Header({ title, children, className = '' }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const { profile } = useAuth()
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

    const notifPath = profile?.role === 'client'
        ? '/client/notifications'
        : profile?.role === 'agency_admin'
            ? '/agency/notifications'
            : profile?.role === 'agency_member'
                ? '/team-member/notifications'
                : '/consultant/notifications'

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header className={clsx(
            'sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:px-6',
            className
        )}>
            <div className="flex items-center gap-3">
                {title && <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>}
            </div>

            <div className="flex items-center gap-2">
                {children}

                {/* Notifications bell */}
                <div className="relative" ref={ref}>
                    <button
                        onClick={() => setOpen(v => !v)}
                        className={clsx(
                            'relative flex size-10 items-center justify-center rounded-full border transition-colors',
                            open
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        )}
                    >
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                        {unreadCount > 0 && (
                            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                    </button>

                    {open && (
                        <div className="absolute right-0 top-12 w-[360px] max-h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">{unreadCount}</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[380px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                                        <span className="material-symbols-outlined text-[40px]">notifications_none</span>
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : notifications.map(n => {
                                    const cfg = typeConfig[n.type] || typeConfig.system
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => markAsRead(n.id)}
                                            className={clsx(
                                                'flex w-full gap-3 border-b border-slate-50 p-4 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50',
                                                n.is_read && 'opacity-60'
                                            )}
                                        >
                                            <div className={clsx('flex size-10 flex-shrink-0 items-center justify-center rounded-full', cfg.bg, cfg.text)}>
                                                <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className={clsx('line-clamp-1 text-sm font-semibold', n.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white')}>
                                                    {n.title}
                                                </p>
                                                {n.body && (
                                                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                                                )}
                                                <span className={clsx('mt-1 block text-xs', n.is_read ? 'text-slate-400' : 'font-medium text-primary')}>
                                                    {timeAgo(n.created_at)}
                                                </span>
                                            </div>
                                            {!n.is_read && (
                                                <div className="mt-1 size-2 flex-shrink-0 self-start rounded-full bg-primary" />
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            <div className="border-t border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                                <Link
                                    to={notifPath}
                                    onClick={() => setOpen(false)}
                                    className="flex w-full items-center justify-center gap-2 py-1.5 text-sm font-bold text-primary hover:underline"
                                >
                                    View All
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
