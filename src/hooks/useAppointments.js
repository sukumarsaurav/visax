import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useAppointments() {
    const { user, profile } = useAuth()
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user || !profile) return
        fetchAppointments()
    }, [user, profile])

    async function fetchAppointments() {
        setLoading(true)
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                client:profiles!appointments_client_id_fkey(id, full_name, avatar_url, email),
                consultant:profiles!appointments_consultant_id_fkey(id, full_name, avatar_url)
            `)
            .order('scheduled_at', { ascending: true })

        if (error) setError(error.message)
        else setAppointments(data || [])
        setLoading(false)
    }

    async function createAppointment(apptData) {
        const { data, error } = await supabase
            .from('appointments')
            .insert(apptData)
            .select()
            .single()
        if (!error) setAppointments(prev => [...prev, data].sort((a, b) =>
            new Date(a.scheduled_at) - new Date(b.scheduled_at)))
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

    return { appointments, upcoming, loading, error, refetch: fetchAppointments, createAppointment, updateAppointment }
}
