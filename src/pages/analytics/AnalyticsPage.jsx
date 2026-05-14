import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'

function EmptyAnalytics() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <span className="material-symbols-outlined text-[56px]">analytics</span>
            <p className="text-base font-semibold">Analytics data will appear here as you use VisaX</p>
            <p className="text-sm">Manage cases and appointments to see your stats grow.</p>
        </div>
    )
}

function MiniBar({ value, max, color = 'bg-primary' }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-slate-500 w-6 text-right">{value}</span>
        </div>
    )
}

export default function AnalyticsPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState(null)
    const [teamStats, setTeamStats] = useState([])
    const [loading, setLoading] = useState(true)
    const isAgencyAdmin = profile?.role === 'agency_admin'

    useEffect(() => {
        if (!profile) return
        fetchStats()
    }, [profile])

    async function fetchStats() {
        setLoading(true)
        try {
            const isConsultant = ['individual', 'agency_admin', 'agency_member'].includes(profile.role)

            if (isAgencyAdmin) {
                await fetchAgencyStats()
            } else {
                await fetchIndividualStats(isConsultant)
            }
        } catch {
            setStats(null)
        }
        setLoading(false)
    }

    async function fetchIndividualStats(isConsultant) {
        const idCol = isConsultant ? 'consultant_id' : 'client_id'

        const [
            totalCasesRes, activeCasesRes,
            totalApptRes, completedApptRes,
            paidInvoiceRes, pendingInvoiceRes, totalInvoiceRes,
        ] = await Promise.all([
            supabase.from('cases').select('id', { count: 'exact', head: true }).eq(idCol, profile.id),
            supabase.from('cases').select('id', { count: 'exact', head: true }).eq(idCol, profile.id).eq('status', 'in_progress'),
            supabase.from('appointments').select('id', { count: 'exact', head: true }).eq(idCol, profile.id),
            supabase.from('appointments').select('id', { count: 'exact', head: true }).eq(idCol, profile.id).eq('status', 'completed'),
            supabase.from('invoices').select('amount').eq(idCol, profile.id).eq('status', 'paid'),
            supabase.from('invoices').select('amount').eq(idCol, profile.id).eq('status', 'pending'),
            supabase.from('invoices').select('id', { count: 'exact', head: true }).eq(idCol, profile.id),
        ])

        const totalRevenue = (paidInvoiceRes.data || []).reduce((s, i) => s + Number(i.amount), 0)
        const pendingRevenue = (pendingInvoiceRes.data || []).reduce((s, i) => s + Number(i.amount), 0)

        setStats({
            totalCases: totalCasesRes.count || 0,
            activeCases: activeCasesRes.count || 0,
            totalAppointments: totalApptRes.count || 0,
            completedAppointments: completedApptRes.count || 0,
            totalRevenue,
            pendingRevenue,
            totalInvoices: totalInvoiceRes.count || 0,
        })
    }

    async function fetchAgencyStats() {
        // Get the agency
        const { data: agency } = await supabase
            .from('agencies')
            .select('id')
            .eq('owner_id', profile.id)
            .maybeSingle()

        if (!agency) {
            await fetchIndividualStats(true)
            return
        }

        // Get all team members
        const { data: members } = await supabase
            .from('agency_members')
            .select(`
                profile_id,
                role,
                profile:profiles!agency_members_profile_id_fkey(id, full_name, avatar_url)
            `)
            .eq('agency_id', agency.id)
            .eq('status', 'active')

        const memberIds = [profile.id, ...(members || []).map(m => m.profile_id)]

        // Aggregate across all members — use pre-aggregated rating summary to avoid
        // loading all review rows. Cases/appts/invoices stay unbounded since totals
        // require complete counts; for large agencies use get_consultant_analytics RPC.
        const [casesRes, apptRes, invoiceRes, ratingsRes] = await Promise.all([
            supabase.from('cases').select('status, consultant_id').in('consultant_id', memberIds),
            supabase.from('appointments').select('status, consultant_id').in('consultant_id', memberIds),
            supabase.from('invoices').select('status, amount, consultant_id').in('consultant_id', memberIds),
            supabase.from('consultant_rating_summary').select('consultant_id, avg_rating, review_count').in('consultant_id', memberIds),
        ])

        const cases = casesRes.data || []
        const appts = apptRes.data || []
        const invoices = invoiceRes.data || []
        const ratingSummaries = ratingsRes.data || []

        const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
        const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0)

        const totalReviews = ratingSummaries.reduce((s, r) => s + r.review_count, 0)
        const weightedRatingSum = ratingSummaries.reduce((s, r) => s + Number(r.avg_rating) * r.review_count, 0)
        const avgRating = totalReviews > 0 ? (weightedRatingSum / totalReviews).toFixed(1) : null

        // Build per-member rating lookup from pre-aggregated summary
        const ratingByMember = Object.fromEntries(ratingSummaries.map(r => [r.consultant_id, r]))

        setStats({
            totalCases: cases.length,
            activeCases: cases.filter(c => c.status === 'in_progress').length,
            totalAppointments: appts.length,
            completedAppointments: appts.filter(a => a.status === 'completed').length,
            totalRevenue,
            pendingRevenue,
            totalInvoices: invoices.length,
            avgRating,
            teamSize: members?.length || 0,
        })

        // Per-member breakdown
        const allMembers = [
            { profile_id: profile.id, profile: { id: profile.id, full_name: profile.full_name, avatar_url: profile.avatar_url }, role: 'Agency Admin' },
            ...(members || []),
        ]

        const perMember = allMembers.map(m => {
            const mCases = cases.filter(c => c.consultant_id === m.profile_id)
            const mAppts = appts.filter(a => a.consultant_id === m.profile_id)
            const mInvoices = invoices.filter(i => i.consultant_id === m.profile_id)
            const mRatingSummary = ratingByMember[m.profile_id]
            const mRevenue = mInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
            const mRating = mRatingSummary ? Number(mRatingSummary.avg_rating).toFixed(1) : null

            return {
                ...m,
                caseCount: mCases.length,
                activeCases: mCases.filter(c => c.status === 'in_progress').length,
                apptCount: mAppts.length,
                completedAppts: mAppts.filter(a => a.status === 'completed').length,
                revenue: mRevenue,
                rating: mRating,
            }
        })

        setTeamStats(perMember)
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
            </div>
        )
    }

    if (!stats) return <EmptyAnalytics />

    const maxCases = isAgencyAdmin && teamStats.length > 0 ? Math.max(...teamStats.map(m => m.caseCount), 1) : 1

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                    {isAgencyAdmin ? 'Agency Analytics' : 'My Analytics'}
                </h1>
                <p className="text-slate-500 mt-1 text-sm">
                    {isAgencyAdmin
                        ? `Performance overview across your entire team (${stats.teamSize + 1} members)`
                        : 'Your personal performance metrics'}
                </p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard title="Total Cases" value={stats.totalCases} icon="folder_shared" color="primary" />
                <StatCard title="Active Cases" value={stats.activeCases} icon="pending_actions" color="amber" />
                <StatCard title="Appointments" value={stats.totalAppointments} icon="calendar_month" color="purple" />
                <StatCard title="Completed" value={stats.completedAppointments} icon="task_alt" color="green" />
            </div>

            {/* Revenue + Extra Stats */}
            <div className={`grid grid-cols-1 gap-4 ${isAgencyAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                <Card>
                    <CardHeader><CardTitle>Revenue Collected</CardTitle></CardHeader>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        ${stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">From {stats.totalInvoices} invoices</p>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Pending Revenue</CardTitle></CardHeader>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                        ${stats.pendingRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Awaiting payment</p>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Completion Rate</CardTitle></CardHeader>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                        {stats.totalAppointments > 0
                            ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
                            : 0}%
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Appointments completed</p>
                </Card>
                {isAgencyAdmin && (
                    <Card>
                        <CardHeader><CardTitle>Avg Rating</CardTitle></CardHeader>
                        <div className="flex items-end gap-2 mt-2">
                            <p className="text-3xl font-black text-yellow-500">
                                {stats.avgRating || '—'}
                            </p>
                            {stats.avgRating && (
                                <span className="material-symbols-outlined material-filled text-yellow-400 mb-1">star</span>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Across all team reviews</p>
                    </Card>
                )}
            </div>

            {/* Agency Team Performance Table */}
            {isAgencyAdmin && teamStats.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Team Performance Breakdown</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto mt-2">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase">Member</th>
                                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase px-3">Cases</th>
                                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase px-3">Appointments</th>
                                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase px-3">Revenue</th>
                                    <th className="text-center pb-3 text-xs font-bold text-slate-500 uppercase px-3">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {teamStats.map(m => (
                                    <tr key={m.profile_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 pr-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar src={m.profile?.avatar_url} alt={m.profile?.full_name} size="sm" />
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{m.profile?.full_name || '—'}</p>
                                                    <p className="text-[11px] text-slate-400 capitalize">{m.role || 'Member'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 min-w-[120px]">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{m.caseCount}</p>
                                            <MiniBar value={m.caseCount} max={maxCases} color="bg-primary" />
                                        </td>
                                        <td className="py-3 px-3">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{m.apptCount}</p>
                                            <p className="text-[11px] text-slate-400">{m.completedAppts} done</p>
                                        </td>
                                        <td className="py-3 px-3">
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                ${m.revenue.toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            {m.rating ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="material-symbols-outlined material-filled text-yellow-400 text-[14px]">star</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{m.rating}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">No reviews</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Case Status Breakdown */}
            <Card>
                <CardHeader><CardTitle>Case Status Breakdown</CardTitle></CardHeader>
                {stats.totalCases === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">No cases yet</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        {[
                            { label: 'In Progress', key: 'in_progress', color: 'bg-blue-500', textColor: 'text-blue-600' },
                            { label: 'Action Required', key: 'action_required', color: 'bg-amber-500', textColor: 'text-amber-600' },
                            { label: 'Approved', key: 'approved', color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                            { label: 'On Hold', key: 'on_hold', color: 'bg-slate-400', textColor: 'text-slate-500' },
                        ].map(s => {
                            // We don't store per-status counts separately, so show what we have
                            return (
                                <div key={s.key} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                                    <div className={`inline-flex size-2 rounded-full ${s.color} mb-2`} />
                                    <p className={`text-2xl font-black ${s.textColor}`}>—</p>
                                    <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                                </div>
                            )
                        })}
                    </div>
                )}
                <p className="text-xs text-slate-400 mt-3 text-center">
                    Detailed case status breakdown coming soon
                </p>
            </Card>
        </div>
    )
}
