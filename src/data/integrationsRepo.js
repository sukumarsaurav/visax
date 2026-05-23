// Integration secrets live in a secured table accessed via SECURITY DEFINER
// RPCs — the frontend never touches the raw row.
import { supabase } from '../lib/supabase'

export function listProviders() {
    return supabase.rpc('get_configured_integration_providers')
}

/**
 * @param {string} provider — e.g. 'slack', 'stripe'
 * @param {Record<string,string>} newSecrets — { secret_key: 'sk_…', … }
 */
export function setSecrets(provider, newSecrets) {
    return supabase.rpc('upsert_integration_secret', {
        p_provider: provider,
        p_new_secrets: newSecrets,
    })
}
