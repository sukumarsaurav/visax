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

        // Single wildcard subscription — halves the number of Supabase channel listeners
        const channel = supabase
            .channel(`notifications-${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setNotifications(prev => [payload.new, ...prev])
                } else if (payload.eventType === 'UPDATE') {
                    setNotifications(prev =>
                        prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
                    )
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user])

    async function fetchNotifications() {
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select('id, type, title, body, is_read, link, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error) setNotifications(data || [])
        setLoading(false)
    }

    async function markAsRead(id) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    async function markAllAsRead() {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false)
        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications }
}
