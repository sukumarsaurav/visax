import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as servicesRepo from '../../../data/servicesRepo'
import * as ratingsRepo from '../../../data/ratingsRepo'
import { sanitizeSearch } from '../../../lib/searchEscape'

const PAGE_SIZE = 10

// Allowlist of valid sort values
const VALID_SORTS = ['newest', 'price_asc', 'price_desc']

const ICON_COLORS = [
    { icon: 'work',           color: 'text-primary',     bg: 'bg-primary/10'   },
    { icon: 'family_restroom',color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: 'school',         color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20'   },
    { icon: 'gavel',          color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { icon: 'description',    color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20'     },
    { icon: 'flight_takeoff', color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20'       },
    { icon: 'translate',      color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-900/20'     },
    { icon: 'flag',           color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
]

/**
 * ServicesTab — renders the services directory inline inside FindProfessionalsPage.
 *
 * Props:
 *   initialSearch  string  pre-populate search from the page-level hero search bar
 */
export default function ServicesTab({ initialSearch = '' }) {
    const [services,     setServices]     = useState([])
    const [loading,      setLoading]      = useState(true)
    const [loadingMore,  setLoadingMore]  = useState(false)
    const [hasMore,      setHasMore]      = useState(false)
    const [page,         setPage]         = useState(0)
    const [ratingMap,    setRatingMap]    = useState({})

    const [searchQuery,    setSearchQuery]    = useState(initialSearch)
    const [appliedSearch,  setAppliedSearch]  = useState(initialSearch)
    const [activeCategory, setActiveCategory] = useState('All Services')
    const [categories,     setCategories]     = useState(['All Services'])
    const [sortBy,         setSortBy]         = useState('newest')

    // When the parent's hero search changes, propagate it in
    useEffect(() => {
        setSearchQuery(initialSearch)
        setAppliedSearch(initialSearch)
    }, [initialSearch])

    useEffect(() => {
        fetchCategoriesAndRatings()
    }, [])

    useEffect(() => {
        setPage(0)
        setServices([])
        fetchServices(0, true)
    }, [appliedSearch, activeCategory, sortBy])

    async function fetchCategoriesAndRatings() {
        const [catsRes, ratingsRes] = await Promise.all([
            servicesRepo.listCategories(),
            ratingsRepo.listAll(),
        ])
        const uniqueCats = ['All Services', ...new Set((catsRes.data || []).map(c => c.category).filter(Boolean))]
        setCategories(uniqueCats)

        const ratings = {}
        for (const r of (ratingsRes.data || [])) {
            ratings[r.consultant_id] = { sum: Number(r.avg_rating) * r.review_count, count: r.review_count }
        }
        setRatingMap(ratings)
    }

    async function fetchServices(pageNum = 0, reset = false) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const { data } = await servicesRepo.search({
            search:   appliedSearch ? sanitizeSearch(appliedSearch) : '',
            category: activeCategory,
            sortBy,
            page:     pageNum,
            pageSize: PAGE_SIZE,
        })

        if (reset || pageNum === 0) setServices(data || [])
        else setServices(prev => [...prev, ...(data || [])])

        setHasMore((data || []).length === PAGE_SIZE)
        setPage(pageNum)
        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
    }

    function getAvgRating(providerId) {
        const r = ratingMap[providerId]
        if (!r || r.count === 0) return null
        return (r.sum / r.count).toFixed(1)
    }

    const hasActiveFilter = appliedSearch || activeCategory !== 'All Services'

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar — categories + sort */}
            <aside className="w-full lg:w-64 shrink-0">
                <div className="sticky top-24 flex flex-col gap-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
                    {/* Inline search */}
                    <div className="flex rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden focus-within:border-primary transition-colors">
                        <span className="flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">search</span>
                        </span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && setAppliedSearch(searchQuery)}
                            placeholder="Search services…"
                            className="flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setAppliedSearch('') }}
                                className="pr-2 text-slate-400 hover:text-slate-600 transition-colors"
                                aria-label="Clear search"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Category</h3>
                        {hasActiveFilter && (
                            <button
                                onClick={() => { setAppliedSearch(''); setSearchQuery(''); setActiveCategory('All Services') }}
                                className="text-xs font-medium text-primary hover:underline"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700" />

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={e => { if (VALID_SORTS.includes(e.target.value)) setSortBy(e.target.value) }}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
            </aside>

            {/* Results */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Results header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h2 className="text-[22px] font-bold text-slate-900 dark:text-white">
                        {appliedSearch ? `Results for "${appliedSearch}"` : activeCategory}
                    </h2>
                    {!loading && (
                        <span className="text-sm text-slate-400">
                            {services.length} service{services.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                        ))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[56px]">search_off</span>
                        <p className="text-base font-medium">No services found</p>
                        <p className="text-sm">Try different search terms or reset filters</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-4">
                            {services.map((svc, idx) => {
                                const safeLen = ICON_COLORS.length || 1
                                const { icon, color, bg } = ICON_COLORS[idx % safeLen] ?? ICON_COLORS[0]
                                const avgRating = getAvgRating(svc.provider?.id)
                                return (
                                    <div
                                        key={svc.id}
                                        className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center"
                                    >
                                        <div className={`flex shrink-0 items-center justify-center rounded-lg ${bg} p-3 ${color} sm:size-16`}>
                                            <span className="material-symbols-outlined text-3xl">{icon}</span>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                                                {svc.category && (
                                                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                                                        {svc.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2">{svc.description}</p>
                                            <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500">
                                                {svc.provider?.full_name && (
                                                    <Link
                                                        to={`/consultant/${svc.provider.id}`}
                                                        className="flex items-center gap-1 hover:text-primary transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">person</span>
                                                        {svc.provider.full_name}
                                                    </Link>
                                                )}
                                                {svc.duration_minutes && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                                        {svc.duration_minutes} min
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-3 sm:w-40 sm:items-end">
                                            {avgRating && (
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined material-filled text-sm text-yellow-400">star</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{avgRating}</span>
                                                </div>
                                            )}
                                            {svc.price && (
                                                <p className="text-sm font-bold text-primary">₹{svc.price}/hr</p>
                                            )}
                                            <Link
                                                to={`/services/${svc.id}`}
                                                className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:bg-primary hover:text-white text-center"
                                            >
                                                See Details
                                            </Link>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => fetchServices(page + 1)}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                                >
                                    {loadingMore ? 'Loading…' : 'Show More Services'}
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
