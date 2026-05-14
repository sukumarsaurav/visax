import { Link } from 'react-router-dom'
import { useOutletContext } from 'react-router-dom'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useCases } from '../../hooks/useCases'
import { useAppointments } from '../../hooks/useAppointments'
import { useMessages } from '../../hooks/useMessages'
import { formatShortDate as formatDate, formatTime } from '../../utils/date'

const statusColor = {
    in_progress: 'blue', under_review: 'blue', draft: 'slate',
    docs_pending: 'amber', action_required: 'orange',
    approved: 'green', rejected: 'red', closed: 'slate',
}

function SkeletonCard() {
    return <div className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
}

export default function ConsultantDashboard() {
    const { profile } = useAuth()
    const context = useOutletContext()
    const consultantType = context?.consultantType || 'individual'

    const { cases, loading: casesLoading } = useCases()
    const { upcoming, loading: apptLoading } = useAppointments()
    const { conversations, unreadCount, loading: msgLoading } = useMessages()

    const activeCases = cases.filter(c => ['in_progress', 'under_review', 'docs_pending', 'action_required'].includes(c.status))
    const todayAppts = upcoming.filter(a => {
        const d = new Date(a.scheduled_at)
        const today = new Date()
        return d.toDateString() === today.toDateString()
    })

    const isAgency = consultantType === 'agency_admin'

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
                </h2>
                <p className="mt-1 text-slate-500">
                    {isAgency ? "Here's your agency overview for today" : "Here's your dashboard for today"}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {casesLoading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : (
                    <>
                        <StatCard title="Active Cases" value={activeCases.length} icon="folder_shared" color="primary" />
                        <StatCard title="Total Cases" value={cases.length} icon="work" color="slate" />
                        <StatCard title="Today" value={todayAppts.length} icon="calendar_month" color="purple" subtitle="Appointments" />
                        <StatCard title="Unread Msgs" value={unreadCount} icon="chat_bubble" color="amber" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Today's schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Appointments</CardTitle>
                        <Link to={`/${isAgency ? 'agency' : 'consultant'}/appointments`} className="text-xs font-bold text-primary hover:underline">View all →</Link>
                    </CardHeader>
                    {apptLoading ? (
                        <div className="space-y-3 mt-4">{[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>
                    ) : todayAppts.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                            <span className="material-symbols-outlined text-[40px]">event_available</span>
                            <p className="text-sm">No appointments today</p>
                        </div>
                    ) : todayAppts.map(a => (
                        <div key={a.id} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 mt-3">
                            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <span className="material-symbols-outlined text-[18px] text-purple-600">
                                    {a.type === 'video' ? 'videocam' : a.type === 'phone' ? 'call' : 'place'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{a.client?.full_name || a.title}</p>
                                <p className="text-xs text-slate-500">{formatTime(a.scheduled_at)} · {a.duration_minutes}min</p>
                            </div>
                            {a.meeting_link && (
                                <a href={a.meeting_link} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90">
                                    Join
                                </a>
                            )}
                        </div>
                    ))}
                </Card>

                {/* Active cases */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Cases</CardTitle>
                        <Link to={`/${isAgency ? 'agency' : 'consultant'}/cases`} className="text-xs font-bold text-primary hover:underline">View all →</Link>
                    </CardHeader>
                    {casesLoading ? (
                        <div className="space-y-3 mt-4">{[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>
                    ) : activeCases.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                            <span className="material-symbols-outlined text-[40px]">folder_open</span>
                            <p className="text-sm">No active cases</p>
                        </div>
                    ) : activeCases.slice(0, 4).map(c => (
                        <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 mt-3">
                            <Avatar src={c.client?.avatar_url} alt={c.client?.full_name} size="sm" />
                            <div className="flex-1 min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{c.client?.full_name || 'Client'}</p>
                                <p className="truncate text-xs text-slate-500">{c.title}</p>
                            </div>
                            <Badge variant={statusColor[c.status] || 'slate'}>
                                {c.status.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                    ))}
                </Card>
            </div>

            {/* Recent messages */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Messages</CardTitle>
                    <Link to={`/${isAgency ? 'agency' : 'consultant'}/messages`} className="text-xs font-bold text-primary hover:underline">View all →</Link>
                </CardHeader>
                {msgLoading ? (
                    <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 mt-4" />
                ) : conversations.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No messages yet</p>
                ) : (
                    <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                        {conversations.slice(0, 4).map(conv => (
                            <div key={conv.otherId} className="flex items-center gap-3 py-3">
                                <Avatar src={conv.other?.avatar_url} alt={conv.other?.full_name} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{conv.other?.full_name}</p>
                                    <p className="truncate text-xs text-slate-500">{conv.lastMessage?.content}</p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
