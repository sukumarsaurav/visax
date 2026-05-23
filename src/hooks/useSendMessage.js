import { useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import * as messagesRepo from '../data/messagesRepo'

/**
 * Mutation-only hook — does not load conversations or open a realtime
 * channel. Use this on pages that only need to send (CasesPage,
 * ClientsPage) so they don't pay the cost of a get_conversations RPC and
 * a WebSocket on every mount.
 */
export function useSendMessage() {
    const { user } = useAuth()
    return useCallback(({ recipientId, content, caseId }) => {
        if (!user) return Promise.resolve({ data: null, error: new Error('not authenticated') })
        return messagesRepo.send({ senderId: user.id, recipientId, content, caseId })
    }, [user])
}
