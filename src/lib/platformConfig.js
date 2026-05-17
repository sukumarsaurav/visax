/**
 * Thin singleton cache for platform_settings rows that the frontend needs at runtime.
 * Call loadPlatformConfig() once on app boot; all other reads are synchronous.
 * Call invalidatePlatformConfig() after saving settings so the next read re-fetches.
 */
import { supabase } from './supabase'

let _config = {
    general: { max_upload_mb: 25, maintenance_mode: false },
    maintenance_message: { message: 'We are currently performing scheduled maintenance. We will be back shortly.' },
    legal: { terms_url: '', privacy_url: '' },
}
let _loaded = false
let _inflightPromise = null

export async function loadPlatformConfig() {
    if (_loaded) return _config
    if (_inflightPromise) return _inflightPromise

    _inflightPromise = supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['general', 'maintenance_message', 'legal'])
        .then(({ data }) => {
            if (data) {
                for (const row of data) {
                    if (row.value) _config[row.key] = row.value
                }
            }
            _loaded = true
            _inflightPromise = null
            return _config
        })

    return _inflightPromise
}

export function getPlatformConfig() { return _config }
export function getMaxUploadMb() { return _config.general?.max_upload_mb || 25 }
export function getMaintenanceMode() { return _config.general?.maintenance_mode || false }
export function getMaintenanceMessage() {
    return _config.maintenance_message?.message || 'We are currently performing scheduled maintenance. We will be back shortly.'
}
export function getLegalConfig() { return _config.legal || {} }

export function invalidatePlatformConfig() { _loaded = false }
