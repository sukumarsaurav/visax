import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { formatTime } from '../../utils/date'

const TYPE_ICON = {
    case: 'folder_shared',
    appointment: 'calendar_month',
    message: 'chat_bubble',
    announcement: 'campaign',
    payment: 'credit_card',
    system: 'info',
}
const TYPE_COLOR = {
    case: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    appointment: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
    message: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    announcement: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
    payment: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
    system: 'text-slate-500 bg-slate-100 dark:bg-slate-800',
}

export default function NotificationsPage() {
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead } = useNotifications()
    const [filter, setFilter] = useState('all')

    const filtered = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read
        if (filter === 'case') return n.type === 'case'
        if (filter === 'appointment') return n.type === 'appointment'
        if (filter === 'message') return n.type === 'message'
        return true
    })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifications</h1>
                    <p className="text-slate-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                    { id: 'case', label: 'Cases' },
                    { id: 'appointment', label: 'Appointments' },
                    { id: 'message', label: 'Messages' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === tab.id
                            ? 'bg-primary text-white'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                    >{tab.label}</button>
                ))}
            </div>

            {/* Notification List */}
            <div className="flex flex-col gap-2">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined text-[56px]">notifications_off</span>
                        <p className="text-base font-medium">No notifications here</p>
                    </div>
                ) : filtered.map(n => {
                    const typeKey = n.type || 'system'
                    const icon = TYPE_ICON[typeKey] || 'info'
                    const colorClass = TYPE_COLOR[typeKey] || TYPE_COLOR.system
                    return (
                        <div
                            key={n.id}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${n.is_read
                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-70'
                                : 'bg-blue-50/50 dark:bg-blue-900/5 border-blue-200 dark:border-blue-800/50 shadow-sm'
                            }`}
                        >
                            <div className={`flex-shrink-0 size-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className={`text-sm ${n.is_read ? 'font-medium text-slate-700 dark:text-slate-300' : 'font-bold text-slate-900 dark:text-white'}`}>
                                        {n.title}
                                    </p>
                                    <span className="text-xs text-slate-400 flex-shrink-0">{formatTime(n.created_at)}</span>
                                </div>
                                {n.body && (
                                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                                )}
                                {n.link && (
                                    <Link
                                        to={n.link}
                                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-primary hover:underline"
                                    >
                                        View details
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </Link>
                                )}
                            </div>
                            {!n.is_read && (
                                <div className="flex-shrink-0 size-2.5 rounded-full bg-primary mt-2" />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
