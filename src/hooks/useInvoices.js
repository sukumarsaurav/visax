import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PAGE_SIZE = 50

export function useInvoices({ limit } = {}) {
    const { user, profile } = useAuth()
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const effectiveSize = limit || PAGE_SIZE
    const hasMore = invoices.length < totalCount

    useEffect(() => {
        if (!user || !profile) return
        fetchInvoices(0)
    }, [user, profile])

    async function fetchInvoices(pageNum = 0) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const from = pageNum * effectiveSize
        const to = from + effectiveSize - 1

        let query = supabase
            .from('invoices')
            .select(`
                id, invoice_number, amount, currency, status, due_date, paid_at, created_at,
                client:profiles!invoices_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!invoices_consultant_id_fkey(id, full_name, avatar_url)
            `, { count: pageNum === 0 ? 'exact' : undefined })
            .order('created_at', { ascending: false })
            .range(from, to)

        if (profile?.role === 'individual' || profile?.role === 'agency_admin' || profile?.role === 'agency_member') {
            query = query.eq('consultant_id', user.id)
        } else if (profile?.role === 'client') {
            query = query.eq('client_id', user.id)
        }

        const { data, error, count } = await query

        if (error) {
            setError(error.message)
        } else {
            setInvoices(prev => pageNum === 0 ? (data || []) : [...prev, ...(data || [])])
            if (count !== undefined) setTotalCount(count)
        }

        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
        setPage(pageNum)
    }

    async function loadMore() {
        if (loadingMore || !hasMore) return
        await fetchInvoices(page + 1)
    }

    async function createInvoice(invoiceData) {
        const { data, error } = await supabase
            .from('invoices')
            .insert(invoiceData)
            .select()
            .single()
        if (!error) {
            setInvoices(prev => [data, ...prev])
            setTotalCount(c => c + 1)
        }
        return { data, error }
    }

    return {
        invoices, loading, loadingMore, error,
        totalCount, hasMore,
        refetch: () => fetchInvoices(0),
        loadMore,
        createInvoice,
    }
}
