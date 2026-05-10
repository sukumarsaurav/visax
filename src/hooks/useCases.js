import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useCases() {
    const { user, profile } = useAuth()
    const [cases, setCases] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user || !profile) return
        fetchCases()
    }, [user, profile])

    async function fetchCases() {
        setLoading(true)
        let query = supabase
            .from('cases')
            .select(`
                *,
                client:profiles!cases_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!cases_consultant_id_fkey(id, full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })

        const { data, error } = await query
        if (error) setError(error.message)
        else setCases(data || [])
        setLoading(false)
    }

    async function createCase(caseData) {
        const { data, error } = await supabase
            .from('cases')
            .insert(caseData)
            .select()
            .single()
        if (!error) setCases(prev => [data, ...prev])
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

    return { cases, loading, error, refetch: fetchCases, createCase, updateCase }
}
