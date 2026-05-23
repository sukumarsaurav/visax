import { supabase } from '../lib/supabase'
import { escapeLikePattern } from '../lib/searchEscape'

/**
 * Admin/consultant resource library list with optional title-substring filter
 * and category filter. Joins the uploader's name.
 */
export function list({ search = '', category = null } = {}) {
    let query = supabase
        .from('resources')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
    if (search.trim()) query = query.ilike('title', `%${escapeLikePattern(search)}%`)
    if (category && category !== 'All') query = query.eq('category', category)
    return query
}

export function create(payload) {
    return supabase.from('resources').insert(payload)
}

export function update(id, payload) {
    return supabase.from('resources').update(payload).eq('id', id)
}

export function remove(id) {
    return supabase.from('resources').delete().eq('id', id)
}

/** Published-only list for the consultant-facing resource library. */
export function listPublished() {
    return supabase
        .from('resources')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
}
