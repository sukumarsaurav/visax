import { supabase } from '../lib/supabase'
import { escapeLikePattern } from '../lib/searchEscape'

/**
 * Admin announcements list. Supports a title search + a scope filter
 * (`Global` / `Agency-specific`). Joins the author's name.
 */
export function list({ search = '', scope = null } = {}) {
    let query = supabase
        .from('announcements')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
    if (search.trim()) query = query.ilike('title', `%${escapeLikePattern(search)}%`)
    if (scope === 'Global') query = query.eq('is_global', true)
    else if (scope === 'Agency-specific') query = query.eq('is_global', false)
    return query
}

export function create(payload) {
    return supabase.from('announcements').insert(payload)
}

export function update(id, payload) {
    return supabase.from('announcements').update(payload).eq('id', id)
}

export function remove(id) {
    return supabase.from('announcements').delete().eq('id', id)
}

/** Consultant-facing list (all announcements, newest first). */
export function listAll() {
    return supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
}
