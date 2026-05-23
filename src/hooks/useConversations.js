import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserChannel } from '../contexts/UserChannelContext'
import * as messagesRepo from '../data/messagesRepo'

/**
 * Conversation list (one row per peer) with optional realtime updates.
 * Realtime hooks into the shared `user:${id}` channel — no extra WebSocket
 * per consumer. Pass `{ realtime: false }` if you only need the snapshot.
 */
export function useConversations({ realtime = true } = {}) {
    const { user } = useAuth()
    const { subscribe } = useUserChannel()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    const refetch = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const rows = await messagesRepo.listConversations(user.id)
        setConversations(rows)
        setLoading(false)
    }, [user])

    useEffect(() => { refetch() }, [refetch])

    useEffect(() => {
        if (!user || !realtime) return
        return subscribe((table, payload) => {
            if (table !== 'messages') return
            if (payload.eventType === 'INSERT') {
                setConversations(prev => {
                    const otherId = payload.new.sender_id
                    const existing = prev.find(c => c.otherId === otherId)
                    if (existing) {
                        return prev.map(c => c.otherId === otherId
                            ? { ...c, lastMessage: payload.new, unreadCount: c.unreadCount + 1 }
                            : c
                        )
                    }
                    // `other` will be backfilled on next refetch.
                    return [{ otherId, other: null, lastMessage: payload.new, unreadCount: 1 }, ...prev]
                })
            } else if (payload.eventType === 'UPDATE'
                       && payload.new.is_read && !payload.old?.is_read) {
                setConversations(prev => prev.map(c =>
                    c.otherId === payload.new.sender_id
                        ? { ...c, unreadCount: Math.max(0, c.unreadCount - 1) }
                        : c
                ))
            }
        })
    }, [user, realtime, subscribe])

    const unreadCount = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0)

    return { conversations, loading, unreadCount, refetch }
}
