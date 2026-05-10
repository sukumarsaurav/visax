import { useState } from 'react'
import Button from '../../components/ui/Button'

const teamMembers = [
    {
        id: 1,
        name: 'David Miller',
        role: 'Senior Consultant',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCy6KIAWrUMsjxtxFNjX_jCB5132_aib-hteTRpm6fY2g677c8ZxsLTLSsx6_Nb0FVnyBz7b7ukge6LYGuL9H2YF-CXF0T8FhzoZvfZf22vlhj1l-JN9FVkRGKPzoJI-6wJJw0dYpd8DnQbJuLxjL_2Fczsx0vpcLdzD1IQ5pcTWY1f5Ab0JuOSW_QyDDFLPn2tR3PElBf5jOabBBTj743vPDjS1pA-hUwUIX-8zfMqdR-iseBX85v4oDLiVXnToDOZNh1qxoF6WA',
        weeklyHours: 32,
        modes: ['Video', 'In-Person'],
        status: 'active',
        availability: [
            { dayIndex: 0, startSlot: 0, duration: 2 },
            { dayIndex: 0, startSlot: 4, duration: 3 },
            { dayIndex: 2, startSlot: 0, duration: 6 },
            { dayIndex: 4, startSlot: 0, duration: 3 }
        ]
    },
    {
        id: 2,
        name: 'Sarah Chen',
        role: 'Immigration Specialist',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNEDi66eGzRJ4XdbSb5a3HA2J9t6UGn-vEqcA1wLAsBPoRYooBwozyCyiA-eHrygeQMRcf0akhdQmiiyjCYntidLRrfW3qI4P75FvDHXL2N7TsU4cPJrG9TWVhpkZh0FDiip7I4DkVXSa1acRdy2zIl1FA0CBuIjbw7Vgx0SE7TdMdE7L078lBkqEWrfV1i6v0jXleRSbF5YdXpO18UGg63kVHR5RsMOg9EIrOmiXYCran8jld4ZIDwmeJywWTLfQDhp15p4v5QVo',
        weeklyHours: 40,
        modes: ['Video'],
        status: 'active',
        availability: [
            { dayIndex: 0, startSlot: 0, duration: 4 },
            { dayIndex: 1, startSlot: 0, duration: 4 },
            { dayIndex: 2, startSlot: 0, duration: 4 },
            { dayIndex: 3, startSlot: 0, duration: 4 },
            { dayIndex: 4, startSlot: 0, duration: 4 }
        ]
    },
    {
        id: 3,
        name: 'Michael Rodriguez',
        role: 'Visa Consultant',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlAnchK3o6PZQArYdvZx9g4f21B3-qKwWvx99pxzfCYv196c50YJ1oCNLxIegLuMX-9WZF2LEjG-A0YGkajn5BhRPLjAYlD0N_O_volsg87sNjEdfcIjD8PqkpGks4fDHHR6Rfxl5ttopxAcbCZ6rmnyoaXcfnQ-msnGoyE70AetScJYNiLJ2eunPjy_CsG510CJvS6orNSA0BpKC2_T0lsRqc4HaT_qY_Gpc5b5VIikDfqW5FOzmrBUTH9oiKfqtrF2L5ckMG8u4',
        weeklyHours: 24,
        modes: ['In-Person'],
        status: 'away',
        availability: [
            { dayIndex: 1, startSlot: 2, duration: 3 },
            { dayIndex: 3, startSlot: 2, duration: 3 },
            { dayIndex: 4, startSlot: 2, duration: 3 }
        ]
    },
    {
        id: 4,
        name: 'Emily Thompson',
        role: 'Document Specialist',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_QqhFD3qjUqZnVWfDZl5aq4DMMtmKK5sxBuGt4WcdeVfMxLHo3IrkZVEw5Uq6otKxGI5QQPXOg1cY3wSjIKWuWF1Xav-4RK7dwwJ5xTjTZmUsfku0gpBRO_z9VWzZStQQohIYfvpfwCVmSu-rGCK7YiFStrLS-NU8bIXqxBLf5MfoKBeIjkBMLdKcq2Q8_SecxViBKZba77p3eVd4Vp8_G-nq9krPfJvM5Z9GwGcWARQ0zIUwtW3Pi0TVqvYA9Mjl78glXOol-Fs',
        weeklyHours: 20,
        modes: ['Video', 'In-Person'],
        status: 'active',
        availability: [
            { dayIndex: 0, startSlot: 4, duration: 2 },
            { dayIndex: 2, startSlot: 4, duration: 2 },
            { dayIndex: 4, startSlot: 4, duration: 2 }
        ]
    }
]

const weekDays = [
    { day: 'Mon', date: 12 },
    { day: 'Tue', date: 13, isToday: true },
    { day: 'Wed', date: 14 },
    { day: 'Thu', date: 15 },
    { day: 'Fri', date: 16 },
    { day: 'Sat', date: 17, isWeekend: true },
    { day: 'Sun', date: 18, isWeekend: true }
]

const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM']

const memberColors = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-300' }
]

export default function TeamAvailabilityPage() {
    const [selectedMember, setSelectedMember] = useState(null)
    const [viewMode, setViewMode] = useState('combined') // 'combined' or 'individual'
    const [calendarView, setCalendarView] = useState('week')

    const totalWeeklyHours = teamMembers.reduce((sum, m) => sum + m.weeklyHours, 0)
    const activeMembers = teamMembers.filter(m => m.status === 'active').length

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500'
            case 'away': return 'bg-amber-500'
            default: return 'bg-slate-400'
        }
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">
                        Team Availability
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                        View and manage availability schedules for all team members.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon="download">Export Schedule</Button>
                    <Button icon="settings">Manage Defaults</Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">groups</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Team Members</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            {teamMembers.length} <span className="text-sm text-slate-400 font-normal">total</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Currently Active</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            {activeMembers} <span className="text-sm text-slate-400 font-normal">available</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Weekly Hours</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            {totalWeeklyHours} <span className="text-sm text-slate-400 font-normal">hrs</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined">event_available</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Avg. Hours/Member</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            {Math.round(totalWeeklyHours / teamMembers.length)} <span className="text-sm text-slate-400 font-normal">hrs</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Team Members Sidebar */}
                <div className="xl:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Members</h3>
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('combined')}
                                className={`px-2 py-1 text-xs font-medium rounded transition ${viewMode === 'combined'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setViewMode('individual')}
                                className={`px-2 py-1 text-xs font-medium rounded transition ${viewMode === 'individual'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500'
                                    }`}
                            >
                                Filter
                            </button>
                        </div>
                    </div>
                    <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
                        {teamMembers.map((member, idx) => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedMember === member.id
                                        ? 'bg-primary/10 border border-primary/20'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <div
                                        className="bg-center bg-no-repeat bg-cover rounded-full size-10"
                                        style={{ backgroundImage: `url("${member.avatar}")` }}
                                    ></div>
                                    <span className={`absolute bottom-0 right-0 size-3 ${getStatusColor(member.status)} border-2 border-white dark:border-slate-900 rounded-full`}></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                                        <div className={`size-3 rounded-full ${memberColors[idx % memberColors.length].bg} ${memberColors[idx % memberColors.length].border} border-2`}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{member.role}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{member.weeklyHours}h</p>
                                    <p className="text-xs text-slate-400">/week</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Legend</p>
                        <div className="space-y-2">
                            {teamMembers.map((member, idx) => (
                                <div key={member.id} className="flex items-center gap-2">
                                    <div className={`size-3 rounded ${memberColors[idx % memberColors.length].bg} ${memberColors[idx % memberColors.length].border} border-l-4`}></div>
                                    <span className="text-xs text-slate-600 dark:text-slate-400">{member.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
                    {/* Calendar Toolbar */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {selectedMember
                                    ? `${teamMembers.find(m => m.id === selectedMember)?.name}'s Schedule`
                                    : 'Combined Team Schedule'
                                }
                            </h2>
                            <p className="text-sm text-slate-500">
                                {selectedMember
                                    ? 'Viewing individual availability'
                                    : 'Showing all team members overlapped'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                <button
                                    onClick={() => setCalendarView('week')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${calendarView === 'week'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setCalendarView('month')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${calendarView === 'month'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    Month
                                </button>
                            </div>
                            <select className="bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg focus:ring-2 focus:ring-primary cursor-pointer">
                                <option>UTC-05:00 Eastern Time</option>
                                <option>UTC-08:00 Pacific Time</option>
                                <option>UTC+00:00 London</option>
                            </select>
                        </div>
                    </div>

                    {/* Calendar Grid Body */}
                    <div className="flex-1 overflow-y-auto relative flex flex-col">
                        {/* Days Header */}
                        <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                            <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-100 dark:border-slate-800">
                                GMT-5
                            </div>
                            {weekDays.map((day, idx) => (
                                <div key={idx} className={`p-3 text-center ${idx < 6 ? 'border-r border-slate-100 dark:border-slate-800' : ''}`}>
                                    <div className={`text-xs font-semibold uppercase ${day.isToday ? 'text-primary' : 'text-slate-500'}`}>
                                        {day.day}
                                    </div>
                                    {day.isToday ? (
                                        <div className="text-sm font-bold text-white bg-primary rounded-full w-7 h-7 flex items-center justify-center mx-auto mt-1">
                                            {day.date}
                                        </div>
                                    ) : (
                                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                                            {day.date}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Time Grid */}
                        <div className="relative flex-1 bg-white dark:bg-slate-900 min-h-[500px]">
                            {/* Horizontal Lines */}
                            <div className="absolute inset-0 flex flex-col pointer-events-none">
                                {timeSlots.map((_, idx) => (
                                    <div key={idx} className="flex-1 border-b border-slate-100 dark:border-slate-800"></div>
                                ))}
                            </div>

                            {/* Grid Columns */}
                            <div className="grid grid-cols-8 h-full absolute inset-0">
                                {/* Time Labels */}
                                <div className="border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col">
                                    {timeSlots.map((time, idx) => (
                                        <div key={idx} className="flex-1 flex items-start justify-center">
                                            <span className="text-xs text-slate-400 -translate-y-2">{time}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {weekDays.map((day, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        className={`${dayIdx < 6 ? 'border-r border-slate-100 dark:border-slate-800' : ''} relative ${day.isWeekend ? 'bg-slate-50/30 dark:bg-slate-900/50' : ''}`}
                                    >
                                        {/* Team Member Availability Blocks */}
                                        {teamMembers
                                            .filter(m => !selectedMember || m.id === selectedMember)
                                            .map((member, memberIdx) => {
                                                const colorScheme = memberColors[teamMembers.findIndex(tm => tm.id === member.id) % memberColors.length]
                                                return member.availability
                                                    .filter(block => block.dayIndex === dayIdx)
                                                    .map((block, blockIdx) => (
                                                        <div
                                                            key={`${member.id}-${blockIdx}`}
                                                            className={`absolute left-1 right-1 p-1 rounded-r-md cursor-pointer transition ${colorScheme.bg} border-l-4 ${colorScheme.border} hover:opacity-80`}
                                                            style={{
                                                                top: `${(block.startSlot / timeSlots.length) * 100}%`,
                                                                height: `${(block.duration / timeSlots.length) * 100}%`,
                                                                marginLeft: selectedMember ? '4px' : `${memberIdx * 3}px`,
                                                                width: selectedMember ? 'calc(100% - 8px)' : `calc(100% - ${memberIdx * 3 + 8}px)`,
                                                                zIndex: teamMembers.length - memberIdx
                                                            }}
                                                        >
                                                            <p className={`text-[10px] font-bold ${colorScheme.text} truncate`}>
                                                                {selectedMember ? `${timeSlots[block.startSlot]?.split(' ')[0]}` : member.name.split(' ')[0]}
                                                            </p>
                                                        </div>
                                                    ))
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all group">
                    <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">person_add</span>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Invite Team Member</p>
                        <p className="text-xs text-slate-500">Add new consultant to the team</p>
                    </div>
                </button>
                <button className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all group">
                    <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">event</span>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Set Team Defaults</p>
                        <p className="text-xs text-slate-500">Configure default working hours</p>
                    </div>
                </button>
                <button className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary hover:shadow-lg transition-all group">
                    <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Availability Alerts</p>
                        <p className="text-xs text-slate-500">Get notified of schedule changes</p>
                    </div>
                </button>
            </div>
        </div>
    )
}
