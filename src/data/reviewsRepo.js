import { supabase } from '../lib/supabase'

const REVIEW_LIST_SELECT = `
    id, rating, comment, created_at, is_anonymous,
    reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)
`

/** Latest reviews for a single consultant — used on the public profile page. */
export function listForConsultant(consultantId, { limit = 5 } = {}) {
    return supabase
        .from('reviews')
        .select(REVIEW_LIST_SELECT)
        .eq('consultant_id', consultantId)
        .order('created_at', { ascending: false })
        .limit(limit)
}

/** Latest reviews for multiple consultants — used on agency profile page. */
export function listForConsultants(consultantIds, { limit = 5 } = {}) {
    return supabase
        .from('reviews')
        .select(REVIEW_LIST_SELECT)
        .in('consultant_id', consultantIds)
        .order('created_at', { ascending: false })
        .limit(limit)
}

export function create(payload) {
    return supabase.from('reviews').insert(payload)
}

/** Look up an existing review for an appointment (used to prevent duplicate submissions). */
export function findForAppointment({ reviewerId, appointmentId }) {
    return supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', reviewerId)
        .eq('appointment_id', appointmentId)
        .maybeSingle()
}
