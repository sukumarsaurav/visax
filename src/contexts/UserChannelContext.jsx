import { createContext, useContext, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const UserChannelContext = createContext(null)

/**
 * Single Supabase realtime channel per signed-in user. All inbox/
 * notification subscribers attach handlers via subscribe(); the channel
 * stays open for the entire dashboard session, avoiding the per-mount
 * teardown/recreate cycle that the per-hook channels were doing.
 *
 * Capacity note: at 1K concurrent users, opening 2-3 channels per user
 * (one per hook) blew past Supabase Pro's 500-concurrent-WS ceiling. This
 * provider consolidates to one channel per user — 1K WS total.
 *
 * Filter routing happens client-side after dispatch — postgres_changes
 * payloads include the table name, so each subscriber filters on
 * `payload.table`.
 */
export function UserChannelProvider({ children }) {
    const { user } = useAuth()
    // Set of handler refs. Using a ref so the dispatcher in useEffect
    // closure sees the latest handlers without re-subscribing.
    const handlersRef = useRef(new Set())
    const channelRef = useRef(null)

    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel(`user:${user.id}`)
            // Inbox: all messages addressed to this user.
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${user.id}`,
            }, (payload) => dispatch('messages', payload))
            // Notifications targeted at this user.
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
            }, (payload) => dispatch('notifications', payload))
            .subscribe()

        channelRef.current = channel

        function dispatch(table, payload) {
            for (const handler of handlersRef.current) {
                try {
                    handler(table, payload)
                } catch (err) {
                    // Don't let one bad subscriber kill the dispatcher.
                    // eslint-disable-next-line no-console
                    console.error('UserChannel handler error:', err)
                }
            }
        }

        return () => {
            supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [user])

    /**
     * Add a handler. Returns an unsubscribe function — usual useEffect
     * cleanup convention so consumers don't need to track ids manually.
     *
     * @param {(table: 'messages'|'notifications', payload: any) => void} handler
     */
    function subscribe(handler) {
        handlersRef.current.add(handler)
        return () => handlersRef.current.delete(handler)
    }

    return (
        <UserChannelContext.Provider value={{ subscribe }}>
            {children}
        </UserChannelContext.Provider>
    )
}

/**
 * Get the dispatcher. Returns a `subscribe(handler)` function. Components
 * that don't need realtime can omit calling this hook entirely — the
 * provider stays mounted but does nothing until a subscriber appears.
 */
export function useUserChannel() {
    const ctx = useContext(UserChannelContext)
    if (!ctx) throw new Error('useUserChannel must be used within UserChannelProvider')
    return ctx
}
