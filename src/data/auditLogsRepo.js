import { supabase } from '../lib/supabase'
import { escapeLikePattern } from '../lib/searchEscape'

/**
 * Paginated audit log query with optional action / entity / date filters.
 * Joins the actor's profile. User-substring filtering happens client-side
 * because PostgREST can't filter on joined columns trivially.
 */
export function list({
    action = '',
    entityType = '',
    dateFrom = '',
    dateTo = '',
    page = 0,
    pageSize = 20,
} = {}) {
    let query = supabase
        .from('audit_logs')
        .select('*, profiles(full_name, email, role)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (action.trim()) query = query.ilike('action', `%${escapeLikePattern(action)}%`)
    if (entityType) query = query.eq('entity_type', entityType)
    if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`)
    if (dateTo)   query = query.lte('created_at', `${dateTo}T23:59:59.999Z`)
    return query
}
