import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Cap history loaded per fetch — enough for conversation list without full table scan
const CONVERSATION_LIMIT = 200

export function useMessages() {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetchConversations()

        // Single wildcard subscription — one channel, one server connection for both INSERT and UPDATE
        const channel = supabase
            .channel(`messages-${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${user.id}`,
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setMessages(prev => [...prev, payload.new])
                    setConversations(prev => {
                        const otherId = payload.new.sender_id
                        const existing = prev.find(c => c.otherId === otherId)
                        if (existing) {
                            return prev.map(c => c.otherId === otherId
                                ? { ...c, lastMessage: payload.new, unreadCount: c.unreadCount + 1 }
                                : c
                            )
                        }
                        return [{ otherId, other: null, lastMessage: payload.new, unreadCount: 1 }, ...prev]
                    })
                } else if (payload.eventType === 'UPDATE') {
                    setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m))
                    if (payload.new.is_read && !payload.old?.is_read) {
                        setConversations(prev => prev.map(c =>
                            c.otherId === payload.new.sender_id
                                ? { ...c, unreadCount: Math.max(0, c.unreadCount - 1) }
                                : c
                        ))
                    }
                }
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user])

    async function fetchConversations() {
        setLoading(true)
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id, sender_id, recipient_id, content, is_read, created_at, case_id,
                sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
                recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
            `)
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(CONVERSATION_LIMIT)

        if (!error) {
            setMessages(data || [])
            const convMap = {}
            for (const msg of data || []) {
                const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
                if (!convMap[otherId]) {
                    convMap[otherId] = {
                        otherId,
                        other: msg.sender_id === user.id ? msg.recipient : msg.sender,
                        lastMessage: msg,
                        unreadCount: 0,
                    }
                }
                if (msg.recipient_id === user.id && !msg.is_read) {
                    convMap[otherId].unreadCount++
                }
            }
            setConversations(Object.values(convMap))
        }
        setLoading(false)
    }

    async function sendMessage({ recipientId, content, caseId }) {
        const { data, error } = await supabase
            .from('messages')
            .insert({ sender_id: user.id, recipient_id: recipientId, content, case_id: caseId })
            .select()
            .single()
        if (!error) setMessages(prev => [...prev, data])
        return { data, error }
    }

    const unreadCount = messages.filter(m => m.recipient_id === user?.id && !m.is_read).length

    return { messages, conversations, loading, unreadCount, sendMessage, refetch: fetchConversations }
}
