import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PAGE_SIZE = 50

export function useCases() {
    const { user, profile } = useAuth()
    const [cases, setCases] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const hasMore = cases.length < totalCount

    useEffect(() => {
        if (!user || !profile) return
        fetchCases(0)
    }, [user, profile])

    async function fetchCases(pageNum = 0) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const from = pageNum * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        const { data, error, count } = await supabase
            .from('cases')
            .select(`
                id, case_number, title, status, visa_type, destination_country, created_at, updated_at,
                client:profiles!cases_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!cases_consultant_id_fkey(id, full_name, avatar_url)
            `, { count: pageNum === 0 ? 'exact' : undefined })
            .order('created_at', { ascending: false })
            .range(from, to)

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
