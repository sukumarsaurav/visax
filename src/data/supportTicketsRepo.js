import { supabase } from '../lib/supabase'

export function create(payload) {
    return supabase.from('support_tickets').insert(payload)
}
