import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'

const TYPE_ICON = {
    pdf: { icon: 'picture_as_pdf', color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
    video: { icon: 'play_circle', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
    doc: { icon: 'article', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    excel: { icon: 'table_chart', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
    link: { icon: 'link', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
    image: { icon: 'image', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' },
}

const CATEGORY_COLORS = {
    LEGAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TEMPLATE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    TUTORIAL: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CHECKLIST: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    GUIDE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    ANNOUNCEMENT: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
}

export default function ResourceLibraryPage() {
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('ALL')
    const [typeFilter, setTypeFilter] = useState('all')

    useEffect(() => { fetchResources() }, [])

    async function fetchResources() {
        setLoading(true)
        const { data } = await supabase
            .from('resources')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
        setResources(data || [])
        setLoading(false)
    }

    const categories = ['ALL', ...new Set(resources.map(r => r.category).filter(Boolean))]
    const types = ['all', ...new Set(resources.map(r => r.resource_type || r.type).filter(Boolean))]

    const filtered = resources.filter(r => {
        const q = search.toLowerCase()
        const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
        const matchCat = categoryFilter === 'ALL' || r.category === categoryFilter
        const matchType = typeFilter === 'all' || (r.resource_type || r.type) === typeFilter
        return matchSearch && matchCat && matchType
    })

    const handleAction = (resource) => {
        const url = resource.file_url || resource.external_url
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
    }

    const getTypeInfo = (r) => {
        const t = (r.resource_type || r.type || 'doc').toLowerCase()
        return TYPE_ICON[t] || TYPE_ICON.doc
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Resource Library</h1>
                    <p className="text-slate-500 mt-1">Tools, templates, and guides for your practice.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-1 focus:ring-primary"
                    />
                </div>
                {types.length > 1 && (
                    <div className="relative min-w-[160px]">
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:ring-1 focus:ring-primary"
                        >
                            {types.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.toUpperCase()}</option>)}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                    </div>
                )}
            </div>

            {/* Category Tabs */}
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat
                                ? 'bg-primary text-white'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                        >{cat}</button>
                    ))}
                </div>
            )}

            {/* Resources Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[56px]">folder_open</span>
                    <p className="text-base font-medium">No resources found</p>
                    {search && <p className="text-sm text-slate-400">Try a different search term</p>}
                    {!search && <p className="text-sm text-slate-400">Resources added by admins will appear here</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(r => {
                        const typeInfo = getTypeInfo(r)
                        const catColor = CATEGORY_COLORS[r.category] || CATEGORY_COLORS.ANNOUNCEMENT
                        const hasAction = !!(r.file_url || r.external_url)
                        const isVideo = (r.resource_type || r.type) === 'video'

                        return (
                            <div key={r.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-3">
                                    <div className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                                        <span className="material-symbols-outlined text-[20px]">{typeInfo.icon}</span>
                                    </div>
                                    {r.category && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${catColor}`}>
                                            {r.category}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1">{r.title}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-3">{r.description}</p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                                    {hasAction ? (
                                        <button
                                            onClick={() => handleAction(r)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">
                                                {isVideo ? 'play_arrow' : 'download'}
                                            </span>
                                            {isVideo ? 'Watch' : 'Download'}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">View only</span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
