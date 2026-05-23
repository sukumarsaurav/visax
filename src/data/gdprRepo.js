// GDPR / account-lifecycle operations.
// Backed by account_export_requests, account_deletion_requests, user_consents
// tables created in migration 007.
import { supabase } from '../lib/supabase'

// ── Data export ──────────────────────────────────────────────────────────────

/**
 * Request a data export for the authenticated user.
 * An edge function (or a pg_cron job) picks this up and uploads a JSON file
 * to the `account-exports` storage bucket.
 */
export async function requestExport(userId) {
    return supabase
        .from('account_export_requests')
        .insert({ user_id: userId, status: 'pending' })
        .select()
        .single()
}

/**
 * Get the latest export request for the user.
 * Returns `null` data when no request exists (no error).
 */
export async function getLatestExport(userId) {
    const { data, error } = await supabase
        .from('account_export_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    return { data, error }
}

// ── Account deletion ─────────────────────────────────────────────────────────

/**
 * Schedule an account deletion for the authenticated user.
 * The soft_delete_profile() function (migration 007) will be invoked by an
 * admin process; the request is kept as an audit trail.
 *
 * @param {string}  userId
 * @param {string}  [reason]   Optional: "no_longer_needed" | "privacy" | "other"
 */
export async function requestDeletion(userId, reason = null) {
    return supabase
        .from('account_deletion_requests')
        .insert({ user_id: userId, status: 'pending', reason })
        .select()
        .single()
}

/**
 * Get the pending/completed deletion request for the user, if any.
 */
export async function getDeletionRequest(userId) {
    const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    return { data, error }
}

// ── Consent log ──────────────────────────────────────────────────────────────

/**
 * Record an explicit consent event (e.g. marketing opt-in / opt-out).
 *
 * @param {{ userId: string, type: string, granted: boolean, version?: string }} opts
 */
export async function logConsent({ userId, type, granted, version = '1.0' }) {
    return supabase
        .from('user_consents')
        .insert({ user_id: userId, consent_type: type, granted, version })
}

/**
 * Get all consent records for a user.
 */
export async function listConsents(userId) {
    return supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
}
