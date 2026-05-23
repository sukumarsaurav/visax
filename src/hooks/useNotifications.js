import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserChannel } from '../contexts/UserChannelContext'
import * as notificationsRepo from '../data/notificationsRepo'

export function useNotifications() {
    const { user } = useAuth()
    const { subscribe } = useUserChannel()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetch()
        return subscribe((table, payload) => {
            if (table !== 'notifications') return
            if (payload.eventType === 'INSERT') {
                setNotifications(prev => [payload.new, ...prev])
            } else if (payload.eventType === 'UPDATE') {
                setNotifications(prev =>
                    prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n)
                )
            }
        })
    }, [user, subscribe])

    async function fetch() {
        setLoading(true)
        const { data, error } = await notificationsRepo.list(user.id)
        if (!error) setNotifications(data || [])
        setLoading(false)
    }

    async function markAsRead(id) {
        const { error } = await notificationsRepo.markRead(id)
        if (!error) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        }
    }

    async function markAllAsRead() {
        if (!user) return
        const { error } = await notificationsRepo.markAllRead(user.id)
        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        }
    }

    const unreadCount = useMemo(
        () => notifications.filter(n => !n.is_read).length,
        [notifications]
    )

    return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refetch: fetch }
}
