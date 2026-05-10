import { useState } from 'react'
import Button from '../../components/ui/Button'

const appointments = [
    {
        id: 1,
        clientName: 'Sarah Jenkins',
        clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNEDi66eGzRJ4XdbSb5a3HA2J9t6UGn-vEqcA1wLAsBPoRYooBwozyCyiA-eHrygeQMRcf0akhdQmiiyjCYntidLRrfW3qI4P75FvDHXL2N7TsU4cPJrG9TWVhpkZh0FDiip7I4DkVXSa1acRdy2zIl1FA0CBuIjbw7Vgx0SE7TdMdE7L078lBkqEWrfV1i6v0jXleRSbF5YdXpO18UGg63kVHR5RsMOg9EIrOmiXYCran8jld4ZIDwmeJywWTLfQDhp15p4v5QVo',
        type: 'Initial Consultation',
        caseType: 'Student Visa',
        date: 'Today',
        time: '10:00 AM - 11:00 AM',
        mode: 'video',
        status: 'upcoming'
    },
    {
        id: 2,
        clientName: 'Michael Chen',
        clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlAnchK3o6PZQArYdvZx9g4f21B3-qKwWvx99pxzfCYv196c50YJ1oCNLxIegLuMX-9WZF2LEjG-A0YGkajn5BhRPLjAYlD0N_O_volsg87sNjEdfcIjD8PqkpGks4fDHHR6Rfxl5ttopxAcbCZ6rmnyoaXcfnQ-msnGoyE70AetScJYNiLJ2eunPjy_CsG510CJvS6orNSA0BpKC2_T0lsRqc4HaT_qY_Gpc5b5VIikDfqW5FOzmrBUTH9oiKfqtrF2L5ckMG8u4',
        type: 'Follow-up Meeting',
        caseType: 'Skilled Worker',
        date: 'Today',
        time: '2:00 PM - 2:30 PM',
        mode: 'in-person',
        status: 'upcoming'
    },
    {
        id: 3,
        clientName: 'Elena Rodriguez',
        clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_QqhFD3qjUqZnVWfDZl5aq4DMMtmKK5sxBuGt4WcdeVfMxLHo3IrkZVEw5Uq6otKxGI5QQPXOg1cY3wSjIKWuWF1Xav-4RK7dwwJ5xTjTZmUsfku0gpBRO_z9VWzZStQQohIYfvpfwCVmSu-rGCK7YiFStrLS-NU8bIXqxBLf5MfoKBeIjkBMLdKcq2Q8_SecxViBKZba77p3eVd4Vp8_G-nq9krPfJvM5Z9GwGcWARQ0zIUwtW3Pi0TVqvYA9Mjl78glXOol-Fs',
        type: 'Document Review',
        caseType: 'Family Sponsorship',
        date: 'Tomorrow',
        time: '11:00 AM - 12:00 PM',
        mode: 'video',
        status: 'upcoming'
    },
    {
        id: 4,
        clientName: 'David Smith',
        clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDknjbKrqVgKLMzErVgV8hOgKRvUKE0UTjzC2QydgRXonWVQg86bmcOZ8w95IFKgWtH8KvtaNShQwj--d2AoFe5vlR9GbU8VmDAEEwLu6r576pInRdVxetouQ7L7YGNot1yqL_9xxtq4ipyl4sB8zuJ-KjzlMC9GYQWBmZn0liUblk9NM-AHnWjRSyspn8Euibtb3ogXdSITXBjIz5M2HxLF-OWIHw9vl7XYgeC38doDHA_MttbP90u22OmHj3aHkvDpBRRNPbh3PM',
        type: 'Case Assessment',
        caseType: 'Express Entry',
        date: 'Oct 26',
        time: '3:00 PM - 4:00 PM',
        mode: 'video',
        status: 'upcoming'
    },
    {
        id: 5,
        clientName: 'James Wilson',
        clientAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArTvHy8gxpFLLbaFnBJ0bkc_PCfJGlXvIAGmZ8-dr9ggk4YBsuCiyUmykNIQnSOYpnU9tsMVH6yc-b54saVk-2lWJOFJkhoTi-Q8aSN2XjKId2fvLH_p9wxIqTRYeely-u9NawrkQdeyFCb8dmlVvQwLFmqRe2a9q7pSn8G-rhV4SktlomgUk4puS7hUgepby2crmGxAR-GoLLPAihWG69eEv7tzqiFyyKvtQUXqKZ2R37OiKN29cLTbZCcQ3rDFdwmKOiBLCGXZ4',
        type: 'Initial Consultation',
        caseType: 'Tourist Visa',
        date: 'Oct 20',
        time: '9:00 AM - 10:00 AM',
        mode: 'video',
        status: 'completed'
    }
]

const stats = {
    todayAppointments: 2,
    weekAppointments: 8,
    pendingRequests: 3,
    completedThisMonth: 24
}

export default function AppointmentsPage() {
    const [activeTab, setActiveTab] = useState('upcoming')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)

    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.caseType.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === 'all' || apt.status === activeTab
        return matchesSearch && matchesTab
    })

    const getStatusBadge = (status) => {
        switch (status) {
            case 'upcoming':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            case 'completed':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            case 'cancelled':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800'
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">
                        Appointments
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                        Manage and track all your client consultations.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon="calendar_month">Sync Calendar</Button>
                    <Button icon="add">New Appointment</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Today</p>
                        <span className="material-symbols-outlined text-blue-500 text-[20px]">today</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.todayAppointments}</p>
                        <span className="text-slate-500 text-xs font-normal">appointments</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">This Week</p>
                        <span className="material-symbols-outlined text-purple-500 text-[20px]">date_range</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.weekAppointments}</p>
                        <span className="text-slate-500 text-xs font-normal">scheduled</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Requests</p>
                        <span className="material-symbols-outlined text-amber-500 text-[20px]">pending_actions</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.pendingRequests}</p>
                        <span className="text-amber-600 text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">Needs action</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">This Month</p>
                        <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.completedThisMonth}</p>
                        <span className="text-slate-500 text-xs font-normal">completed</span>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    {['upcoming', 'completed', 'all'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition ${activeTab === tab
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === 'upcoming' && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                    {appointments.filter(a => a.status === 'upcoming').length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text"
                            placeholder="Search appointments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <button className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                </div>
            </div>

            {/* Appointments List */}
            <div className="flex flex-col gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">event_busy</span>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No appointments found</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Client Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div
                                    className="bg-center bg-no-repeat bg-cover rounded-full size-14 flex-shrink-0"
                                    style={{ backgroundImage: `url("${appointment.clientAvatar}")` }}
                                ></div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-slate-900 dark:text-white font-bold text-base">{appointment.clientName}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(appointment.status)}`}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm">{appointment.type}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{appointment.caseType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Date/Time */}
                            <div className="flex items-center gap-6 md:gap-8">
                                <div className="flex flex-col items-start md:items-center gap-1">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                        <span className="text-sm font-medium">{appointment.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        <span className="text-sm">{appointment.time}</span>
                                    </div>
                                </div>

                                {/* Mode Badge */}
                                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${appointment.mode === 'video'
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-[18px]">
                                        {appointment.mode === 'video' ? 'videocam' : 'storefront'}
                                    </span>
                                    <span className="text-sm font-medium capitalize">{appointment.mode === 'video' ? 'Video Call' : 'In-Person'}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {appointment.status === 'upcoming' && appointment.mode === 'video' && (
                                        <Button>
                                            <span className="material-symbols-outlined text-[18px] mr-1">videocam</span>
                                            Join
                                        </Button>
                                    )}
                                    <button
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                        title="Reschedule"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
                                    </button>
                                    <button
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pending Requests Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                            <span className="material-symbols-outlined">pending_actions</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pending Requests</h2>
                            <p className="text-sm text-slate-500">Clients waiting for appointment confirmation</p>
                        </div>
                    </div>
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2.5 py-1 rounded-full text-sm font-bold">
                        {stats.pendingRequests} pending
                    </span>
                </div>
                <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">New Client Request #{i}</p>
                                    <p className="text-sm text-slate-500">Initial Consultation • Requested for next week</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="secondary">Decline</Button>
                                <Button>Accept</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
