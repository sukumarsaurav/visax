import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CONSULT_TYPES = ['video', 'phone', 'in_person']

const DEFAULT_SLOTS = DAYS.map((_, i) => ({
    weekday: i,
    is_active: i >= 1 && i <= 5,
    start_time: '09:00',
    end_time: '17:00',
    consultation_type: 'video',
}))

function Toast({ msg, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 dark:bg-white px-5 py-3 text-white dark:text-slate-900 shadow-xl text-sm font-medium">
            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">check_circle</span>
            {msg}
        </div>
    )
}

export default function AvailabilityPage() {
    const { user } = useAuth()
    const [slots, setSlots] = useState(DEFAULT_SLOTS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [bufferMinutes, setBufferMinutes] = useState(15)
    const [sessionLength, setSessionLength] = useState(60)
    const [meetingLink, setMeetingLink] = useState('')
    const [officeLocation, setOfficeLocation] = useState('')

    useEffect(() => {
        if (!user) return
        fetchAvailability()
    }, [user])

    async function fetchAvailability() {
        setLoading(true)
        const { data } = await supabase
            .from('consultant_availability')
            .select('*')
            .eq('consultant_id', user.id)
            .order('weekday', { ascending: true })

        if (data && data.length > 0) {
            // Merge DB data into slots (one entry per weekday)
            const merged = DEFAULT_SLOTS.map(def => {
                const found = data.find(d => d.weekday === def.weekday)
                return found ? {
                    weekday: found.weekday,
                    is_active: found.is_active,
                    start_time: found.start_time?.slice(0, 5) || '09:00',
                    end_time: found.end_time?.slice(0, 5) || '17:00',
                    consultation_type: found.consultation_type || 'video',
                    id: found.id,
                } : def
            })
            setSlots(merged)
        }

        // Also load session settings from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', user.id)
            .single()
        const prefs = profile?.notification_preferences || {}
        if (prefs.meeting_link) setMeetingLink(prefs.meeting_link)
        if (prefs.office_location) setOfficeLocation(prefs.office_location)
        if (prefs.session_length) setSessionLength(prefs.session_length)
        if (prefs.buffer_minutes !== undefined) setBufferMinutes(prefs.buffer_minutes)

        setLoading(false)
    }

    const updateSlot = (weekday, field, value) => {
        setSlots(prev => prev.map(s => s.weekday === weekday ? { ...s, [field]: value } : s))
    }

    const handleSave = async () => {
        setSaving(true)
        const upsertData = slots.map(s => ({
            consultant_id: user.id,
            weekday: s.weekday,
            is_active: s.is_active,
            start_time: s.start_time,
            end_time: s.end_time,
            consultation_type: s.consultation_type,
        }))

        const { error } = await supabase
            .from('consultant_availability')
            .upsert(upsertData, { onConflict: 'consultant_id,weekday' })

        // Save session settings to profile
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('id', user.id)
            .single()
        const merged = {
            ...(existingProfile?.notification_preferences || {}),
            session_length: sessionLength,
            buffer_minutes: bufferMinutes,
            meeting_link: meetingLink,
            office_location: officeLocation,
        }
        await supabase.from('profiles')
            .update({ notification_preferences: merged })
            .eq('id', user.id)

        if (!error) {
            setToast('Availability saved!')
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {toast && <Toast msg={toast} onClose={() => setToast('')} />}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Availability</h1>
                    <p className="text-slate-500 mt-1">Set your weekly schedule for client appointments.</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Availability'}
                </Button>
            </div>

            {/* Weekly Schedule */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Weekly Schedule</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Toggle days and set your available hours per day.</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {slots.map(slot => (
                        <div key={slot.weekday} className={`flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 transition-colors ${!slot.is_active ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-4 w-40 flex-shrink-0">
                                <button
                                    onClick={() => updateSlot(slot.weekday, 'is_active', !slot.is_active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${slot.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${slot.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-bold text-slate-900 dark:text-white w-20">{DAYS[slot.weekday]}</span>
                            </div>

                            <div className="flex flex-1 items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500">From</label>
                                    <input
                                        type="time"
                                        value={slot.start_time}
                                        onChange={e => updateSlot(slot.weekday, 'start_time', e.target.value)}
                                        disabled={!slot.is_active}
                                        className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
                                    />
                                </div>
                                <span className="text-slate-400">—</span>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-slate-500">To</label>
                                    <input
                                        type="time"
                                        value={slot.end_time}
                                        onChange={e => updateSlot(slot.weekday, 'end_time', e.target.value)}
                                        disabled={!slot.is_active}
                                        className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary disabled:cursor-not-allowed"
                                    />
                                </div>

                                <select
                                    value={slot.consultation_type}
                                    onChange={e => updateSlot(slot.weekday, 'consultation_type', e.target.value)}
                                    disabled={!slot.is_active}
                                    className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary disabled:cursor-not-allowed capitalize"
                                >
                                    {CONSULT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Session Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Session Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Default Session Length</label>
                        <select
                            value={sessionLength}
                            onChange={e => setSessionLength(Number(e.target.value))}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                        >
                            {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} minutes</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Buffer Between Sessions</label>
                        <select
                            value={bufferMinutes}
                            onChange={e => setBufferMinutes(Number(e.target.value))}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                        >
                            {[0, 10, 15, 30].map(d => <option key={d} value={d}>{d === 0 ? 'No buffer' : `${d} minutes`}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Video Meeting Link (for video consultations)</label>
                        <input
                            type="url"
                            value={meetingLink}
                            onChange={e => setMeetingLink(e.target.value)}
                            placeholder="https://meet.google.com/... or Zoom link"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Office Location (for in-person consultations)</label>
                        <input
                            type="text"
                            value={officeLocation}
                            onChange={e => setOfficeLocation(e.target.value)}
                            placeholder="123 Main Street, Suite 400, New York, NY"
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
