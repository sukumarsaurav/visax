import { supabase } from '../lib/supabase'

/** Last 20 activities for a case, joined with author profile. */
export function listByCase(caseId) {
    return supabase
        .from('case_activities')
        .select('*, author:profiles!case_activities_author_id_fkey(id, full_name, avatar_url)')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(20)
}

/**
 * Record an activity on a case. `type` is one of 'message' | 'note' |
 * 'status_change' (server enum may grow).
 */
export function create({ caseId, authorId, type, content }) {
    return supabase
        .from('case_activities')
        .insert({ case_id: caseId, author_id: authorId, type, content })
}
