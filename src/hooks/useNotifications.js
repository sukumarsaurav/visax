import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useNotifications() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetchNotifications()

        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev])
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user])

    async function fetchNotifications() {
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error) setNotifications(data || [])
        setLoading(false)
    }

    async function markAsRead(id) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    async function markAllAsRead() {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
