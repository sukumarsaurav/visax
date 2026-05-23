import { useState, useEffect } from 'react'
import * as announcementsRepo from '../../data/announcementsRepo'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/date'

const CATEGORY_COLORS = {
    'Policy Changes': 'blue',
    'Billing': 'purple',
    'Maintenance': 'amber',
    'Platform News': 'emerald',
    'Announcement': 'slate',
}
const BG = { blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' }

export default function AnnouncementsPage() {
    const { user } = useAuth()
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [readIds, setReadIds] = useState(new Set())

    useEffect(() => {
        if (!user) return
        fetchAnnouncements()
    }, [user])

    async function fetchAnnouncements() {
        setLoading(true)
        const { data } = await announcementsRepo.listAll()
        setAnnouncements(data || [])
        if (data?.length > 0) setSelected(data[0])
        setLoading(false)
    }

    const handleSelect = (ann) => {
        setSelected(ann)
        if (!readIds.has(ann.id)) {
            setReadIds(prev => new Set([...prev, ann.id]))
        }
    }

    const catColor = (cat) => {
        const key = CATEGORY_COLORS[cat] || 'slate'
        return BG[key]
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Announcements</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Platform updates and news</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="p-4 space-y-2">
                                <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-700 w-3/4" />
                                <div className="h-2.5 animate-pulse rounded bg-slate-100 dark:bg-slate-800 w-full" />
                            </div>
                        ))
                    ) : announcements.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <span className="material-symbols-outlined text-[36px]">campaign</span>
                            <p className="text-sm">No announcements</p>
                        </div>
                    ) : announcements.map(ann => {
                        const isRead = readIds.has(ann.id)
                        const color = CATEGORY_COLORS[ann.category] || 'slate'
                        return (
                            <button
                                key={ann.id}
                                onClick={() => handleSelect(ann)}
                                className={`w-full text-left p-4 transition-colors ${selected?.id === ann.id
                                    ? 'bg-primary/5 border-l-2 border-primary'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-transparent'
                                }`}
                            >
                                <div className="flex items-start gap-2 mb-1.5">
                                    {!isRead && <div className="flex-shrink-0 size-2 rounded-full bg-primary mt-1.5" />}
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${catColor(ann.category)}`}>
                                        {ann.category || 'General'}
                                    </span>
                                </div>
                                <p className={`text-sm leading-snug line-clamp-2 ${isRead ? 'font-normal text-slate-600 dark:text-slate-400' : 'font-bold text-slate-900 dark:text-white'}`}>
                                    {ann.title}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1">{formatDate(ann.created_at)}</p>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content Panel */}
            {selected ? (
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-2xl">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold mb-4 ${catColor(selected.category)}`}>
                            {selected.category || 'General'}
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">{selected.title}</h1>
                        <p className="text-sm text-slate-400 mb-6">{formatDate(selected.created_at)}</p>

                        {selected.image_url && (
                            <img src={selected.image_url} alt={selected.title} className="w-full rounded-xl mb-6 object-cover max-h-48" loading="lazy" />
                        )}

                        <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selected.content || selected.excerpt}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[64px] mb-4">campaign</span>
                    <p className="text-base font-medium">Select an announcement</p>
                </div>
            )}
        </div>
    )
}
