import { supabase } from '../lib/supabase'

export function listAll() {
    return supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false })
}

export function create(payload) {
    return supabase.from('promotions').insert(payload)
}

export function setStatus(id, status) {
    return supabase.from('promotions').update({ status }).eq('id', id)
}

export function remove(id) {
    return supabase.from('promotions').delete().eq('id', id)
}
