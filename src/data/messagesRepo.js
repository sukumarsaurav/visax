import { supabase } from '../lib/supabase'

/**
 * Server-aggregated conversation list. Returns one row per conversation with
 * the latest message + unread count picked server-side (RPC defined in
 * migration 004).
 */
export async function listConversations(userId) {
    const { data, error } = await supabase.rpc('get_conversations', { p_user_id: userId })
    if (error) return []
    return (data || []).map(r => ({
        otherId: r.other_user_id,
        other: {
            id: r.other_user_id,
            full_name: r.other_name,
            avatar_url: r.other_avatar,
        },
        lastMessage: { content: r.last_message, created_at: r.last_message_at },
        unreadCount: Number(r.unread_count || 0),
    }))
}

/**
 * Full thread between two users, ordered chronologically. Includes sender
 * profile join for rendering avatars in the bubble list.
 */
export function getThread(userId, otherUserId) {
    return supabase
        .from('messages')
        .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true })
}

/** Marks all messages from `otherUserId` to `userId` as read. */
export function markRead(userId, otherUserId) {
    return supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .eq('sender_id', otherUserId)
        .eq('is_read', false)
}

export function send({ senderId, recipientId, content, caseId }) {
    return supabase
        .from('messages')
        .insert({ sender_id: senderId, recipient_id: recipientId, content, case_id: caseId })
        .select()
        .single()
}

/**
 * Subscribe to INSERT/UPDATE on messages addressed to `userId`. Returns an
 * unsubscribe function so the caller can clean up in useEffect's return.
 */
export function subscribeToInbox(userId, handler) {
    const channel = supabase
        .channel(`messages-${userId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${userId}`,
        }, handler)
        .subscribe()
    return () => supabase.removeChannel(channel)
}
