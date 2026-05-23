import { supabase } from '../lib/supabase'

/** Provider's own services (active or not), newest first. */
export function listByProvider(providerId) {
    return supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
}

/** Active services for a single provider, cheapest first (profile pages). */
export function listActiveByProvider(providerId) {
    return supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_active', true)
        .order('price')
}

/** Active services for several providers — used by the compare tool. */
export function listForCompare(providerIds) {
    return supabase
        .from('services')
        .select('provider_id, title, price')
        .eq('is_active', true)
        .in('provider_id', providerIds)
}

export function create(payload) {
    return supabase.from('services').insert(payload)
}

export function update(id, payload) {
    return supabase.from('services').update(payload).eq('id', id)
}

export function setActive(id, isActive) {
    return supabase.from('services').update({ is_active: isActive }).eq('id', id)
}

export function remove(id) {
    return supabase.from('services').delete().eq('id', id)
}

const DETAIL_SELECT = `
    *,
    provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, bio, languages, years_experience, specializations, role)
`

/** Public service-detail page — joins the provider profile. */
export function getById(serviceId) {
    return supabase
        .from('services')
        .select(DETAIL_SELECT)
        .eq('id', serviceId)
        .single()
}

const RELATED_SELECT = `
    id, title, price, category,
    provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, years_experience)
`

/** Up to N other active services in the same category. */
export function listRelated({ category, excludeId, limit = 3 }) {
    return supabase
        .from('services')
        .select(RELATED_SELECT)
        .eq('is_active', true)
        .eq('category', category || '')
        .neq('id', excludeId)
        .limit(limit)
}

/** Distinct categories from active services. */
export function listCategories() {
    return supabase
        .from('services')
        .select('category')
        .eq('is_active', true)
}

/** Active services across all providers — used by the client services page. */
export function listAllActive() {
    return supabase
        .from('services')
        .select('*, provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, is_verified)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
}

/** Marketplace search — services list. */
export function search({ search = '', category = null, sortBy = 'newest', page = 0, pageSize = 12 }) {
    let query = supabase
        .from('services')
        .select(`
            id, title, description, price, duration_minutes, category, is_active, expertise_areas, created_at,
            provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, role)
        `)
        .eq('is_active', true)
    if (search) {
        // Caller must sanitize.
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (category && category !== 'All Services') query = query.eq('category', category)
    if (sortBy === 'price_asc')  query = query.order('price', { ascending: true })
    else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
    else                          query = query.order('created_at', { ascending: false })
    return query.range(page * pageSize, (page + 1) * pageSize - 1)
}
