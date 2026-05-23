// Data-access for the `cases` table.
// Pages and hooks should depend on this module instead of importing supabase
// directly — keeps query shape (select columns, joins, filters) in one place
// and makes the layer mockable in tests.
import { supabase } from '../lib/supabase'
import { isConsultantRole, isClientRole } from '../constants/roles'

// Columns + joins used by all list views.
const LIST_SELECT = `
    id, case_number, title, status, progress, visa_type, destination_country, created_at, updated_at,
    client:profiles!cases_client_id_fkey(id, full_name, avatar_url, email),
    consultant:profiles!cases_consultant_id_fkey(id, full_name, avatar_url)
`

/**
 * Paginated list of cases scoped to the caller's role.
 * Returns the raw Supabase response so the hook can read { data, error, count }.
 */
export function list({ role, userId, page = 0, pageSize = 50, includeCount = false }) {
    let query = supabase
        .from('cases')
        .select(LIST_SELECT, { count: includeCount ? 'exact' : undefined })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (isConsultantRole(role)) query = query.eq('consultant_id', userId)
    else if (isClientRole(role)) query = query.eq('client_id', userId)

    return query
}

export function create(caseData) {
    return supabase.from('cases').insert(caseData).select().single()
}

export function update(id, updates) {
    return supabase.from('cases').update(updates).eq('id', id).select().single()
}

/**
 * Consultant "my clients" view — projects cases through the client profile
 * join. Order by activity (updated_at) so the most-recent client surfaces.
 */
export function listClientsForConsultant({ consultantId, page = 0, pageSize = 20 }) {
    return supabase
        .from('cases')
        .select(`
            client_id,
            status,
            visa_type,
            destination_country,
            updated_at,
            client:profiles!cases_client_id_fkey(id, full_name, avatar_url, email, created_at)
        `, { count: 'exact' })
        .eq('consultant_id', consultantId)
        .order('updated_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
}
