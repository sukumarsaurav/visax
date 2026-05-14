import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useAppointments } from '../../hooks/useAppointments'
import { formatDate, formatTime } from '../../utils/date'
const typeIcon = { video: 'videocam', phone: 'call', in_person: 'place' }
const statusColor = { upcoming: 'blue', completed: 'green', cancelled: 'slate', no_show: 'red' }

export default function AppointmentsPage() {
    const { appointments, loading } = useAppointments()

    return (
        <div className="flex flex-col gap-6">
            <header>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Appointments</h2>
                <p className="text-sm text-slate-500">{appointments.length} appointment{appointments.length !== 1 ? 's' : ''}</p>
            </header>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}
                </div>
            ) : appointments.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <span className="material-symbols-outlined text-[52px]">calendar_month</span>
                        <p className="font-semibold">No appointments yet</p>
                        <p className="text-sm">Browse services to book your first consultation</p>
                        <Button size="sm">Browse Services</Button>
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col gap-4">
                    {appointments.map(a => (
                        <Card key={a.id}>
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/20">
                                    <span className="material-symbols-outlined text-[24px] text-purple-600 dark:text-purple-400">
                                        {typeIcon[a.type] || 'event'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{a.title}</h3>
                                        <Badge variant={statusColor[a.status] || 'slate'}>{a.status}</Badge>
                                    </div>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(a.scheduled_at)} at {formatTime(a.scheduled_at)} · {a.duration_minutes} min
                                    </p>
                                    {a.consultant && (
                                        <p className="text-sm text-slate-500">With: <strong className="text-slate-700 dark:text-slate-300">{a.consultant.full_name}</strong></p>
                                    )}
                                    {a.meeting_link && a.status === 'upcoming' && (
                                        <a
                                            href={a.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">videocam</span>
                                            Join Meeting
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
