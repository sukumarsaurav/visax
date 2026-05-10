import { useState } from 'react'
import { Link } from 'react-router-dom'

const notifications = [
    {
        id: 1,
        title: 'Action Required: Visa Application #4922',
        message: 'Additional financial documents are missing for the spousal visa application of Client J. Doe.',
        type: 'case',
        time: '2h ago',
        date: 'Today',
        read: false,
        urgent: true,
        actions: [
            { label: 'Upload Documents', primary: true },
            { label: 'View Case Details', primary: false }
        ]
    },
    {
        id: 2,
        title: 'Appointment Reminder: Consultation with Sarah Smith',
        message: 'Scheduled for tomorrow, Oct 25 at 10:00 AM EST via Zoom.',
        type: 'appointment',
        time: '4h ago',
        date: 'Today',
        read: false,
        urgent: false,
        actions: [
            { label: 'Join Meeting Link', primary: false },
            { label: 'Reschedule', primary: false }
        ]
    },
    {
        id: 3,
        title: 'New Message from Alejandro Rodriguez',
        message: '"Hello, I have a question regarding the I-140 form status..."',
        type: 'message',
        time: '5h ago',
        date: 'Today',
        read: false,
        urgent: false,
        actions: [
            { label: 'Reply to Message', primary: false, icon: 'arrow_forward' }
        ]
    },
    {
        id: 4,
        title: 'Payment Received: Invoice #INV-2023-001',
        message: 'Payment of $250.00 for "Initial Consultation" has been processed successfully.',
        type: 'payment',
        time: '1d ago',
        date: 'Yesterday',
        read: true,
        urgent: false,
        actions: [
            { label: 'Download Receipt', primary: false }
        ]
    },
    {
        id: 5,
        title: 'System Maintenance Scheduled',
        message: 'The portal will be undergoing scheduled maintenance on Oct 28 from 2:00 AM to 4:00 AM EST.',
        type: 'system',
        time: '1d ago',
        date: 'Yesterday',
        read: true,
        urgent: false,
        actions: []
    },
    {
        id: 6,
        title: 'Case Status Updated: Application #3847',
        message: 'The work permit application for Client M. Johnson has been approved by USCIS.',
        type: 'case',
        time: '2d ago',
        date: 'Oct 22, 2023',
        read: true,
        urgent: false,
        actions: [
            { label: 'View Details', primary: false }
        ]
    },
    {
        id: 7,
        title: 'New Client Registration',
        message: 'David Chen has registered as a new client and is awaiting initial consultation.',
        type: 'message',
        time: '3d ago',
        date: 'Oct 21, 2023',
        read: true,
        urgent: false,
        actions: [
            { label: 'View Profile', primary: false }
        ]
    }
]

const filterCategories = [
    { id: 'all', label: 'All Notifications', icon: 'notifications', count: 12 },
    { id: 'appointment', label: 'Appointments', icon: 'calendar_today', count: 3 },
    { id: 'case', label: 'Case Updates', icon: 'folder', count: 5 },
    { id: 'payment', label: 'Payments', icon: 'credit_card', count: 0 },
    { id: 'message', label: 'Messages', icon: 'chat', count: 2 },
    { id: 'system', label: 'System Alerts', icon: 'warning', count: 0 }
]

const getTypeConfig = (type) => {
    switch (type) {
        case 'case':
            return { icon: 'folder_open', bgColor: 'bg-primary/10', textColor: 'text-primary' }
        case 'appointment':
            return { icon: 'calendar_month', bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400' }
        case 'message':
            return { icon: 'chat_bubble', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-600 dark:text-green-400' }
        case 'payment':
            return { icon: 'payments', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', textColor: 'text-emerald-600 dark:text-emerald-400' }
        case 'system':
            return { icon: 'warning', bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400' }
        default:
            return { icon: 'notifications', bgColor: 'bg-slate-100', textColor: 'text-slate-500' }
    }
}

export default function NotificationsPage() {
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = activeFilter === 'all' || n.type === activeFilter
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    // Group notifications by date
    const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
        const date = notification.date
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(notification)
        return groups
    }, {})

    const unreadCount = notifications.filter(n => !n.read).length

    return (
        <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0">
                <div className="sticky top-4">
                    <div className="flex flex-col gap-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex flex-col gap-1 px-1">
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">Filters</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Manage alerts & updates</p>
                        </div>
                        <nav className="flex flex-col gap-1">
                            {filterCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveFilter(category.id)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${activeFilter === category.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-[20px] ${activeFilter === category.id ? 'icon-fill' : ''}`}>
                                            {category.icon}
                                        </span>
                                        <span className={`text-sm ${activeFilter === category.id ? 'font-bold' : 'font-medium'}`}>
                                            {category.label}
                                        </span>
                                    </div>
                                    {category.count > 0 && (
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeFilter === category.id
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                            }`}>
                                            {category.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Help Card */}
                    <div className="mt-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Need Help?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                            Contact support if you're not receiving critical alerts for your cases.
                        </p>
                        <Link to="/help" className="text-primary text-sm font-bold hover:underline">Contact Support</Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-extrabold leading-tight">
                            Notifications Center
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                            Stay updated with your latest case activities, appointments, and alerts
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">done_all</span>
                            <span className="hidden sm:inline">Mark all as read</span>
                        </button>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            <span>Preferences</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="w-full">
                    <div className="relative w-full md:max-w-2xl">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notifications by client name, case ID, or type..."
                            className="w-full rounded-xl border-none bg-white dark:bg-slate-900 shadow-sm py-3.5 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 text-base font-medium"
                        />
                    </div>
                </div>

                {/* Mobile Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {filterCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveFilter(category.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === category.id
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            {category.label}
                            {category.count > 0 && ` (${category.count})`}
                        </button>
                    ))}
                </div>

                {/* Notifications List */}
                <div className="flex flex-col">
                    {Object.keys(groupedNotifications).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">notifications_off</span>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No notifications found</p>
                            <p className="text-slate-400 dark:text-slate-500 text-sm">Try a different filter or search term</p>
                        </div>
                    ) : (
                        Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                            <div key={date} className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">{date}</h3>
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        {date === 'Today' ? 'Oct 24, 2023' : date === 'Yesterday' ? 'Oct 23, 2023' : date}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {dateNotifications.map((notification) => {
                                        const typeConfig = getTypeConfig(notification.type)
                                        return (
                                            <div
                                                key={notification.id}
                                                className={`group relative flex flex-col sm:flex-row gap-4 p-5 rounded-xl transition-all ${notification.read
                                                        ? 'bg-slate-50 dark:bg-slate-800/50 opacity-80 hover:opacity-100'
                                                        : `bg-white dark:bg-slate-900 shadow-sm hover:shadow-md ${notification.urgent ? 'border-l-4 border-primary' : 'border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`
                                                    }`}
                                            >
                                                {/* Icon */}
                                                <div className="shrink-0">
                                                    <div className={`flex items-center justify-center size-12 rounded-full ${notification.read ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : `${typeConfig.bgColor} ${typeConfig.textColor}`}`}>
                                                        <span className="material-symbols-outlined">{typeConfig.icon}</span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex flex-col flex-1 gap-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className={`font-bold text-base ${notification.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {notification.urgent && (
                                                                    <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                                        Urgent
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={`text-sm mt-1 ${notification.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                                {notification.message}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs font-medium whitespace-nowrap ${notification.read ? 'text-slate-400' : 'text-primary'}`}>
                                                            {notification.time}
                                                        </span>
                                                    </div>

                                                    {/* Actions */}
                                                    {notification.actions.length > 0 && (
                                                        <div className="flex items-center gap-3 mt-3">
                                                            {notification.actions.map((action, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    className={`text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${action.primary
                                                                            ? 'bg-primary hover:bg-blue-600 text-white'
                                                                            : notification.read
                                                                                ? 'text-slate-500 hover:text-primary'
                                                                                : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                                        }`}
                                                                >
                                                                    {action.label}
                                                                    {action.icon && <span className="material-symbols-outlined text-sm">{action.icon}</span>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notification.read && (
                                                    <div className="absolute top-5 right-5 sm:static sm:top-auto sm:right-auto sm:self-center">
                                                        <div className={`size-2.5 bg-primary rounded-full ${notification.urgent ? 'ring-4 ring-primary/20' : ''}`}></div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Load More */}
                    {Object.keys(groupedNotifications).length > 0 && (
                        <div className="flex justify-center py-6">
                            <button className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                Load older notifications
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
