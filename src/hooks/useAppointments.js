import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PAGE_SIZE = 50

export function useAppointments() {
    const { user, profile } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const hasMore = appointments.length < totalCount

    useEffect(() => {
        if (!user || !profile) return
        fetchAppointments(0)
    }, [user, profile])

    async function fetchAppointments(pageNum = 0) {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const from = pageNum * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        const { data, error, count } = await supabase
            .from('appointments')
            .select(`
                id, scheduled_at, status, title, duration_minutes, mode, meeting_link, notes,
                client:profiles!appointments_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!appointments_consultant_id_fkey(id, full_name, avatar_url)
            `, { count: pageNum === 0 ? 'exact' : undefined })
            .order('scheduled_at', { ascending: false })
            .range(from, to)

        if (error) {
            setError(error.message)
        } else {
            setAppointments(prev => pageNum === 0 ? (data || []) : [...prev, ...(data || [])])
            if (count !== undefined) setTotalCount(count)
        }

        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
        setPage(pageNum)
    }

    async function loadMore() {
        if (loadingMore || !hasMore) return
        await fetchAppointments(page + 1)
    }

    async function createAppointment(apptData) {
        const { data, error } = await supabase
            .from('appointments')
            .insert(apptData)
            .select()
            .single()
        if (!error) {
            setAppointments(prev => [data, ...prev])
            setTotalCount(c => c + 1)
        }
        return { data, error }
    }

    async function updateAppointment(id, updates) {
        const { data, error } = await supabase
            .from('appointments')
            .update(updates)
            .eq('id', id)
            .select()
            .single()
        if (!error) setAppointments(prev => prev.map(a => a.id === id ? data : a))
        return { data, error }
    }

    const upcoming = appointments.filter(a =>
        a.status === 'upcoming' && new Date(a.scheduled_at) > new Date()
    )

    return {
        appointments, upcoming, loading, loadingMore, error,
        totalCount, hasMore,
        refetch: () => fetchAppointments(0),
        loadMore,
        createAppointment,
        updateAppointment,
    }
}
