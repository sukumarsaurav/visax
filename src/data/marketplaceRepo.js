import { supabase } from '../lib/supabase'
import { sanitizeSearch, escapeLikePattern } from '../lib/searchEscape'

const PROFILE_LIST_SELECT = 'id, full_name, avatar_url, role, bio, years_experience, languages, specializations, application_status'

/**
 * Paginated, filtered marketplace search over the `profiles` table.
 * The marketplace card meta (ratings, prices, agency info) comes from
 * `consultant_marketplace_meta` — see `loadMetaForIds`.
 */
export function listProfessionals({
    typeFilter = 'all',
    search = '',
    locationFilter = '',
    selectedLanguages = [],
    page = 0,
    pageSize = 9,
}) {
    let query = supabase
        .from('profiles')
        .select(PROFILE_LIST_SELECT)
        .eq('application_status', 'approved')
        .in('role', typeFilter === 'all'
            ? ['individual', 'agency_admin', 'agency_member']
            : [typeFilter])

    if (search) {
        const s = sanitizeSearch(search)
        query = query.or(`full_name.ilike.%${s}%,bio.ilike.%${s}%`)
    }
    if (locationFilter) {
        query = query.ilike('city', `%${escapeLikePattern(locationFilter)}%`)
    }
    if (selectedLanguages.length > 0) {
        query = query.contains('languages', selectedLanguages)
    }

    return query.range(page * pageSize, (page + 1) * pageSize - 1)
}

/** Per-consultant meta (rating, min price, agency) for a list of IDs. */
export function listMetaForIds(ids) {
    if (!ids?.length) return Promise.resolve({ data: [] })
    return supabase
        .from('consultant_marketplace_meta')
        .select('consultant_id, avg_rating, review_count, min_price, owned_agency_id, owned_agency_name, owned_agency_member_count, member_agency_id, member_agency_name')
        .in('consultant_id', ids)
}

export function listUnclaimed({ limit = 30 } = {}) {
    return supabase
        .from('unclaimed_profiles')
        .select('id, full_name, bio, avatar_url, specializations, languages, years_experience, city, role')
        .eq('is_claimed', false)
        .limit(limit)
}
