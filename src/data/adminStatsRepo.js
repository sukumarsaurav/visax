// Admin-only RPCs that aggregate cross-table stats server-side.
import { supabase } from '../lib/supabase'

export function getDashboardStats() {
    return supabase.rpc('get_admin_dashboard_stats')
}

export function getInvoiceStats() {
    return supabase.rpc('get_invoice_stats')
}
