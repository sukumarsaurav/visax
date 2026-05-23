import { useState, useEffect, useMemo, useCallback } from 'react'
import * as marketplaceRepo from '../data/marketplaceRepo'

const PAGE_SIZE = 9
const DEFAULT_LANGUAGES = ['English', 'Spanish', 'Mandarin', 'French', 'Arabic']

/**
 * Owns the marketplace search state machine: filters, pagination, derived
 * sort/price-range filtering, and the four meta maps (rating / price /
 * agency / member-agency) merged from `consultant_marketplace_meta`.
 *
 * Returns plain state + actions; presentational components are unaware of
 * Supabase and can be tested in isolation.
 */
export function useProfessionalsSearch({ initialSearch = '', initialLocation = '' } = {}) {
    const [searchQuery, setSearchQuery] = useState(initialSearch)
    const [appliedSearch, setAppliedSearch] = useState(initialSearch)
    const [locationFilter, setLocationFilter] = useState(initialLocation)
    const [typeFilter, setTypeFilter] = useState('all')
    const [selectedLanguages, setSelectedLanguages] = useState([])
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sortBy, setSortBy] = useState('rating')

    const [professionals, setProfessionals] = useState([])
    const [unclaimedProfiles, setUnclaimedProfiles] = useState([])
    const [availableLanguages, setAvailableLanguages] = useState(DEFAULT_LANGUAGES)

    const [ratingMap, setRatingMap] = useState({})
    const [priceMap, setPriceMap] = useState({})
    const [agencyMap, setAgencyMap] = useState({})
    const [memberAgencyMap, setMemberAgencyMap] = useState({})

    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [page, setPage] = useState(0)

    // One-time loads: unclaimed list.
    useEffect(() => {
        marketplaceRepo.listUnclaimed().then(({ data }) => setUnclaimedProfiles(data || []))
    }, [])

    // Refetch whenever any filter changes.
    useEffect(() => {
        setPage(0)
        setProfessionals([])
        fetchProfessionals(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedSearch, locationFilter, typeFilter, selectedLanguages, minPrice, maxPrice, sortBy])

    const mergeMeta = useCallback((rows) => {
        setRatingMap(prev => {
            const next = { ...prev }
            for (const r of rows) {
                if (r.review_count > 0 && r.avg_rating != null) {
                    next[r.consultant_id] = {
                        sum: Number(r.avg_rating) * r.review_count,
                        count: r.review_count,
                    }
                }
            }
            return next
        })
        setPriceMap(prev => {
            const next = { ...prev }
            for (const r of rows) {
                if (r.min_price != null) next[r.consultant_id] = Number(r.min_price)
            }
            return next
        })
        setAgencyMap(prev => {
            const next = { ...prev }
            for (const r of rows) {
                if (r.owned_agency_id) {
                    next[r.consultant_id] = {
                        id: r.owned_agency_id,
                        name: r.owned_agency_name,
                        memberCount: r.owned_agency_member_count || 0,
                    }
                }
            }
            return next
        })
        setMemberAgencyMap(prev => {
            const next = { ...prev }
            for (const r of rows) {
                if (r.member_agency_id) {
                    next[r.consultant_id] = {
                        agencyId: r.member_agency_id,
                        agencyName: r.member_agency_name,
                    }
                }
            }
            return next
        })
    }, [])

    const fetchProfessionals = useCallback(async (pageNum = 0) => {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const { data } = await marketplaceRepo.listProfessionals({
            typeFilter,
            search: appliedSearch,
            locationFilter,
            selectedLanguages,
            page: pageNum,
            pageSize: PAGE_SIZE,
        })

        const rows = data || []
        if (pageNum === 0) {
            setProfessionals(rows)
            if (rows.length) {
                const langs = [...new Set(rows.flatMap(p => p.languages || []))].sort()
                if (langs.length) setAvailableLanguages(langs)
            }
        } else {
            setProfessionals(prev => [...prev, ...rows])
        }
        setHasMore(rows.length === PAGE_SIZE)
        setPage(pageNum)

        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)

        // Per-page meta fetch — scales O(pageSize), not O(platform size).
        const metaRes = await marketplaceRepo.listMetaForIds(rows.map(p => p.id))
        mergeMeta(metaRes.data || [])
    }, [typeFilter, appliedSearch, locationFilter, selectedLanguages, mergeMeta])

    // Derived helpers.
    const getAvgRating = (id) => {
        const r = ratingMap[id]
        if (!r || r.count === 0) return null
        return (r.sum / r.count).toFixed(1)
    }
    const getReviewCount = (id) => ratingMap[id]?.count || 0
    const getMinPrice = (id) => priceMap[id] ?? null

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [professionals, sortBy, minPrice, maxPrice, ratingMap, priceMap])

    const toggleLanguage = useCallback((lang) => {
        setSelectedLanguages(prev =>
            prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
        )
    }, [])

    const clearFilters = useCallback(() => {
        setSelectedLanguages([])
        setMinPrice('')
        setMaxPrice('')
    }, [])

    const applySearch = useCallback(() => setAppliedSearch(searchQuery), [searchQuery])
    const setQuickSearch = useCallback((q) => {
        setSearchQuery(q)
        setAppliedSearch(q)
    }, [])

    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return
        fetchProfessionals(page + 1)
    }, [loadingMore, hasMore, page, fetchProfessionals])

    return {
        // State
        searchQuery, setSearchQuery,
        appliedSearch,
        locationFilter, setLocationFilter,
        typeFilter, setTypeFilter,
        selectedLanguages, toggleLanguage,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        sortBy, setSortBy,
        // Data
        filtered,
        unclaimedProfiles,
        availableLanguages,
        agencyMap,
        memberAgencyMap,
        // Loading flags
        loading, loadingMore, hasMore,
        // Helpers
        getAvgRating, getReviewCount, getMinPrice,
        // Actions
        applySearch,
        setQuickSearch,
        clearFilters,
        loadMore,
    }
}
