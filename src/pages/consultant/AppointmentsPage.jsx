import { useState, useMemo } from 'react'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useAppointments } from '../../hooks/useAppointments'
import { createZoomMeeting } from '../../lib/integrations'
import { formatDate, formatTime } from '../../utils/date'

const TYPE_ICON = { video: 'videocam', phone: 'call', in_person: 'place' }
const TYPE_LABEL = { video: 'Video Call', phone: 'Phone Call', in_person: 'In Person' }
const STATUS_COLOR = { upcoming: 'blue', completed: 'green', cancelled: 'slate', no_show: 'red' }
export default function AppointmentsPage() {
    const { appointments, loading, updateAppointment, createAppointment } = useAppointments()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [searchQuery, setSearchQuery] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ title: '', scheduled_at: '', duration_minutes: 60, type: 'video', notes: '' })
    const [saving, setSaving] = useState(false)
    const [zoomLoading, setZoomLoading] = useState(null)

    const filtered = useMemo(() => appointments.filter(a => {
        const name = a.client?.full_name?.toLowerCase() || ''
        const title = a.title?.toLowerCase() || ''
        const q = searchQuery.toLowerCase()
        const matchesSearch = name.includes(q) || title.includes(q)
        if (activeTab === 'upcoming') return matchesSearch && a.status === 'upcoming'
        if (activeTab === 'completed') return matchesSearch && a.status === 'completed'
        if (activeTab === 'cancelled') return matchesSearch && ['cancelled', 'no_show'].includes(a.status)
        return matchesSearch
    }), [appointments, activeTab, searchQuery])

    const todayCount = appointments.filter(a => {
        const d = new Date(a.scheduled_at)
        return d.toDateString() === new Date().toDateString() && a.status === 'upcoming'
    }).length

    const weekCount = appointments.filter(a => {
        const d = new Date(a.scheduled_at)
        const now = new Date()
        const end = new Date(now); end.setDate(now.getDate() + 7)
        return d >= now && d <= end && a.status === 'upcoming'
    }).length

    const handleCreateZoom = async (appt) => {
        setZoomLoading(appt.id)
        const result = await createZoomMeeting({
            topic: appt.title,
            start_time: appt.scheduled_at,
            duration_minutes: appt.duration_minutes,
            booking_id: appt.id,
        })
        if (result?.join_url) {
            await updateAppointment(appt.id, { meeting_link: result.join_url })
        }
        setZoomLoading(null)
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setSaving(true)
        await createAppointment(formData)
        setFormData({ title: '', scheduled_at: '', duration_minutes: 60, type: 'video', notes: '' })
        setShowForm(false)
        setSaving(false)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Appointments</h1>
                    <p className="text-slate-500 mt-1">Manage your client consultations and meetings.</p>
                </div>
                <Button icon="add" onClick={() => setShowForm(true)}>Schedule Appointment</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Today's Appointments", value: todayCount, icon: 'today', color: 'text-primary' },
                    { label: 'This Week', value: weekCount, icon: 'date_range', color: 'text-purple-500' },
                    { label: 'Total Upcoming', value: appointments.filter(a => a.status === 'upcoming').length, icon: 'schedule', color: 'text-amber-500' },
                    { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: 'check_circle', color: 'text-emerald-500' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                            <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? <span className="inline-block w-8 h-6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* New Appointment Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Schedule New Appointment</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Title / Subject</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="e.g. Initial Consultation"
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Date & Time</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        value={formData.scheduled_at}
                                        onChange={e => setFormData(p => ({ ...p, scheduled_at: e.target.value }))}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Duration (min)</label>
                                    <select
                                        value={formData.duration_minutes}
                                        onChange={e => setFormData(p => ({ ...p, duration_minutes: Number(e.target.value) }))}
                                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                                    >
                                        {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Meeting Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                                >
                                    <option value="video">Video Call</option>
                                    <option value="phone">Phone Call</option>
                                    <option value="in_person">In Person</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Notes (optional)</label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs + Search */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex gap-1">
                    {[
                        { id: 'upcoming', label: 'Upcoming' },
                        { id: 'completed', label: 'Completed' },
                        { id: 'cancelled', label: 'Cancelled' },
                        { id: 'all', label: 'All' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-primary text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >{tab.label}</button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by client or title..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    ))
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined text-[48px]">event_busy</span>
                        <p className="text-sm font-medium">No appointments in this category</p>
                    </div>
                ) : filtered.map(appt => (
                    <div key={appt.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0 w-24 text-center">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider">{formatDate(appt.scheduled_at)}</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{formatTime(appt.scheduled_at)}</p>
                            <p className="text-xs text-slate-400">{appt.duration_minutes} min</p>
                        </div>

                        <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 hidden md:block" />

                        <div className="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[20px]">{TYPE_ICON[appt.type] || 'event'}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{appt.title}</p>
                            <div className="flex items-center gap-3 mt-1">
                                {appt.client && (
                                    <div className="flex items-center gap-1.5">
                                        <Avatar src={appt.client.avatar_url} alt={appt.client.full_name} size="xs" />
                                        <span className="text-xs text-slate-500">{appt.client.full_name}</span>
                                    </div>
                                )}
                                <span className="text-xs text-slate-400">{TYPE_LABEL[appt.type]}</span>
                            </div>
                            {appt.notes && <p className="text-xs text-slate-400 mt-1 truncate">{appt.notes}</p>}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge variant={STATUS_COLOR[appt.status]}>{appt.status}</Badge>

                            {appt.status === 'upcoming' && (
                                <>
                                    {appt.meeting_link ? (
                                        <a
                                            href={appt.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-600"
                                        >
                                            <span className="material-symbols-outlined text-base">videocam</span>
                                            Join
                                        </a>
                                    ) : appt.type === 'video' ? (
                                        <button
                                            onClick={() => handleCreateZoom(appt)}
                                            disabled={zoomLoading === appt.id}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            {zoomLoading === appt.id ? 'Creating...' : 'Create Zoom'}
                                        </button>
                                    ) : null}
                                    <button
                                        onClick={() => updateAppointment(appt.id, { status: 'completed' })}
                                        className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                                        title="Mark completed"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </button>
                                    <button
                                        onClick={() => updateAppointment(appt.id, { status: 'cancelled' })}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                        title="Cancel"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
