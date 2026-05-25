import { supabase } from '../lib/supabase'
import { sanitizeSearch } from '../lib/searchEscape'

// Auth profile fields used across the app. Intentionally omits the
// `notification_preferences` JSONB blob — pages that need it (Settings,
// Availability, ApplicationReview) call getNotificationPreferences on demand.
const AUTH_PROFILE_SELECT = `
    id, email, full_name, avatar_url, phone, role, is_verified,
    bio, country, timezone, onboarding_completed,
    professional_onboarding_complete, application_status,
    languages, years_experience, specializations,
    plan_id, created_at
`

// Admin user-management table needs only the visible columns.
const ADMIN_LIST_SELECT =
    'id, full_name, email, role, application_status, is_verified, avatar_url, created_at'

// Application-review needs application-specific columns (no list-blob columns).
const APPLICATION_REVIEW_SELECT =
    'id, full_name, email, role, application_status, is_verified, avatar_url, country, phone, bio, created_at, notification_preferences'

const APPLICATION_ROLES = ['individual', 'agency_admin']

export function getAuthProfile(userId) {
    return supabase
        .from('profiles')
        .select(AUTH_PROFILE_SELECT)
        .eq('id', userId)
        .single()
}

/** Full row (SettingsPage uses every column the user can edit). */
export function getFullProfile(userId) {
    return supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
}

/** Full row by id — used by public-facing profile pages. */
export function getById(id) {
    return supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
}

/**
 * Look up a consultant profile by SEO slug.
 * Slug format: "priya-sharma-mumbai" (auto-generated from full_name + city).
 * Used by ConsultantProfilePage when the URL param is not a UUID.
 */
export function getBySlug(slug) {
    return supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single()
}

/** Look up a profile by email (case-sensitive — caller should normalise). */
export function getByEmail(email) {
    return supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
}

/** Subset used by the public agency profile (owner card). */
export function getMarketingProfile(profileId) {
    return supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, languages, specializations, years_experience')
        .eq('id', profileId)
        .single()
}

/** Approved consultants for the compare tool / wishlist seed lists. */
export function listForCompare({ limit = 20 } = {}) {
    return supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, years_experience, languages, specializations, is_verified')
        .in('role', ['individual', 'agency_admin'])
        .eq('application_status', 'approved')
        .limit(limit)
}

export function update(userId, updates) {
    return supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
}

/** Update without returning the row — slightly cheaper for fire-and-forget. */
export function updateBare(userId, updates) {
    return supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
}

export function getNotificationPreferences(userId) {
    return supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single()
}

/** Most recently registered users (admin dashboard). */
export function recentUsers({ limit = 5 } = {}) {
    return supabase
        .from('profiles')
        .select('id, full_name, role, created_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(limit)
}

/**
 * Admin user-management paginated list with role filter + name/email
 * substring search. Returns the Supabase response so the caller can read
 * { data, count, error }.
 */
export function adminList({ roleFilter = null, search = '', page = 0, pageSize = 10 }) {
    let query = supabase
        .from('profiles')
        .select(ADMIN_LIST_SELECT, { count: 'exact' })
    if (roleFilter) query = query.eq('role', roleFilter)
    if (search.trim()) {
        const s = sanitizeSearch(search)
        query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`)
    }
    return query
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
}

/**
 * Application-review paginated list. Filter is one of 'pending' | 'approved'
 * | 'rejected' (anything else returns all applicants).
 */
export function applicationList({ filter = 'pending', search = '', page = 0, pageSize = 30 }) {
    let query = supabase
        .from('profiles')
        .select(APPLICATION_REVIEW_SELECT, { count: 'exact' })
        .in('role', APPLICATION_ROLES)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
    if (filter === 'pending')  query = query.eq('application_status', 'pending_review')
    if (filter === 'approved') query = query.eq('application_status', 'approved')
    if (filter === 'rejected') query = query.eq('application_status', 'rejected')
    if (search.trim()) {
        const s = sanitizeSearch(search)
        query = query.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`)
    }
    return query
}
