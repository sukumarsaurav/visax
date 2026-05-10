import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'

function EmptyAnalytics() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <span className="material-symbols-outlined text-[56px]">analytics</span>
            <p className="text-base font-semibold">Analytics data will appear here as you use VisaX</p>
            <p className="text-sm">Manage cases and appointments to see your stats grow.</p>
        </div>
    )
}

export default function AnalyticsPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!profile) return
        fetchStats()
    }, [profile])

    async function fetchStats() {
        setLoading(true)
        try {
            const isConsultant = ['individual', 'agency_admin', 'agency_member'].includes(profile.role)

            const [casesRes, apptRes, invoiceRes] = await Promise.all([
                supabase.from('cases').select('status', { count: 'exact' })
                    .eq(isConsultant ? 'consultant_id' : 'client_id', profile.id),
                supabase.from('appointments').select('status', { count: 'exact' })
                    .eq(isConsultant ? 'consultant_id' : 'client_id', profile.id),
                supabase.from('invoices').select('status, amount')
                    .eq(isConsultant ? 'consultant_id' : 'client_id', profile.id),
            ])

            const invoices = invoiceRes.data || []
            const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
            const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0)

            setStats({
                totalCases: casesRes.count || 0,
                activeCases: (casesRes.data || []).filter(c => c.status === 'in_progress').length,
                totalAppointments: apptRes.count || 0,
                completedAppointments: (apptRes.data || []).filter(a => a.status === 'completed').length,
                totalRevenue,
                pendingRevenue,
                totalInvoices: invoices.length,
            })
        } catch {
            setStats(null)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                ))}
            </div>
        )
    }

    if (!stats) return <EmptyAnalytics />

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatCard title="Total Cases" value={stats.totalCases} icon="folder_shared" color="primary" />
                <StatCard title="Active Cases" value={stats.activeCases} icon="pending_actions" color="amber" />
                <StatCard title="Appointments" value={stats.totalAppointments} icon="calendar_month" color="purple" />
                <StatCard title="Completed" value={stats.completedAppointments} icon="task_alt" color="green" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            </div>

            <Card>
                <CardHeader><CardTitle>Activity Overview</CardTitle></CardHeader>
                <div className="py-10 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[40px] mb-2">bar_chart</span>
                    <p className="text-sm">Detailed charts coming soon as more data is collected</p>
                </div>
            </Card>
        </div>
    )
}
