import { supabase } from '../lib/supabase'

/** Find the agency owned by a given profile. Returns null if not found. */
export function getByOwner(ownerId) {
    return supabase
        .from('agencies')
        .select('*')
        .eq('owner_id', ownerId)
        .single()
}

/** Full agency row by id — used by the public agency profile. */
export function getById(agencyId) {
    return supabase
        .from('agencies')
        .select('*')
        .eq('id', agencyId)
        .single()
}

/** List all active+pending members for an agency, with profile join. */
export function listMembers(agencyId) {
    return supabase
        .from('agency_members')
        .select('*, profile:profiles!agency_members_profile_id_fkey(id, full_name, avatar_url, email)')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
}

/** Active members only (used by public agency profile, joined with consultant rating). */
export function listActiveMembers(agencyId) {
    return supabase
        .from('agency_members')
        .select(`
            id, role,
            profile:profiles!agency_members_profile_id_fkey(id, full_name, avatar_url, bio, languages, specializations, years_experience)
        `)
        .eq('agency_id', agencyId)
        .eq('status', 'active')
}

export function addMember({ agencyId, profileId, invitedBy }) {
    return supabase
        .from('agency_members')
        .insert({
            agency_id: agencyId,
            profile_id: profileId,
            invited_by: invitedBy,
            status: 'pending',
        })
}

export function setMemberStatus(memberId, status) {
    return supabase
        .from('agency_members')
        .update({ status })
        .eq('id', memberId)
}

/** For a given consultant profile, return the agency they belong to (if any). */
export function getMemberAgency(profileId) {
    return supabase
        .from('agency_members')
        .select('agency:agencies(id, name, owner_id)')
        .eq('profile_id', profileId)
        .eq('status', 'active')
        .maybeSingle()
}
