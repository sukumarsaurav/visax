import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useInvoices() {
    const { user } = useAuth()
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return
        fetchInvoices()
    }, [user])

    async function fetchInvoices() {
        setLoading(true)
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                client:profiles!invoices_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!invoices_consultant_id_fkey(id, full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })

        if (error) setError(error.message)
        else setInvoices(data || [])
        setLoading(false)
    }

    async function createInvoice(invoiceData) {
        const { data, error } = await supabase
            .from('invoices')
            .insert(invoiceData)
            .select()
            .single()
        if (!error) setInvoices(prev => [data, ...prev])
        return { data, error }
    }

    return { invoices, loading, error, refetch: fetchInvoices, createInvoice }
}
