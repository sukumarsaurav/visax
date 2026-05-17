import { supabase } from './supabase'

/**
 * Write an admin action to audit_logs.
 * Silently swallows errors so a logging failure never blocks the primary action.
 */
export async function writeAuditLog({ action, entityType = null, entityId = null, details = {} }) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('audit_logs').insert({
            user_id: user?.id ?? null,
            action,
            entity_type: entityType,
            entity_id: entityId ?? null,
            details,
        })
    } catch {
        // intentional: audit log failure must never crash the admin UI
    }
}
