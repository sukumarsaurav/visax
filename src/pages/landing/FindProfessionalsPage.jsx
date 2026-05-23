import { useState } from 'react'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import Drawer from '../../components/ui/Drawer'
import StarRating from '../../components/ui/StarRating'
import { useAuth } from '../../contexts/AuthContext'
import { useProfessionalsSearch } from '../../hooks/useProfessionalsSearch'
import ProfessionalCard from './findProfessionals/ProfessionalCard'
import UnclaimedCard from './findProfessionals/UnclaimedCard'
import FilterPanel from './findProfessionals/FilterPanel'
import CompareBar from './findProfessionals/CompareBar'

const quickFilters = [
    { icon: 'gavel',     label: 'Lawyers',      query: 'lawyer' },
    { icon: 'translate', label: 'Translators',  query: 'translator' },
    { icon: 'school',    label: 'Student Visa', query: 'student' },
]

const TYPE_TABS = [
    { key: 'all',           label: 'All Professionals' },
    { key: 'individual',    label: 'Individual Consultants' },
    { key: 'agency_admin',  label: 'Agencies' },
    { key: 'agency_member', label: 'Agency Members' },
]

export default function FindProfessionalsPage() {
    useSEO(SEO.findProfessionals)
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const search = useProfessionalsSearch({
        initialSearch:   searchParams.get('q')        || '',
        initialLocation: searchParams.get('location') || '',
    })

    // Local-only state (not data): compare basket + mobile filter sheet.
    const [compareIds, setCompareIds] = useState([])
    const [filterSheetOpen, setFilterSheetOpen] = useState(false)

    const toggleCompare = (id) => setCompareIds(prev => {
        if (prev.includes(id)) return prev.filter(x => x !== id)
        if (prev.length >= 4) return prev
        return [...prev, id]
    })

    const goToCompare = () => {
        const dest = `/client/compare?ids=${compareIds.join(',')}`
        user ? navigate(dest) : navigate(`/login?redirect=${encodeURIComponent(dest)}`)
    }

    const visibleUnclaimed = search.appliedSearch
        ? search.unclaimedProfiles.filter(u =>
            u.full_name?.toLowerCase().includes(search.appliedSearch.toLowerCase()) ||
            u.specializations?.some(s => s.toLowerCase().includes(search.appliedSearch.toLowerCase()))
        )
        : search.unclaimedProfiles

    const activeFilterCount =
        search.selectedLanguages.length + (search.minPrice ? 1 : 0) + (search.maxPrice ? 1 : 0)

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <PublicHeader />

            {/* Hero */}
            <section
                className="relative flex min-h-[480px] flex-col gap-6 items-center justify-center p-8 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=70&auto=format&fit=crop')` }}
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
                            value={search.searchQuery}
                            onChange={e => search.setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && search.applySearch()}
                        />
                        <div className="flex items-center pr-2">
                            <Button onClick={search.applySearch} className="md:h-12">Search</Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-center z-10">
                    {quickFilters.map(f => (
                        <button
                            key={f.label}
                            onClick={() => search.setQuickSearch(f.query)}
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
                    {TYPE_TABS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => search.setTypeFilter(f.key)}
                            className={`flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-all ${search.typeFilter === f.key
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary'
                            }`}
                        >
                            {f.label}
                            {search.typeFilter === f.key && <span className="material-symbols-outlined text-[16px]">close</span>}
                        </button>
                    ))}
                    {search.locationFilter && (
                        <span className="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium bg-primary/10 text-primary border border-primary/30">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            {search.locationFilter}
                            <button onClick={() => search.setLocationFilter('')} aria-label="Clear location filter">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </span>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex w-64 shrink-0">
                        <FilterPanel
                            availableLanguages={search.availableLanguages}
                            selectedLanguages={search.selectedLanguages}
                            onToggleLanguage={search.toggleLanguage}
                            minPrice={search.minPrice}
                            maxPrice={search.maxPrice}
                            onMinPriceChange={search.setMinPrice}
                            onMaxPriceChange={search.setMaxPrice}
                            onClear={search.clearFilters}
                        />
                    </aside>

                    {/* Results */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[22px] font-bold text-slate-900 dark:text-white">
                                {search.appliedSearch ? `Results for "${search.appliedSearch}"` : 'Top Rated Professionals'}
                                {!search.loading && <span className="text-sm text-slate-400 font-normal ml-2">({search.filtered.length} shown)</span>}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilterSheetOpen(true)}
                                    className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">tune</span>
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <span className="flex items-center justify-center size-5 rounded-full bg-primary text-white text-[10px] font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                                <span className="text-sm text-slate-500">Sort by:</span>
                                <select
                                    value={search.sortBy}
                                    onChange={e => search.setSortBy(e.target.value)}
                                    className="text-sm font-medium bg-transparent border-none text-primary cursor-pointer focus:ring-0"
                                >
                                    <option value="rating">Highest Rated</option>
                                    <option value="price">Lowest Price</option>
                                    <option value="reviews">Most Reviews</option>
                                </select>
                            </div>
                        </div>

                        {search.loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                                ))}
                            </div>
                        ) : search.filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined text-[56px]">person_search</span>
                                <p className="text-base font-medium">No professionals found</p>
                                <p className="text-sm">Try a different search or filter</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {search.filtered.map(pro => (
                                        <ProfessionalCard
                                            key={pro.id}
                                            pro={pro}
                                            avgRating={search.getAvgRating(pro.id)}
                                            reviewCount={search.getReviewCount(pro.id)}
                                            minPrice={search.getMinPrice(pro.id)}
                                            agencyInfo={search.agencyMap[pro.id]}
                                            memberAgency={search.memberAgencyMap[pro.id]}
                                            inCompare={compareIds.includes(pro.id)}
                                            onToggleCompare={toggleCompare}
                                        />
                                    ))}
                                </div>

                                {search.hasMore && (
                                    <div className="mt-10 flex justify-center">
                                        <button
                                            onClick={search.loadMore}
                                            disabled={search.loadingMore}
                                            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-900 dark:text-white disabled:opacity-50"
                                        >
                                            {search.loadingMore ? 'Loading...' : 'Show More Professionals'}
                                            <span className="material-symbols-outlined text-sm">expand_more</span>
                                        </button>
                                    </div>
                                )}

                                {visibleUnclaimed.length > 0 && (
                                    <div className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="material-symbols-outlined text-amber-500 text-[20px]">pending</span>
                                            <h2 className="text-base font-black text-slate-900 dark:text-white">More consultants on Immizy</h2>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                            These profiles haven't been claimed yet. Enquire directly — we'll notify them and help you connect.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {visibleUnclaimed.map(u => <UnclaimedCard key={u.id} profile={u} />)}
                                        </div>
                                    </div>
                                )}

                                <CompareBar
                                    count={compareIds.length}
                                    onCompare={goToCompare}
                                    onClear={() => setCompareIds([])}
                                />
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
                            { icon: 'verified_user', color: 'text-primary',     bg: 'bg-blue-50 dark:bg-blue-900/20',   title: 'Vetted Professionals', desc: 'We strictly verify licenses and credentials for every lawyer and consultant.' },
                            { icon: 'lock',          color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/20', title: 'Secure Booking',       desc: 'Your data is encrypted and payments are held in escrow until consultation.' },
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
                <FilterPanel
                    variant="sheet"
                    availableLanguages={search.availableLanguages}
                    selectedLanguages={search.selectedLanguages}
                    onToggleLanguage={search.toggleLanguage}
                    minPrice={search.minPrice}
                    maxPrice={search.maxPrice}
                    onMinPriceChange={search.setMinPrice}
                    onMaxPriceChange={search.setMaxPrice}
                    onClear={search.clearFilters}
                    onApply={() => setFilterSheetOpen(false)}
                />
            </Drawer>
        </div>
    )
}
