import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserChannel } from '../contexts/UserChannelContext'
import * as messagesRepo from '../data/messagesRepo'

/**
 * Single-thread message list. Reads off the shared user channel so opening
 * a thread does NOT cost an extra WebSocket — only the message-list filter
 * predicate runs in the React tree.
 */
export function useThread(otherUserId) {
    const { user } = useAuth()
    const { subscribe } = useUserChannel()
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const load = useCallback(async () => {
        if (!user || !otherUserId) return
        setLoading(true)
        const { data } = await messagesRepo.getThread(user.id, otherUserId)
        setMessages(data || [])
        await messagesRepo.markRead(user.id, otherUserId)
        setLoading(false)
    }, [user?.id, otherUserId])

    useEffect(() => { load() }, [load])

    const append = useCallback((msg) => {
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
    }, [])

    // Realtime — filter the shared channel down to this peer's inbound messages.
    useEffect(() => {
        if (!user || !otherUserId) return
        return subscribe((table, payload) => {
            if (table !== 'messages') return
            if (payload.eventType !== 'INSERT') return
            if (payload.new.sender_id !== otherUserId) return
            append(payload.new)
        })
    }, [user?.id, otherUserId, append, subscribe])

    return { messages, loading, reload: load, append }
}
