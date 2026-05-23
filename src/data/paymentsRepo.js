// Payment intents are the dedup unit for outbound charges. The frontend
// generates an idempotency key + UI session, inserts a `pending` row,
// then invokes the provider edge function with that key. If the user
// double-clicks or the network drops, the second call hits the same row
// (UNIQUE on (user_id, idempotency_key)) instead of creating a duplicate
// charge.
//
// Backed by the payment_intents table in migration 007.
import { supabase } from '../lib/supabase'

/** Cryptographically-random idempotency key (UUIDv4 via crypto API). */
export function newIdempotencyKey() {
    // crypto.randomUUID is available in all modern browsers + Node 19+.
    return crypto.randomUUID()
}

/**
 * Record a payment intent before invoking the provider. Returns the row;
 * if the same (user_id, idempotency_key) already exists, returns the
 * existing row instead of erroring out — that's the dedup property.
 */
export async function ensureIntent({ userId, idempotencyKey, provider, amount, currency = 'INR', metadata = {} }) {
    // Optimistic insert; on conflict we just read back the original row.
    const { data, error } = await supabase
        .from('payment_intents')
        .upsert(
            { user_id: userId, idempotency_key: idempotencyKey, provider, amount, currency, metadata },
            { onConflict: 'user_id,idempotency_key', ignoreDuplicates: false }
        )
        .select()
        .single()
    return { data, error }
}

/** Read a payment intent's current state — used by post-payment polling/UI. */
export function getIntent(id) {
    return supabase
        .from('payment_intents')
        .select('*')
        .eq('id', id)
        .single()
}

/**
 * Look up an intent by its idempotency key — useful for resuming a payment
 * after a browser refresh (we can show "Payment in progress" instead of
 * starting a fresh order).
 */
export function getIntentByKey(userId, idempotencyKey) {
    return supabase
        .from('payment_intents')
        .select('*')
        .eq('user_id', userId)
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle()
}

/**
 * Mark the intent's outcome. The DB CHECK constraint (migration 009)
 * enforces a valid state machine: pending → succeeded | failed | cancelled.
 *
 * @param {string} id          payment_intents.id
 * @param {'succeeded'|'failed'|'cancelled'} status
 * @param {object} [extra]     Optional fields to merge (provider_payment_id, error_message, etc.)
 */
export function setIntentStatus(id, status, extra = {}) {
    return supabase
        .from('payment_intents')
        .update({ status, ...extra, updated_at: new Date().toISOString() })
        .eq('id', id)
        // Only succeed if status is still pending — prevents overwriting a webhook update.
        .eq('status', 'pending')
        .select()
        .maybeSingle()
}

/** All intents created by a given user (admin views / billing history). */
export function listForUser(userId, { limit = 50 } = {}) {
    return supabase
        .from('payment_intents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
}
