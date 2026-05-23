// Owns reads/writes of platform_settings rows. The `key` column is the
// stable handle; values are JSONB blobs whose shape is owned by the page
// that writes them.
import { supabase } from '../lib/supabase'

/** Fetch a single key's value (typed by the caller). */
export async function getValue(key) {
    const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', key)
        .single()
    return { value: data?.value ?? null, error }
}

/** Fetch multiple keys in one round-trip. Returns a `{ [key]: value }` map. */
export async function getValues(keys) {
    const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', keys)
    const map = {}
    for (const row of (data || [])) map[row.key] = row.value
    return { values: map, error }
}

/**
 * Upsert a single key. `extra` is merged into the row — useful when the
 * caller wants to set `updated_by` for the audit trail.
 */
export function setValue(key, value, extra = {}) {
    return supabase
        .from('platform_settings')
        .upsert({ key, value, ...extra }, { onConflict: 'key' })
}

/** Admin settings page reads every row (key, value, updated_at). */
export function listAll() {
    return supabase
        .from('platform_settings')
        .select('key, value, updated_at')
}
