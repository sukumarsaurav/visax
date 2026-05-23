import { supabase } from '../lib/supabase'
import { isConsultantRole, isClientRole } from '../constants/roles'

const LIST_SELECT = `
    id, scheduled_at, status, title, duration_minutes, mode, meeting_link, notes,
    client:profiles!appointments_client_id_fkey(id, full_name, avatar_url, email),
    consultant:profiles!appointments_consultant_id_fkey(id, full_name, avatar_url)
`

export function list({ role, userId, page = 0, pageSize = 50, includeCount = false }) {
    let query = supabase
        .from('appointments')
        .select(LIST_SELECT, { count: includeCount ? 'exact' : undefined })
        .order('scheduled_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (isConsultantRole(role)) query = query.eq('consultant_id', userId)
    else if (isClientRole(role)) query = query.eq('client_id', userId)

    return query
}

export function create(apptData) {
    return supabase.from('appointments').insert(apptData).select().single()
}

export function update(id, updates) {
    return supabase.from('appointments').update(updates).eq('id', id).select().single()
}

const FEEDBACK_SELECT = `
    id, title, scheduled_at, duration_minutes,
    consultant:profiles!appointments_consultant_id_fkey(id, full_name, avatar_url)
`

/** Single appointment scoped to a client — used by the feedback form. */
export function getForFeedback({ appointmentId, clientId }) {
    return supabase
        .from('appointments')
        .select(FEEDBACK_SELECT)
        .eq('id', appointmentId)
        .eq('client_id', clientId)
        .single()
}

/** Most-recent completed appointment for the client (fallback when no id). */
export function getLatestCompleted(clientId) {
    return supabase
        .from('appointments')
        .select(FEEDBACK_SELECT)
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(1)
}
