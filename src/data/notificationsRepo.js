import { supabase } from '../lib/supabase'

const LIST_SELECT = 'id, type, title, body, is_read, link, created_at'

/** Most recent 50 notifications for the given user. */
export function list(userId) {
    return supabase
        .from('notifications')
        .select(LIST_SELECT)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
}

/** Server-side count of unread — cheap (uses partial index from migration 004). */
export function countUnread(userId) {
    return supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
}

export function markRead(id) {
    return supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

export function markAllRead(userId) {
    return supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
}

export function subscribe(userId, handler) {
    const channel = supabase
        .channel(`notifications-${userId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
        }, handler)
        .subscribe()
    return () => supabase.removeChannel(channel)
}
