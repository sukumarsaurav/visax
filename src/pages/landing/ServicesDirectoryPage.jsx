import { useState, useEffect } from 'react'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { supabase } from '../../lib/supabase'

const PAGE_SIZE = 10

const ICON_COLORS = [
    { icon: 'work', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: 'family_restroom', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: 'school', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: 'gavel', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: 'description', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: 'flight_takeoff', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: 'translate', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { icon: 'flag', color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

export default function ServicesDirectoryPage() {
    useSEO(SEO.services)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [page, setPage] = useState(0)
    const [ratingMap, setRatingMap] = useState({})

    const [searchQuery, setSearchQuery] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [activeCategory, setActiveCategory] = useState('All Services')
    const [categories, setCategories] = useState(['All Services'])
    const [sortBy, setSortBy] = useState('recommended')

    useEffect(() => {
        fetchCategoriesAndRatings()
    }, [])

    useEffect(() => {
        setPage(0)
        setServices([])
        fetchServices(0, true)
    }, [appliedSearch, activeCategory, sortBy])

    async function fetchCategoriesAndRatings() {
        // Get all unique categories
        const { data: cats } = await supabase
            .from('services')
            .select('category')
            .eq('is_active', true)

        const uniqueCats = ['All Services', ...new Set((cats || []).map(c => c.category).filter(Boolean))]
        setCategories(uniqueCats)

        // Use pre-aggregated materialized view — one row per consultant vs one per review
        const { data: ratingSummaries } = await supabase
            .from('consultant_rating_summary')
            .select('consultant_id, avg_rating, review_count')

        const ratings = {}
        for (const r of (ratingSummaries || [])) {
            ratings[r.consultant_id] = { sum: Number(r.avg_rating) * r.review_count, count: r.review_count }
        }
        setRatingMap(ratings)
    }

    async function fetchServices(pageNum = 0, reset = false) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        let query = supabase
            .from('services')
            .select(`
                id, title, description, price, duration_minutes, category, is_active, expertise_areas, created_at,
                provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, role)
            `)
            .eq('is_active', true)

        if (appliedSearch) {
            query = query.or(`title.ilike.%${appliedSearch}%,description.ilike.%${appliedSearch}%`)
        }

        if (activeCategory !== 'All Services') {
            query = query.eq('category', activeCategory)
        }

        if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
        else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
        else if (sortBy === 'newest') query = query.order('created_at', { ascending: false })
        else query = query.order('created_at', { ascending: false }) // recommended = newest for now

        query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

        const { data } = await query

        if (reset || pageNum === 0) setServices(data || [])
        else setServices(prev => [...prev, ...(data || [])])

        setHasMore((data || []).length === PAGE_SIZE)
        setPage(pageNum)
        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
    }

    function handleSearch() { setAppliedSearch(searchQuery) }

    function getAvgRating(providerId) {
        const r = ratingMap[providerId]
        if (!r || r.count === 0) return null
        return (r.sum / r.count).toFixed(1)
    }

    // Split services into featured (first 3) and rest
    const featuredServices = services.slice(0, 3)
    const restServices = services.slice(3)

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1 flex flex-col">
                {/* Hero */}
                <section className="relative bg-slate-900 py-16 md:py-24">
                    <div className="absolute inset-0 z-0 opacity-20">
                        <div className="h-full w-full bg-gradient-to-br from-primary to-blue-800" />
                    </div>
                    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 md:px-10">
                        <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6 text-center">
                            <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                                Find the Right Immigration<br className="hidden md:block" /> Help for Your Journey
                            </h1>
                            <p className="text-base font-medium text-slate-200 md:text-lg">
                                Browse services offered by verified professionals and agencies tailored to your needs.
                            </p>
                            <div className="mx-auto flex w-full max-w-[600px]">
                                <div className="relative flex h-14 w-full items-center overflow-hidden rounded-xl bg-white shadow-lg focus-within:ring-2 focus-within:ring-primary md:h-16">
                                    <div className="flex h-full w-14 items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search 'Student Visa', 'Green Card', 'Asylum'..."
                                        className="h-full flex-1 border-0 bg-transparent p-0 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0"
                                    />
                                    <div className="p-2">
                                        <button onClick={handleSearch} className="flex h-full items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-blue-600 transition-colors py-2">
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-10 lg:gap-12 lg:py-12">
                    {/* Sidebar */}
                    <aside className="flex w-full flex-col gap-6 md:w-64 lg:w-72 md:shrink-0">
                        <div className="sticky top-24 flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                                {(appliedSearch || activeCategory !== 'All Services') && (
                                    <button onClick={() => { setAppliedSearch(''); setSearchQuery(''); setActiveCategory('All Services') }}
                                        className="text-sm font-medium text-primary hover:underline">Reset</button>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                                <div className="flex flex-col gap-1.5">
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
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                    <option value="recommended">Recommended</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex flex-1 flex-col">
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
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
                                {/* Featured Services (first 3) */}
                                {featuredServices.length > 0 && page === 0 && (
                                    <div className="mb-10 flex flex-col gap-6">
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                            {appliedSearch ? `Results for "${appliedSearch}"` : 'Featured Services'}
                                        </h2>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {featuredServices.map((svc, idx) => {
                                                const { icon, color, bg } = ICON_COLORS[idx % ICON_COLORS.length]
                                                const avgRating = getAvgRating(svc.provider?.id)
                                                return (
                                                    <div key={svc.id} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                                        <div className="mb-4">
                                                            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${bg} ${color}`}>
                                                                <span className="material-symbols-outlined text-2xl">{icon}</span>
                                                            </div>
                                                            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                                                            <p className="mb-4 text-sm leading-relaxed text-slate-500 line-clamp-2">{svc.description}</p>
                                                            {avgRating && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="material-symbols-outlined material-filled text-lg text-yellow-400">star</span>
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{avgRating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                                                            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                                                                {svc.provider?.full_name && (
                                                                    <span>by <span className="font-bold text-slate-900 dark:text-white">{svc.provider.full_name}</span></span>
                                                                )}
                                                                {svc.price && (
                                                                    <span className="font-bold text-primary">${svc.price}/hr</span>
                                                                )}
                                                            </div>
                                                            <Link to={`/services/${svc.id}`}
                                                                className="w-full block text-center rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-600"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* All Services List */}
                                {restServices.length > 0 && (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                {featuredServices.length > 0 ? 'More Services' : 'All Services'}
                                            </h2>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {restServices.map((svc, idx) => {
                                                const { icon, color, bg } = ICON_COLORS[(idx + 3) % ICON_COLORS.length]
                                                const avgRating = getAvgRating(svc.provider?.id)
                                                return (
                                                    <div key={svc.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center">
                                                        <div className={`flex shrink-0 items-center justify-center rounded-lg ${bg} p-3 ${color} sm:h-16 sm:w-16`}>
                                                            <span className="material-symbols-outlined text-3xl">{icon}</span>
                                                        </div>
                                                        <div className="flex flex-1 flex-col gap-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                                                                {svc.category && (
                                                                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">{svc.category}</span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-slate-500 line-clamp-2">{svc.description}</p>
                                                            <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500">
                                                                {svc.provider?.full_name && (
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="material-symbols-outlined text-sm">person</span>
                                                                        {svc.provider.full_name}
                                                                    </span>
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
                                                                <p className="text-sm font-bold text-primary">${svc.price}/hr</p>
                                                            )}
                                                            <Link to={`/services/${svc.id}`}
                                                                className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 text-center"
                                                            >
                                                                See Details
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Load More */}
                                {hasMore && (
                                    <div className="mt-8 flex justify-center">
                                        <button
                                            onClick={() => fetchServices(page + 1)}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                        >
                                            {loadingMore ? 'Loading...' : 'Show More Services'}
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
