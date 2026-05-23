import { supabase } from '../lib/supabase'
import { isConsultantRole, isClientRole } from '../constants/roles'

const LIST_SELECT = `
    id, invoice_number, amount, currency, status, due_date, paid_at, created_at,
    client:profiles!invoices_client_id_fkey(id, full_name, avatar_url, email),
    consultant:profiles!invoices_consultant_id_fkey(id, full_name, avatar_url)
`

export function list({ role, userId, page = 0, pageSize = 50, includeCount = false }) {
    let query = supabase
        .from('invoices')
        .select(LIST_SELECT, { count: includeCount ? 'exact' : undefined })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (isConsultantRole(role)) query = query.eq('consultant_id', userId)
    else if (isClientRole(role)) query = query.eq('client_id', userId)

    return query
}

export function create(invoiceData) {
    return supabase.from('invoices').insert(invoiceData).select().single()
}

/**
 * Admin view — all invoices, optionally filtered by status, with client
 * profile joined for display.
 */
export function adminList({ status = 'all', page = 0, pageSize = 10 } = {}) {
    let query = supabase
        .from('invoices')
        .select('*, profiles!invoices_client_id_fkey(full_name, email, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
    if (status !== 'all') query = query.eq('status', status)
    return query
}
