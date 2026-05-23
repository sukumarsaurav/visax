import { supabase } from '../lib/supabase'
import { sanitizeSearch } from '../lib/searchEscape'

const ADMIN_LIST_SELECT = 'id, full_name, email, city, role, is_claimed, claim_token, claim_token_expires_at, created_at, claimed_at'

/** Admin list — filter by claim status and substring search across name/email/city. */
export function list({ filterStatus = 'all', search = '' } = {}) {
    let query = supabase
        .from('unclaimed_profiles')
        .select(ADMIN_LIST_SELECT)
        .order('created_at', { ascending: false })

    if (filterStatus === 'unclaimed') query = query.eq('is_claimed', false)
    else if (filterStatus === 'claimed') query = query.eq('is_claimed', true)
    if (search) {
        const s = sanitizeSearch(search)
        query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,city.ilike.%${s}%`)
    }
    return query
}

export function create(payload) {
    return supabase.from('unclaimed_profiles').insert(payload)
}

export function createMany(rows) {
    return supabase.from('unclaimed_profiles').insert(rows)
}

export function remove(id) {
    return supabase.from('unclaimed_profiles').delete().eq('id', id)
}

/** Public-facing fetch — only returns rows that are still unclaimed. */
export function getPublic(id) {
    return supabase
        .from('unclaimed_profiles')
        .select('id, full_name, email, phone, bio, avatar_url, specializations, languages, years_experience, city, role')
        .eq('id', id)
        .eq('is_claimed', false)
        .single()
}

/** Record an enquiry against an unclaimed profile. */
export function createEnquiry({ unclaimedId, enquirerName, enquirerEmail, visaType, message }) {
    return supabase
        .from('unclaimed_enquiries')
        .insert({
            unclaimed_id: unclaimedId,
            enquirer_name: enquirerName,
            enquirer_email: enquirerEmail,
            visa_type: visaType,
            message,
        })
}

/** Public lookup by claim token (used on /claim-profile). */
export function getByToken(token) {
    return supabase.rpc('get_unclaimed_profile_by_token', { p_token: token })
}

/** Claim a profile — RPC binds the unclaimed row to the authed user. */
export function claim(token) {
    return supabase.rpc('claim_profile', { p_token: token })
}
