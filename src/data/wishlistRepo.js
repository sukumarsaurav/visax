import { supabase } from '../lib/supabase'

const LIST_SELECT = `
    id,
    created_at,
    consultant:profiles!wishlist_consultant_id_fkey(
        id, full_name, avatar_url, email,
        years_experience, languages, specializations, bio
    )
`

export function listByClient(clientId) {
    return supabase
        .from('wishlist')
        .select(LIST_SELECT)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
}

/** Upsert is idempotent — duplicate clicks on "save" are a no-op. */
export function add(clientId, consultantId) {
    return supabase
        .from('wishlist')
        .upsert({ client_id: clientId, consultant_id: consultantId }, {
            onConflict: 'client_id,consultant_id',
            ignoreDuplicates: true,
        })
}

export function remove(id) {
    return supabase.from('wishlist').delete().eq('id', id)
}
