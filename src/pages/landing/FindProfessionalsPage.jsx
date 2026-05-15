import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { Link, useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Drawer from '../../components/ui/Drawer'
import StarRating from '../../components/ui/StarRating'
import { supabase } from '../../lib/supabase'

const PAGE_SIZE = 9

const TYPE_CONFIG = {
    individual: { label: 'Individual Consultant', icon: 'person', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600' },
    agency_admin: { label: 'Agency', icon: 'apartment', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600' },
    agency_member: { label: 'Agency Member', icon: 'badge', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600' },
}

const quickFilters = [
    { icon: 'gavel', label: 'Lawyers', query: 'lawyer' },
    { icon: 'translate', label: 'Translators', query: 'translator' },
    { icon: 'school', label: 'Student Visa', query: 'student' },
]

export default function FindProfessionalsPage() {
    useSEO(SEO.findProfessionals)
    const [professionals, setProfessionals] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [page, setPage] = useState(0)

    const [searchQuery, setSearchQuery] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all') // all | individual | agency_admin | agency_member
    const [selectedLanguages, setSelectedLanguages] = useState([])
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sortBy, setSortBy] = useState('rating') // rating | price | reviews
    const [filterSheetOpen, setFilterSheetOpen] = useState(false)
    const [compareIds, setCompareIds] = useState([])
    const navigate = useNavigate()

    // Derived language list from loaded data
    const [availableLanguages, setAvailableLanguages] = useState(['English', 'Spanish', 'Mandarin', 'French', 'Arabic'])

    // Maps for ratings and prices
    const [ratingMap, setRatingMap] = useState({})
    const [priceMap, setPriceMap] = useState({})
    const [agencyMap, setAgencyMap] = useState({}) // owner_id -> { id, name, memberCount }
    const [memberAgencyMap, setMemberAgencyMap] = useState({}) // consultant_id -> agency name
    const [unclaimedProfiles, setUnclaimedProfiles] = useState([])

    useEffect(() => {
        loadMeta()
    }, [])

    useEffect(() => {
        setPage(0)
        setProfessionals([])
        fetchProfessionals(0, true)
    }, [appliedSearch, typeFilter, selectedLanguages, minPrice, maxPrice, sortBy])

    async function loadMeta() {
        // consultant_rating_summary is a pre-aggregated materialized view —
        // one row per consultant instead of one row per review.
        const [ratingsRes, servicesRes, agenciesRes, membersRes, unclaimedRes] = await Promise.all([
            supabase.from('consultant_rating_summary').select('consultant_id, avg_rating, review_count'),
            supabase.from('services').select('provider_id, price').eq('is_active', true),
            supabase.from('agencies').select('id, owner_id, name'),
            supabase.from('agency_members').select('profile_id, agency_id, agency:agencies(name)').eq('status', 'active'),
            supabase.from('unclaimed_profiles').select('id, full_name, bio, avatar_url, specializations, languages, years_experience, city, role').eq('is_claimed', false).limit(30),
        ])

        // Build rating map from pre-aggregated view (no in-memory aggregation needed)
        const ratings = {}
        for (const r of (ratingsRes.data || [])) {
            ratings[r.consultant_id] = { sum: Number(r.avg_rating) * r.review_count, count: r.review_count }
        }
        setRatingMap(ratings)

        // Build price map (min price per provider)
        const prices = {}
        for (const s of (servicesRes.data || [])) {
            if (s.price != null && (!prices[s.provider_id] || s.price < prices[s.provider_id])) {
                prices[s.provider_id] = s.price
            }
        }
        setPriceMap(prices)

        // Build agency map: owner_id -> { id, name, memberCount }
        const agencies = {}
        const memberCounts = {}
        for (const m of (membersRes.data || [])) {
            memberCounts[m.agency_id] = (memberCounts[m.agency_id] || 0) + 1
        }
        for (const a of (agenciesRes.data || [])) {
            agencies[a.owner_id] = { id: a.id, name: a.name, memberCount: memberCounts[a.id] || 0 }
        }
        setAgencyMap(agencies)

        // Build member → agency name map
        const memberMap = {}
        for (const m of (membersRes.data || [])) {
            memberMap[m.profile_id] = { agencyId: m.agency_id, agencyName: m.agency?.name }
        }
        setMemberAgencyMap(memberMap)
        setUnclaimedProfiles(unclaimedRes.data || [])
    }

    async function fetchProfessionals(pageNum = 0, reset = false) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        let query = supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role, bio, years_experience, languages, specializations, application_status')
            .eq('application_status', 'approved')
            .in('role', typeFilter === 'all'
                ? ['individual', 'agency_admin', 'agency_member']
                : [typeFilter])

        if (appliedSearch) {
            query = query.or(
                `full_name.ilike.%${appliedSearch}%,bio.ilike.%${appliedSearch}%`
            )
        }

        if (selectedLanguages.length > 0) {
            // Filter profiles that have at least one of the selected languages
            query = query.contains('languages', selectedLanguages)
        }

        query = query
            .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

        const { data } = await query

        if (reset || pageNum === 0) {
            setProfessionals(data || [])
        } else {
            setProfessionals(prev => [...prev, ...(data || [])])
        }
        setHasMore((data || []).length === PAGE_SIZE)
        setPage(pageNum)

        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
    }

    function handleSearch() {
        setAppliedSearch(searchQuery)
    }

    function handleQuickFilter(q) {
        setSearchQuery(q)
        setAppliedSearch(q)
    }

    function toggleLanguage(lang) {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        )
    }

    function getAvgRating(id) {
        const r = ratingMap[id]
        if (!r || r.count === 0) return null
        return (r.sum / r.count).toFixed(1)
    }

    function getReviewCount(id) {
        return ratingMap[id]?.count || 0
    }

    function getMinPrice(id) {
        return priceMap[id] ?? null
    }

    // Sort + filter memoized — only recalculates when inputs change, not on every keystroke
    const filtered = useMemo(() => {
        const sorted = [...professionals].sort((a, b) => {
            if (sortBy === 'rating') return parseFloat(getAvgRating(b.id) || 0) - parseFloat(getAvgRating(a.id) || 0)
            if (sortBy === 'price') return (getMinPrice(a.id) ?? Infinity) - (getMinPrice(b.id) ?? Infinity)
            if (sortBy === 'reviews') return getReviewCount(b.id) - getReviewCount(a.id)
            return 0
        })
        return sorted.filter(p => {
            const price = getMinPrice(p.id)
            if (minPrice && price !== null && price < Number(minPrice)) return false
            if (maxPrice && price !== null && price > Number(maxPrice)) return false
            return true
        })
    }, [professionals, sortBy, minPrice, maxPrice, ratingMap, priceMap])

    function getLink(pro) {
        if (pro.role === 'agency_admin' && agencyMap[pro.id]) {
            return `/agency/${agencyMap[pro.id].id}`
        }
        return `/consultant/${pro.id}`
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <PublicHeader />

            {/* Hero */}
            <section
                className="relative flex min-h-[480px] flex-col gap-6 items-center justify-center p-8 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200')` }}
            >
                <div className="flex flex-col gap-4 text-center max-w-[800px] z-10">
                    <h1 className="text-white text-4xl font-black leading-tight sm:text-5xl lg:text-6xl drop-shadow-sm">
                        Navigate Your Journey with Trusted Experts
                    </h1>
                    <p className="text-slate-200 text-base sm:text-lg max-w-[600px] mx-auto">
                        Connect with verified immigration lawyers, consultants, and translators who understand your story.
                    </p>
                </div>

                <div className="w-full max-w-[640px] z-10 mt-2">
                    <div className="flex w-full h-14 md:h-16 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-xl">
                        <div className="flex items-center justify-center pl-4 text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="flex-1 bg-transparent text-slate-900 dark:text-white px-4 text-sm md:text-base font-medium focus:outline-none placeholder:text-slate-400"
                            placeholder="Try 'H1B Visa' or 'Spanish Translator'..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <div className="flex items-center pr-2">
                            <Button onClick={handleSearch} className="md:h-12">Search</Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-center z-10">
                    {quickFilters.map(f => (
                        <button
                            key={f.label}
                            onClick={() => handleQuickFilter(f.query)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium border border-white/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Main */}
            <main className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-10">
                {/* Type Filter Chips */}
                <div className="mb-8 flex flex-wrap gap-3">
                    {[
                        { key: 'all', label: 'All Professionals' },
                        { key: 'individual', label: 'Individual Consultants' },
                        { key: 'agency_admin', label: 'Agencies' },
                        { key: 'agency_member', label: 'Agency Members' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setTypeFilter(f.key)}
                            className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-all ${typeFilter === f.key
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {f.label}
                            {typeFilter === f.key && <span className="material-symbols-outlined text-[16px]">close</span>}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-6">
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Languages</h4>
                            <div className="flex flex-col gap-2">
                                {availableLanguages.map(lang => (
                                    <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguages.includes(lang)}
                                            onChange={() => toggleLanguage(lang)}
                                            className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">{lang}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-3">Price Range ($/hr)</h4>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                                />
                                <span className="text-slate-400">-</span>
                                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                                />
                            </div>
                        </div>

                        {(selectedLanguages.length > 0 || minPrice || maxPrice) && (
                            <button onClick={() => { setSelectedLanguages([]); setMinPrice(''); setMaxPrice('') }}
                                className="text-sm text-primary font-medium hover:underline text-left"
                            >
                                Clear Filters
                            </button>
                        )}
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[22px] font-bold text-slate-900 dark:text-white">
                                {appliedSearch ? `Results for "${appliedSearch}"` : 'Top Rated Professionals'}
                                {!loading && <span className="text-sm text-slate-400 font-normal ml-2">({filtered.length} shown)</span>}
                            </h2>
                            <div className="flex items-center gap-2">
                                {/* Mobile filter button */}
                                <button
                                    onClick={() => setFilterSheetOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">tune</span>
                                    Filters
                                    {(selectedLanguages.length > 0 || minPrice || maxPrice) && (
                                        <span className="flex items-center justify-center size-5 rounded-full bg-primary text-white text-[10px] font-bold">
                                            {selectedLanguages.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0)}
                                        </span>
                                    )}
                                </button>
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="text-sm font-medium bg-transparent border-none text-primary cursor-pointer focus:ring-0"
                                >
                                    <option value="rating">Highest Rated</option>
                                    <option value="price">Lowest Price</option>
                                    <option value="reviews">Most Reviews</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-[56px]">person_search</span>
                                <p className="text-base font-medium">No professionals found</p>
                                <p className="text-sm">Try a different search or filter</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filtered.map(pro => {
                                        const typeConf = TYPE_CONFIG[pro.role] || TYPE_CONFIG.individual
                                        const avgRating = getAvgRating(pro.id)
                                        const reviewCount = getReviewCount(pro.id)
                                        const minPriceVal = getMinPrice(pro.id)
                                        const agencyInfo = agencyMap[pro.id]
                                        const memberAgency = memberAgencyMap[pro.id]
                                        const link = getLink(pro)

                                        return (
                                            <Link
                                                key={pro.id}
                                                to={link}
                                                state={{ profile: pro }}
                                                className="group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                                            >
                                                {/* Type badge */}
                                                <div className={`px-5 py-2 flex items-center justify-between ${typeConf.bg}`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`material-symbols-outlined text-sm ${typeConf.text}`}>{typeConf.icon}</span>
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${typeConf.text}`}>{typeConf.label}</span>
                                                    </div>
                                                    {avgRating && (
                                                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">
                                                            <span className="material-symbols-outlined text-[14px]">star</span>
                                                            <span className="text-xs font-bold">{avgRating}</span>
                                                            <span className="text-[10px]">({reviewCount})</span>
                                                        </div>
                                                    )}
                                                    {/* Compare checkbox */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            setCompareIds(prev => {
                                                                if (prev.includes(pro.id)) return prev.filter(id => id !== pro.id)
                                                                if (prev.length >= 4) return prev
                                                                return [...prev, pro.id]
                                                            })
                                                        }}
                                                        className={`flex items-center justify-center size-7 rounded-lg border transition-colors ${
                                                            compareIds.includes(pro.id)
                                                                ? 'border-primary bg-primary text-white'
                                                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 hover:border-primary hover:text-primary'
                                                        }`}
                                                        title={compareIds.includes(pro.id) ? 'Remove from comparison' : 'Add to comparison'}
                                                        aria-label={`${compareIds.includes(pro.id) ? 'Remove' : 'Add'} ${pro.full_name} ${compareIds.includes(pro.id) ? 'from' : 'to'} comparison`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">
                                                            {compareIds.includes(pro.id) ? 'check' : 'compare'}
                                                        </span>
                                                    </button>
                                                </div>

                                                <div className="p-5 flex flex-col gap-3 flex-1">
                                                    <div className="flex items-start gap-3">
                                                        {pro.role === 'agency_admin' ? (
                                                            <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                                                <span className="material-symbols-outlined text-2xl text-slate-400">apartment</span>
                                                            </div>
                                                        ) : (
                                                            <Avatar src={pro.avatar_url} alt={pro.full_name} size="lg" />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">
                                                                {pro.role === 'agency_admin' && agencyInfo ? agencyInfo.name : pro.full_name}
                                                            </h3>
                                                            {pro.role === 'agency_admin' && agencyInfo && (
                                                                <p className="text-xs text-slate-500 mt-0.5">
                                                                    <span className="material-symbols-outlined text-[12px] mr-1 align-text-top">groups</span>
                                                                    {agencyInfo.memberCount} Consultants
                                                                </p>
                                                            )}
                                                            {pro.role === 'agency_member' && memberAgency && (
                                                                <p className="text-xs text-primary font-medium mt-0.5">@ {memberAgency.agencyName}</p>
                                                            )}
                                                            {pro.years_experience && (
                                                                <p className="text-xs text-slate-500 mt-0.5">{pro.years_experience} yrs experience</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {pro.specializations?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {pro.specializations.slice(0, 3).map(s => (
                                                                <span key={s} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">{s}</span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {pro.languages?.length > 0 && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                            <span className="material-symbols-outlined text-[16px]">translate</span>
                                                            <span>{pro.languages.slice(0, 3).join(', ')}</span>
                                                        </div>
                                                    )}

                                                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-slate-500">
                                                                {pro.role === 'agency_admin' ? 'Starting from' : 'Consultation'}
                                                            </p>
                                                            {minPriceVal != null ? (
                                                                <p className="font-bold text-slate-900 dark:text-white">
                                                                    ${minPriceVal}<span className="text-xs font-normal text-slate-500">/hr</span>
                                                                </p>
                                                            ) : (
                                                                <p className="text-xs text-slate-400">Contact for pricing</p>
                                                            )}
                                                        </div>
                                                        <Button size="sm">
                                                            {pro.role === 'agency_admin' ? 'View Agency' : 'Book Now'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>

                                {hasMore && (
                                    <div className="mt-10 flex justify-center">
                                        <button
                                            onClick={() => fetchProfessionals(page + 1)}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-900 dark:text-white disabled:opacity-50"
                                        >
                                            {loadingMore ? 'Loading...' : 'Show More Professionals'}
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </button>
                                    </div>
                                )}

                                {/* ── Unclaimed profiles section ── */}
                                {unclaimedProfiles.length > 0 && (
                                    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-amber-500 text-[20px]">pending</span>
                                            <h2 className="text-base font-black text-slate-900 dark:text-white">More consultants on Immizy</h2>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                            These profiles haven't been claimed yet. Enquire directly — we'll notify them and help you connect.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {unclaimedProfiles
                                                .filter(u => !appliedSearch || u.full_name?.toLowerCase().includes(appliedSearch.toLowerCase()) || u.specializations?.some(s => s.toLowerCase().includes(appliedSearch.toLowerCase())))
                                                .map(u => {
                                                    const initials = u.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                                                    return (
                                                        <Link
                                                            key={u.id}
                                                            to={`/consultant/unclaimed/${u.id}`}
                                                            className="group flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                                        >
                                                            <div className="size-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                                                                {u.avatar_url
                                                                    ? <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" />
                                                                    : initials}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{u.full_name}</span>
                                                                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full shrink-0">Unclaimed</span>
                                                                </div>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    {u.role === 'agency_admin' ? 'Agency' : 'Consultant'}
                                                                    {u.city ? ` · ${u.city}` : ''}
                                                                    {u.years_experience > 0 ? ` · ${u.years_experience}+ yrs` : ''}
                                                                </p>
                                                                {u.specializations?.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {u.specializations.slice(0, 2).map(s => (
                                                                            <span key={s} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{s}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-[18px] shrink-0 mt-1">chevron_right</span>
                                                        </Link>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )}

                                {/* Floating compare bar */}
                                {compareIds.length >= 2 && (
                                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-[slideUp_0.3s_ease-out]">
                                        <span className="material-symbols-outlined text-primary text-[20px]">compare</span>
                                        <span className="text-sm font-medium">{compareIds.length} professionals selected</span>
                                        <Button
                                            size="sm"
                                            onClick={() => navigate(`/client/compare?ids=${compareIds.join(',')}`)}
                                        >
                                            Compare Now
                                        </Button>
                                        <button
                                            onClick={() => setCompareIds([])}
                                            className="text-slate-400 hover:text-white transition-colors ml-1"
                                            aria-label="Clear comparison selection"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Trust section */}
                <div className="mt-20 py-12 px-6 bg-primary/5 dark:bg-slate-800/50 rounded-2xl flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex gap-1 mb-2">
                            <StarRating rating={5} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                            "Found a lawyer who spoke my dialect and helped me get my Green Card in record time."
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">CM</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Carlos M.</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Verified User</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 max-w-sm">
                        {[
                            { icon: 'verified_user', color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-900/20', title: 'Vetted Professionals', desc: 'We strictly verify licenses and credentials for every lawyer and consultant.' },
                            { icon: 'lock', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', title: 'Secure Booking', desc: 'Your data is encrypted and payments are held in escrow until consultation.' },
                        ].map(item => (
                            <div key={item.title} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                <div className={`p-2 ${item.bg} rounded ${item.color}`}>
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />

            {/* Mobile Filter Sheet */}
            <Drawer
                open={filterSheetOpen}
                onClose={() => setFilterSheetOpen(false)}
                title="Filters"
                width="max-w-sm"
            >
                <div className="p-6 flex flex-col gap-8">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Languages</h4>
                        <div className="flex flex-col gap-2">
                            {availableLanguages.map(lang => (
                                <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={selectedLanguages.includes(lang)}
                                        onChange={() => toggleLanguage(lang)}
                                        className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">{lang}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-3">Price Range ($/hr)</h4>
                        <div className="flex items-center gap-2">
                            <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                            />
                            <span className="text-slate-400">-</span>
                            <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                                className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        {(selectedLanguages.length > 0 || minPrice || maxPrice) && (
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => { setSelectedLanguages([]); setMinPrice(''); setMaxPrice('') }}
                            >
                                Clear All
                            </Button>
                        )}
                        <Button className="flex-1" onClick={() => setFilterSheetOpen(false)}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </Drawer>
        </div>
    )
}
