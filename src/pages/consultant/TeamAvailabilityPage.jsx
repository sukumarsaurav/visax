import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/ui/Avatar'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const TIME_LABELS = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM']

const MEMBER_COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-500', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-500', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-500', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', border: 'border-cyan-500', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
]

// Convert HH:MM time to slot index (relative to 09:00)
function timeToSlot(time) {
    if (!time) return null
    const [h, m] = time.split(':').map(Number)
    return (h - 9) + (m / 60)
}

// Calculate slot height % within the 8-hour grid (9AM-5PM)
function slotToPercent(slot) {
    return (slot / 8) * 100
}

function getWeekDates() {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=Sun
    // Start from Monday
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
    return WEEKDAYS.map((day, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return {
            day,
            date: d.getDate(),
            isToday: d.toDateString() === today.toDateString(),
            isWeekend: i >= 5,
        }
    })
}

export default function TeamAvailabilityPage() {
    const { user } = useAuth()
    const [members, setMembers] = useState([])
    const [availability, setAvailability] = useState({}) // consultant_id -> availability rows
    const [loading, setLoading] = useState(true)
    const [selectedMember, setSelectedMember] = useState(null)

    const weekDates = getWeekDates()

    useEffect(() => {
        if (!user) return
        fetchTeamAvailability()
    }, [user])

    async function fetchTeamAvailability() {
        setLoading(true)
        // 1. Find the agency owned by this user
        const { data: agency } = await supabase
            .from('agencies')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle()

        if (!agency) {
            setLoading(false)
            return
        }

        // 2. Fetch agency members with profiles
        const { data: agencyMembers } = await supabase
            .from('agency_members')
            .select(`
                id,
                profile_id,
                role,
                status,
                profile:profiles!agency_members_profile_id_fkey(
                    id, full_name, avatar_url, email
                )
            `)
            .eq('agency_id', agency.id)
            .eq('status', 'active')

        if (!agencyMembers?.length) {
            setMembers([])
            setLoading(false)
            return
        }

        setMembers(agencyMembers)

        // 3. Fetch availability for all members
        const consultantIds = agencyMembers.map(m => m.profile_id)
        const { data: avail } = await supabase
            .from('consultant_availability')
            .select('*')
            .in('consultant_id', consultantIds)
            .eq('is_active', true)

        // Group by consultant_id
        const grouped = {}
        for (const row of (avail || [])) {
            if (!grouped[row.consultant_id]) grouped[row.consultant_id] = []
            grouped[row.consultant_id].push(row)
        }
        setAvailability(grouped)
        setLoading(false)
    }

    const displayMembers = selectedMember
        ? members.filter(m => m.profile_id === selectedMember)
        : members

    // Compute stats
    const totalWeeklySlots = members.reduce((sum, m) => {
        const slots = availability[m.profile_id] || []
        return sum + slots.reduce((s, row) => {
            const start = timeToSlot(row.start_time)
            const end = timeToSlot(row.end_time)
            if (start !== null && end !== null) return s + (end - start)
            return s
        }, 0)
    }, 0)
    const avgHours = members.length > 0 ? Math.round(totalWeeklySlots / members.length) : 0

    const getBlocksForMemberAndDay = (consultantId, weekdayIndex) => {
        // weekdayIndex: 0=Mon...6=Sun  matches our weekday column
        // consultant_availability weekday: we assume 0=Mon based on AvailabilityPage
        const rows = availability[consultantId] || []
        return rows.filter(row => row.weekday === weekdayIndex)
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
                </div>
                <div className="h-[600px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Team Availability</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base">View availability schedules for all team members.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { icon: 'groups', color: 'blue', label: 'Team Members', value: members.length, unit: 'total' },
                    { icon: 'check_circle', color: 'emerald', label: 'With Availability', value: members.filter(m => (availability[m.profile_id] || []).length > 0).length, unit: 'set' },
                    { icon: 'schedule', color: 'purple', label: 'Total Weekly Hours', value: Math.round(totalWeeklySlots), unit: 'hrs' },
                    { icon: 'event_available', color: 'orange', label: 'Avg Hours/Member', value: avgHours, unit: 'hrs' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className={`size-12 rounded-full bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                            <p className="text-slate-900 dark:text-white text-2xl font-bold">
                                {stat.value} <span className="text-sm text-slate-400 font-normal">{stat.unit}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {members.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[56px]">group_off</span>
                    <p className="text-base font-medium">No active team members found</p>
                    <p className="text-sm">Add team members to see their availability here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="xl:col-span-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Members</h3>
                            {selectedMember && (
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="text-xs text-primary font-medium hover:underline"
                                >
                                    Show All
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {members.map((m, idx) => {
                                const avail = availability[m.profile_id] || []
                                const weeklyHours = Math.round(avail.reduce((s, row) => {
                                    const start = timeToSlot(row.start_time)
                                    const end = timeToSlot(row.end_time)
                                    return (start !== null && end !== null) ? s + (end - start) : s
                                }, 0))
                                const color = MEMBER_COLORS[idx % MEMBER_COLORS.length]
                                const isSelected = selectedMember === m.profile_id

                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => setSelectedMember(isSelected ? null : m.profile_id)}
                                        className={`w-full flex items-center gap-3 p-3 transition-colors ${isSelected
                                            ? 'bg-primary/5 border-l-2 border-primary'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-2 border-transparent'
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Avatar src={m.profile?.avatar_url} alt={m.profile?.full_name} size="sm" />
                                            <span className={`absolute bottom-0 right-0 size-2.5 ${avail.length > 0 ? 'bg-green-500' : 'bg-slate-300'} border-2 border-white dark:border-slate-900 rounded-full`} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.profile?.full_name || '—'}</p>
                                                <span className={`size-2.5 rounded-full flex-shrink-0 ${color.dot}`} />
                                            </div>
                                            <p className="text-xs text-slate-500 capitalize">{m.role || 'Member'}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{weeklyHours}h</p>
                                            <p className="text-[10px] text-slate-400">/week</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Legend</p>
                            <div className="space-y-1.5">
                                {members.map((m, idx) => {
                                    const color = MEMBER_COLORS[idx % MEMBER_COLORS.length]
                                    return (
                                        <div key={m.id} className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-sm ${color.bg} border-l-2 ${color.border}`} />
                                            <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">{m.profile?.full_name?.split(' ')[0] || '—'}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden" style={{ height: '600px' }}>
                        {/* Toolbar */}
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                {selectedMember
                                    ? `${members.find(m => m.profile_id === selectedMember)?.profile?.full_name}'s Schedule`
                                    : 'Combined Team Schedule'}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {selectedMember ? 'Individual weekly availability' : 'All team members overlaid — recurring weekly schedule'}
                            </p>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
                            <div className="p-2 border-r border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center font-semibold">Time</div>
                            {weekDates.map((day, idx) => (
                                <div key={idx} className={`p-2 text-center ${idx < 6 ? 'border-r border-slate-100 dark:border-slate-800' : ''}`}>
                                    <div className={`text-[10px] font-semibold uppercase ${day.isToday ? 'text-primary' : 'text-slate-500'}`}>{day.day}</div>
                                    {day.isToday ? (
                                        <div className="text-xs font-bold text-white bg-primary rounded-full w-6 h-6 flex items-center justify-center mx-auto mt-0.5">{day.date}</div>
                                    ) : (
                                        <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{day.date}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Time grid */}
                        <div className="flex-1 overflow-y-auto relative">
                            <div className="grid grid-cols-8 h-full min-h-[400px]">
                                {/* Time labels */}
                                <div className="border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex flex-col">
                                    {TIME_LABELS.map((label, i) => (
                                        <div key={i} className="flex-1 flex items-start justify-center pt-1">
                                            <span className="text-[10px] text-slate-400">{label}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Day columns */}
                                {weekDates.map((day, dayIdx) => (
                                    <div
                                        key={dayIdx}
                                        className={`relative ${dayIdx < 6 ? 'border-r border-slate-100 dark:border-slate-800' : ''} ${day.isWeekend ? 'bg-slate-50/40 dark:bg-slate-900/50' : ''}`}
                                    >
                                        {/* Hour lines */}
                                        {TIME_LABELS.map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute left-0 right-0 border-b border-slate-100 dark:border-slate-800"
                                                style={{ top: `${(i / (TIME_LABELS.length - 1)) * 100}%` }}
                                            />
                                        ))}

                                        {/* Availability blocks */}
                                        {displayMembers.map((m, memberIdx) => {
                                            const colorIdx = members.findIndex(mm => mm.profile_id === m.profile_id)
                                            const color = MEMBER_COLORS[colorIdx % MEMBER_COLORS.length]
                                            const blocks = getBlocksForMemberAndDay(m.profile_id, dayIdx)
                                            const totalVisible = displayMembers.length

                                            return blocks.map((block, blockIdx) => {
                                                const startSlot = timeToSlot(block.start_time)
                                                const endSlot = timeToSlot(block.end_time)
                                                if (startSlot === null || endSlot === null || startSlot < 0) return null
                                                const clampedStart = Math.max(0, startSlot)
                                                const clampedEnd = Math.min(8, endSlot)
                                                if (clampedEnd <= clampedStart) return null

                                                const topPct = slotToPercent(clampedStart)
                                                const heightPct = slotToPercent(clampedEnd - clampedStart)

                                                const offset = selectedMember ? 2 : memberIdx * 2
                                                const widthCalc = selectedMember
                                                    ? 'calc(100% - 4px)'
                                                    : `calc(${100 / totalVisible}% - 2px)`

                                                return (
                                                    <div
                                                        key={`${m.profile_id}-${blockIdx}`}
                                                        className={`absolute rounded-r-sm cursor-pointer px-1 py-0.5 ${color.bg} border-l-2 ${color.border} hover:opacity-80 transition-opacity overflow-hidden`}
                                                        style={{
                                                            top: `${topPct}%`,
                                                            height: `${heightPct}%`,
                                                            left: selectedMember ? '2px' : `calc(${(memberIdx / totalVisible) * 100}% + 1px)`,
                                                            width: widthCalc,
                                                            zIndex: members.length - colorIdx,
                                                            minHeight: '8px',
                                                        }}
                                                        title={`${m.profile?.full_name} — ${block.start_time} to ${block.end_time}`}
                                                    >
                                                        <p className={`text-[9px] font-bold ${color.text} truncate leading-tight`}>
                                                            {selectedMember
                                                                ? `${block.start_time}–${block.end_time}`
                                                                : m.profile?.full_name?.split(' ')[0]}
                                                        </p>
                                                    </div>
                                                )
                                            })
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coverage Summary Table */}
            {members.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly Coverage Summary</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Days each member has availability set</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Member</th>
                                    {WEEKDAYS.map(d => (
                                        <th key={d} className="text-center px-2 py-3 text-xs font-bold text-slate-500 uppercase">{d}</th>
                                    ))}
                                    <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase">Days</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {members.map((m, idx) => {
                                    const avail = availability[m.profile_id] || []
                                    const color = MEMBER_COLORS[idx % MEMBER_COLORS.length]
                                    const daysSet = new Set(avail.map(a => a.weekday))

                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`size-2.5 rounded-full ${color.dot}`} />
                                                    <span className="font-medium text-slate-900 dark:text-white text-sm">{m.profile?.full_name || '—'}</span>
                                                </div>
                                            </td>
                                            {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                                                <td key={dayIdx} className="text-center px-2 py-3">
                                                    {daysSet.has(dayIdx) ? (
                                                        <span className={`inline-flex size-6 items-center justify-center rounded-full ${color.bg} ${color.text}`}>
                                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                                            <span className="material-symbols-outlined text-[14px] text-slate-300">remove</span>
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="text-center px-3 py-3">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{daysSet.size}</span>
                                                <span className="text-xs text-slate-400"> /7</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
