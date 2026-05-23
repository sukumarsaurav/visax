import { supabase } from '../lib/supabase'

/** All documents uploaded by a user (admin/case reviews). */
export function listByUploader(userId) {
    return supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', userId)
        .order('created_at', { ascending: false })
}

/**
 * Documents either uploaded by or attached to a client. Clients see both
 * their own uploads and anything a consultant has shared with them.
 */
export function listForClient(userId) {
    return supabase
        .from('documents')
        .select('*')
        .or(`uploaded_by.eq.${userId},client_id.eq.${userId}`)
        .order('created_at', { ascending: false })
}

export function create(payload) {
    return supabase.from('documents').insert(payload)
}

export function createMany(payloads) {
    return supabase.from('documents').insert(payloads)
}

export function remove(id) {
    return supabase.from('documents').delete().eq('id', id)
}
