import { supabase } from '../lib/supabase'

export function listByConsultant(consultantId) {
    return supabase
        .from('client_invitations')
        .select('*, client:profiles!client_invitations_client_id_fkey(id, full_name, avatar_url)')
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false })
}

export function create({ consultantId, clientEmail, permissions, message, token, expiresAt }) {
    return supabase
        .from('client_invitations')
        .insert({
            consultant_id: consultantId,
            client_email: clientEmail,
            status: 'pending',
            permissions,
            message,
            token,
            expires_at: expiresAt,
        })
        .select()
        .single()
}

export function cancel(id) {
    return supabase
        .from('client_invitations')
        .update({ status: 'cancelled' })
        .eq('id', id)
}

export function resend(id, expiresAt) {
    return supabase
        .from('client_invitations')
        .update({ expires_at: expiresAt, status: 'pending' })
        .eq('id', id)
}

/** Lookup an invitation by its public token (used on /accept-invite). */
export function getByToken(token) {
    return supabase
        .from('client_invitations')
        .select('*, consultant:profiles!client_invitations_consultant_id_fkey(id, full_name, avatar_url)')
        .eq('token', token)
        .single()
}

/** Mark an invitation accepted and bind it to the new client account. */
export function accept(token, clientId) {
    return supabase
        .from('client_invitations')
        .update({ status: 'accepted', client_id: clientId })
        .eq('token', token)
}
