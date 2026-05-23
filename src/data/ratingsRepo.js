// consultant_rating_summary is a materialized view (migration 004) — one
// row per consultant, refreshed on review insert/update/delete.
import { supabase } from '../lib/supabase'

export function listForConsultants(consultantIds) {
    if (!consultantIds?.length) return Promise.resolve({ data: [] })
    return supabase
        .from('consultant_rating_summary')
        .select('consultant_id, avg_rating, review_count')
        .in('consultant_id', consultantIds)
}

/**
 * All rated consultants. Used by pages that build a rating lookup map ahead
 * of pagination. Cheap thanks to the materialized view, but prefer
 * `listForConsultants(ids)` when the visible set is known.
 */
export function listAll() {
    return supabase
        .from('consultant_rating_summary')
        .select('consultant_id, avg_rating, review_count')
}
