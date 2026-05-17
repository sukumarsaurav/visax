import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PAGE_SIZE = 50

// Fix #3: was checking profile.user_type which doesn't exist — field is profile.role
// Fix #5: accept optional limit so dashboard can fetch only what it needs
export function useCases({ limit } = {}) {
    const { user, profile } = useAuth()
    const [cases, setCases] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const effectiveSize = limit || PAGE_SIZE
    const hasMore = cases.length < totalCount

    useEffect(() => {
        if (!user || !profile) return
        fetchCases(0)
    }, [user, profile])

    async function fetchCases(pageNum = 0) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const from = pageNum * effectiveSize
        const to = from + effectiveSize - 1

        let query = supabase
            .from('cases')
            .select(`
                id, case_number, title, status, progress, visa_type, destination_country, created_at, updated_at,
                client:profiles!cases_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!cases_consultant_id_fkey(id, full_name, avatar_url)
            `, { count: pageNum === 0 ? 'exact' : undefined })
            .order('created_at', { ascending: false })
            .range(from, to)

        // Fix #3: use profile.role (not profile.user_type which was always undefined)
        if (profile?.role === 'individual' || profile?.role === 'agency_admin' || profile?.role === 'agency_member') {
            query = query.eq('consultant_id', user.id)
        } else if (profile?.role === 'client') {
            query = query.eq('client_id', user.id)
        }

        const { data, error, count } = await query

        if (error) {
            setError(error.message)
        } else {
            setCases(prev => pageNum === 0 ? (data || []) : [...prev, ...(data || [])])
            if (count !== undefined) setTotalCount(count)
        }

        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
        setPage(pageNum)
    }

    async function loadMore() {
        if (loadingMore || !hasMore) return
        await fetchCases(page + 1)
    }

    async function createCase(caseData) {
        const { data, error } = await supabase
            .from('cases')
            .insert(caseData)
            .select()
            .single()
        if (!error) {
            setCases(prev => [data, ...prev])
            setTotalCount(c => c + 1)
        }
        return { data, error }
    }

    async function updateCase(id, updates) {
        const { data, error } = await supabase
            .from('cases')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (!error) setCases(prev => prev.map(c => c.id === id ? data : c))
        return { data, error }
    }

    return {
        cases, loading, loadingMore, error,
        totalCount, hasMore,
        refetch: () => fetchCases(0),
        loadMore,
        createCase,
        updateCase,
    }
}
