import { supabase } from '../lib/supabase'

/** All availability slots for a consultant. */
export function listByConsultant(consultantId) {
    return supabase
        .from('consultant_availability')
        .select('*')
        .eq('consultant_id', consultantId)
}

/** Active availability slots (used by public profile pages). */
export function listActive(consultantId) {
    return supabase
        .from('consultant_availability')
        .select('*')
        .eq('consultant_id', consultantId)
        .eq('is_active', true)
}

/** Upsert weekly slots; conflict on (consultant_id, weekday). */
export function upsertSlots(rows) {
    return supabase
        .from('consultant_availability')
        .upsert(rows, { onConflict: 'consultant_id,weekday' })
}
