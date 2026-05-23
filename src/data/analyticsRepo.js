// Thin wrappers around the analytics RPCs. Keeps RPC names + the
// shape coercion (Number(), null fallbacks) out of UI code.
import { supabase } from '../lib/supabase'

export async function getConsultantAnalytics(consultantId) {
    const { data } = await supabase.rpc('get_consultant_analytics', { p_consultant_id: consultantId })
    if (!data) return null
    return {
        totalCases: Number(data.total_cases || 0),
        activeCases: Number(data.active_cases || 0),
        totalAppointments: Number(data.total_appointments || 0),
        completedAppointments: Number(data.completed_appointments || 0),
        totalRevenue: Number(data.total_revenue || 0),
        pendingRevenue: Number(data.pending_revenue || 0),
        totalInvoices: Number(data.total_invoices || 0),
        avgRating: data.avg_rating != null ? Number(data.avg_rating).toFixed(1) : null,
    }
}

export async function getAgencyAnalytics(agencyId) {
    const { data } = await supabase.rpc('get_agency_analytics', { p_agency_id: agencyId })
    if (!data) return null
    const totals = data.totals || {}
    return {
        totals: {
            totalCases: Number(totals.total_cases || 0),
            activeCases: Number(totals.active_cases || 0),
            totalAppointments: Number(totals.total_appointments || 0),
            completedAppointments: Number(totals.completed_appointments || 0),
            totalRevenue: Number(totals.total_revenue || 0),
            pendingRevenue: Number(totals.pending_revenue || 0),
            totalInvoices: Number(totals.total_invoices || 0),
            avgRating: totals.avg_rating != null ? Number(totals.avg_rating).toFixed(1) : null,
            teamSize: Number(totals.team_size || 0),
        },
        members: (data.members || []).map(m => {
            const ratingNum = m.avg_rating != null ? Number(m.avg_rating) : null
            return {
                profile_id: m.profile_id,
                role: m.role,
                profile: m.profile,
                caseCount: Number(m.total_cases || 0),
                activeCases: Number(m.active_cases || 0),
                apptCount: Number(m.total_appointments || 0),
                completedAppts: Number(m.completed_appointments || 0),
                revenue: Number(m.total_revenue || 0),
                rating: ratingNum != null ? ratingNum.toFixed(1) : null,
            }
        }),
    }
}

/** Client-side counts (no client-side RPC yet — volumes are small). */
export async function getClientAnalytics(clientId) {
    const [
        totalCasesRes, activeCasesRes,
        totalApptRes, completedApptRes,
        paidInvoiceRes, pendingInvoiceRes, totalInvoiceRes,
    ] = await Promise.all([
        supabase.from('cases').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
        supabase.from('cases').select('id', { count: 'exact', head: true }).eq('client_id', clientId).eq('status', 'in_progress'),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('client_id', clientId).eq('status', 'completed'),
        supabase.from('invoices').select('amount').eq('client_id', clientId).eq('status', 'paid'),
        supabase.from('invoices').select('amount').eq('client_id', clientId).eq('status', 'pending'),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
    ])
    return {
        totalCases: totalCasesRes.count || 0,
        activeCases: activeCasesRes.count || 0,
        totalAppointments: totalApptRes.count || 0,
        completedAppointments: completedApptRes.count || 0,
        totalRevenue: (paidInvoiceRes.data || []).reduce((s, i) => s + Number(i.amount), 0),
        pendingRevenue: (pendingInvoiceRes.data || []).reduce((s, i) => s + Number(i.amount), 0),
        totalInvoices: totalInvoiceRes.count || 0,
    }
}

export async function getAgencyByOwner(ownerId) {
    const { data } = await supabase
        .from('agencies')
        .select('id')
        .eq('owner_id', ownerId)
        .maybeSingle()
    return data
}

export async function getPlatformStats() {
    const { data } = await supabase.rpc('get_platform_stats')
    if (!data) return null
    return {
        consultants: data.consultant_count || 0,
        avgRating: data.avg_rating ? Number(data.avg_rating).toFixed(1) : null,
        reviews: data.total_reviews || 0,
        totalCases: data.total_cases || 0,
    }
}
