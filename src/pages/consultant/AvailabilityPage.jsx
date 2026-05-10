import { useState } from 'react'
import Button from '../../components/ui/Button'

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

const availabilityBlocks = [
    { dayIndex: 0, startSlot: 0, duration: 2, label: '09:00 - 11:00', type: 'available' },
    { dayIndex: 0, startSlot: 4, duration: 3, label: '01:00 - 04:00', type: 'available' },
    { dayIndex: 1, startSlot: 0, duration: 2, label: '09:00 - 11:00', type: 'available' },
    { dayIndex: 1, startSlot: 5, duration: 1, label: 'Busy', type: 'blocked' },
    { dayIndex: 2, startSlot: 0, duration: 6, label: '09:00 - 03:00', type: 'available', note: 'Marathon' },
    { dayIndex: 4, startSlot: 0, duration: 3, label: '09:00 - 12:00', type: 'available' }
]

const targetCountries = [
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'UK', name: 'UK', flag: '🇬🇧' }
]

const visaTypes = [
    { id: 1, name: 'Student Visas', description: 'Study permits, F-1, M-1', checked: true },
    { id: 2, name: 'Skilled Worker', description: 'Express Entry, H-1B', checked: true },
    { id: 3, name: 'Family Sponsorship', description: 'Spouse, Parents, Children', checked: false },
    { id: 4, name: 'Tourist / Visitor', description: 'Temporary resident visas', checked: false }
]

export default function AvailabilityPage() {
    const [videoCallEnabled, setVideoCallEnabled] = useState(true)
    const [inPersonEnabled, setInPersonEnabled] = useState(true)
    const [meetingLink, setMeetingLink] = useState('https://meet.google.com/abc-defg-hij')
    const [officeLocation, setOfficeLocation] = useState('123 Immigration Blvd, Suite 400')
    const [selectedVisaTypes, setSelectedVisaTypes] = useState(visaTypes.filter(v => v.checked).map(v => v.id))
    const [calendarView, setCalendarView] = useState('week')

    const toggleVisaType = (id) => {
        setSelectedVisaTypes(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">
                        Availability & Services
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                        Manage your working hours, consultation methods, and service offerings.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary">Preview Profile</Button>
                    <Button icon="save">Save Changes</Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">schedule</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Weekly Hours</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            32 <span className="text-sm text-slate-400 font-normal">hrs</span>
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined">videocam</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Modes</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">Video & In-Person</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                        <span className="material-symbols-outlined">public</span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Countries Served</p>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            5 <span className="text-sm text-slate-400 font-normal">Active</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* LEFT COLUMN: Calendar */}
                <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] overflow-hidden">
                    {/* Calendar Toolbar */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Schedule</h2>
                            <p className="text-sm text-slate-500">Drag to create or edit slots.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                <button
                                    onClick={() => setCalendarView('week')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${calendarView === 'week'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    Week
                                </button>
                                <button
                                    onClick={() => setCalendarView('month')}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition ${calendarView === 'month'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                                        className={`${dayIdx < 6 ? 'border-r border-slate-100 dark:border-slate-800' : ''} relative group ${day.isWeekend ? 'bg-slate-50/30 dark:bg-slate-900/50' : ''}`}
                                    >
                                        {/* Availability Blocks */}
                                        {availabilityBlocks
                                            .filter(block => block.dayIndex === dayIdx)
                                            .map((block, blockIdx) => (
                                                <div
                                                    key={blockIdx}
                                                    className={`absolute left-1 right-1 p-1.5 rounded-r-md cursor-pointer transition ${block.type === 'blocked'
                                                            ? 'bg-slate-100 dark:bg-slate-800 border-l-4 border-slate-400 opacity-70 cursor-not-allowed'
                                                            : 'bg-primary/10 border-l-4 border-primary hover:bg-primary/20'
                                                        }`}
                                                    style={{
                                                        top: `${(block.startSlot / timeSlots.length) * 100}%`,
                                                        height: `${(block.duration / timeSlots.length) * 100}%`
                                                    }}
                                                >
                                                    {block.type === 'blocked' ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[12px] text-slate-500">lock</span>
                                                            <p className="text-xs font-bold text-slate-500">{block.label}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-xs font-bold text-primary">{block.label}</p>
                                                            {block.note && <p className="text-[10px] text-primary/80">{block.note}</p>}
                                                            {!block.note && <p className="text-[10px] text-primary/80">Available</p>}
                                                        </>
                                                    )}
                                                </div>
                                            ))}

                                        {/* Hover to add (non-weekend days without blocks) */}
                                        {!day.isWeekend && !availabilityBlocks.some(b => b.dayIndex === dayIdx) && (
                                            <div className="hidden group-hover:flex absolute top-[37.5%] left-1 right-1 h-[12.5%] bg-slate-100 border border-dashed border-slate-300 rounded items-center justify-center cursor-crosshair">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">add</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Configuration Panels */}
                <div className="flex flex-col gap-6">
                    {/* Consultation Modes */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Consultation Modes</h3>
                        </div>
                        <div className="p-5 flex flex-col gap-6">
                            {/* Video Call Toggle */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">videocam</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">Video Call</span>
                                    </div>
                                    <button
                                        onClick={() => setVideoCallEnabled(!videoCallEnabled)}
                                        className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${videoCallEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                    >
                                        <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${videoCallEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}></span>
                                    </button>
                                </div>
                                {videoCallEnabled && (
                                    <div className="ml-12">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Meeting Link Template</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-[18px]">link</span>
                                            <input
                                                type="text"
                                                value={meetingLink}
                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* In-Person Toggle */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-9 rounded-lg bg-orange-50 dark:bg-slate-800 flex items-center justify-center text-orange-500">
                                            <span className="material-symbols-outlined">storefront</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">In-Person</span>
                                    </div>
                                    <button
                                        onClick={() => setInPersonEnabled(!inPersonEnabled)}
                                        className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${inPersonEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                    >
                                        <span className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full shadow transition-transform ${inPersonEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}></span>
                                    </button>
                                </div>
                                {inPersonEnabled && (
                                    <div className="ml-12">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Office Location</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                                            <input
                                                type="text"
                                                value={officeLocation}
                                                onChange={(e) => setOfficeLocation(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-primary focus:border-primary"
                                            />
                                        </div>
                                        <div className="mt-2 h-24 w-full rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer group">
                                            <span className="bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow group-hover:bg-primary group-hover:text-white transition">
                                                Edit Map
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Scope */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Service Scope</h3>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            {/* Target Countries */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Countries</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {targetCountries.map((country) => (
                                        <span
                                            key={country.code}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700"
                                        >
                                            <span>{country.flag}</span>
                                            {country.name}
                                            <button className="ml-1 hover:text-red-500 transition-colors">
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </span>
                                    ))}
                                    <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-dashed border-slate-300 text-slate-500 text-xs font-medium hover:border-primary hover:text-primary transition">
                                        <span className="material-symbols-outlined text-[14px]">add</span>
                                        Add Country
                                    </button>
                                </div>
                            </div>

                            {/* Visa Types */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Visa Types</label>
                                <div className="space-y-2">
                                    {visaTypes.map((visa) => (
                                        <label
                                            key={visa.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedVisaTypes.includes(visa.id)}
                                                onChange={() => toggleVisaType(visa.id)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary size-4"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{visa.name}</p>
                                                <p className="text-xs text-slate-500">{visa.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
