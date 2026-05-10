import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useMessages(recipientId = null) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        fetchConversations()

        // Real-time subscription
        const channel = supabase
            .channel('messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${user.id}`,
            }, (payload) => {
                setMessages(prev => [...prev, payload.new])
            })
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user])

    async function fetchConversations() {
        setLoading(true)
        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url),
                recipient:profiles!messages_recipient_id_fkey(id, full_name, avatar_url)
            `)
            .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
            .order('created_at', { ascending: false })

        if (!error) {
            setMessages(data || [])
            // Group into conversations by the other party
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
