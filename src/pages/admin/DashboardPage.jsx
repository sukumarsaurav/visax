import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import * as adminStatsRepo from '../../data/adminStatsRepo'
import * as profilesRepo from '../../data/profilesRepo'

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [recentUsers, setRecentUsers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchStats() }, [])

    async function fetchStats() {
        setLoading(true)
        // Single RPC call replaces 5 separate queries + full-table invoice scan
        const [{ data: dashData }, { data: usersData }] = await Promise.all([
            adminStatsRepo.getDashboardStats(),
            profilesRepo.recentUsers({ limit: 5 }),
        ])
        setStats(dashData)
        setRecentUsers(usersData || [])
        setLoading(false)
    }

    const roleLabel = { client: 'Client', individual: 'Consultant', agency_admin: 'Agency', agency_member: 'Team Member', admin: 'Admin' }

    const roleCounts = stats?.role_counts || {}
    const totalUsers = Number(stats?.total_users || 0)
    const plans = [
        { name: 'Agency Admins', count: roleCounts['agency_admin'] || 0, color: 'bg-primary' },
        { name: 'Consultants', count: (roleCounts['individual'] || 0) + (roleCounts['agency_member'] || 0), color: 'bg-indigo-500' },
        { name: 'Clients', count: roleCounts['client'] || 0, color: 'bg-slate-400' },
    ]

    const monthlyRevenue = stats?.monthly_revenue || []

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Platform Overview</h2>
                    <p className="text-sm text-slate-500">Real-time Immizy admin dashboard</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/admin/applications">
                        <Button variant="outline" icon="description">Review Applications</Button>
                    </Link>
                    <Link to="/admin/user-management">
                        <Button icon="person_add">Manage Users</Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {loading ? [1,2,3,4].map(i => (
                    <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                )) : (
                    <>
                        <StatCard
                            title="Total Revenue"
                            value={`$${Number(stats?.total_revenue || 0).toLocaleString()}`}
                            icon="payments"
                            color="green"
                        />
                        <StatCard title="Total Users" value={totalUsers} icon="group" color="primary" />
                        <StatCard title="Total Cases" value={Number(stats?.total_cases || 0)} icon="folder_shared" color="purple" />
                        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Pending Review</p>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm dark:bg-amber-900/40">
                                    <span className="material-symbols-outlined text-lg">pending_actions</span>
                                </div>
                            </div>
                            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{Number(stats?.pending_applications || 0)}</h3>
                            <p className="text-xs text-amber-700/70 dark:text-amber-400/70">Applications under review</p>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Subscription breakdown + Revenue chart */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <Card className="overflow-hidden p-0">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white">Subscription Plan Breakdown</h3>
                            <Link to="/admin/sales-subscriptions" className="text-sm font-semibold text-primary hover:underline">View All</Link>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Segment</th>
                                    <th className="px-6 py-3">User Share</th>
                                    <th className="px-6 py-3 text-right">Count</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading ? (
                                    [1,2,3].map(i => <tr key={i}><td colSpan={3} className="px-6 py-3"><div className="h-5 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td></tr>)
                                ) : plans.map(plan => {
                                    const share = totalUsers > 0 ? Math.round((plan.count / totalUsers) * 100) : 0
                                    return (
                                        <tr key={plan.name} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{plan.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800">
                                                        <div className={`h-1.5 rounded-full ${plan.color}`} style={{ width: `${share}%` }} />
                                                    </div>
                                                    <span className="text-slate-600 dark:text-slate-400">{share}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">{plan.count}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </Card>

                    {/* Monthly Revenue sparkline */}
                    <Card>
                        <CardHeader>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Monthly Revenue (last 6 months)</h3>
                                <p className="text-sm text-slate-500">Paid invoices only</p>
                            </div>
                        </CardHeader>
                        {loading ? (
                            <div className="h-48 animate-pulse rounded-lg bg-slate-50 dark:bg-slate-800 mt-4" />
                        ) : monthlyRevenue.length === 0 ? (
                            <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                                <div className="text-center text-slate-400">
                                    <span className="material-symbols-outlined text-[48px]">show_chart</span>
                                    <p className="mt-2 text-sm">No revenue data yet</p>
                                </div>
                            </div>
                        ) : (() => {
                            // Hoist max out of the .map callback — was being recomputed once per bar.
                            const max = Math.max(...monthlyRevenue.map(x => Number(x.revenue || 0)), 1)
                            return (
                            <div className="mt-4 flex items-end gap-2 h-48">
                                {monthlyRevenue.map((m, i) => {
                                    const pct = Math.round((Number(m.revenue || 0) / max) * 100)
                                    return (
                                        <div key={i} className="flex flex-1 flex-col items-center gap-1">
                                            <span className="text-[10px] text-slate-500">${Number(m.revenue || 0).toLocaleString()}</span>
                                            <div className="w-full rounded-t-sm bg-primary/20 dark:bg-primary/30 flex items-end" style={{ height: '140px' }}>
                                                <div className="w-full rounded-t-sm bg-primary transition-all" style={{ height: `${pct}%` }} />
                                            </div>
                                            <span className="text-[10px] text-slate-400">{m.month}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            )
                        })()}
                    </Card>
                </div>

                {/* Right: Recent registrations + User mix */}
                <div className="flex flex-col gap-6">
                    {/* Quick-stat cards wired from RPC data */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Pending Verification', value: Number(stats?.pending_verification || 0), icon: 'verified_user', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                            { label: 'Consultants', value: Number(stats?.consultants || 0), icon: 'school', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                            { label: 'Agencies', value: Number(stats?.agencies || 0), icon: 'apartment', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                            { label: 'Overdue Invoices', value: Number(stats?.overdue_invoices || 0), icon: 'receipt_long', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                        ].map(s => (
                            <Card key={s.label} className="p-4">
                                {loading ? (
                                    <div className="h-12 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                ) : (
                                    <>
                                        <div className={`inline-flex size-8 items-center justify-center rounded-lg ${s.color} mb-2`}>
                                            <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                                    </>
                                )}
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                        </CardHeader>
                        {loading ? (
                            <div className="space-y-3 mt-3">
                                {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                            </div>
                        ) : recentUsers.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-400">No users yet</p>
                        ) : recentUsers.map(u => (
                            <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50 mt-3">
                                <Avatar size="md" alt={u.full_name} src={u.avatar_url} />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{u.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-slate-500">{roleLabel[u.role] || u.role}</p>
                                </div>
                            </div>
                        ))}
                        <Link to="/admin/user-management">
                            <Button variant="secondary" className="mt-4 w-full">View All Users</Button>
                        </Link>
                    </Card>

                    {/* User demographics */}
                    <Card>
                        <CardTitle>User Mix</CardTitle>
                        {loading ? (
                            <div className="h-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 mt-4" />
                        ) : (
                            <>
                                {(() => {
                                    const clients = roleCounts['client'] || 0
                                    const consultants = (roleCounts['individual'] || 0) + (roleCounts['agency_member'] || 0)
                                    const agencies = roleCounts['agency_admin'] || 0
                                    const safeTotal = totalUsers || 1
                                    const cp = Math.round((clients / safeTotal) * 100)
                                    const conp = Math.round((consultants / safeTotal) * 100)
                                    const ap = Math.round((agencies / safeTotal) * 100)
                                    const gradient = `conic-gradient(#136dec 0% ${cp}%, #6366f1 ${cp}% ${cp + conp}%, #cbd5e1 ${cp + conp}% 100%)`
                                    const items = [
                                        { label: 'Clients', count: clients, percent: cp, color: 'bg-primary' },
                                        { label: 'Consultants', count: consultants, percent: conp, color: 'bg-indigo-500' },
                                        { label: 'Agencies', count: agencies, percent: ap, color: 'bg-slate-300' },
                                    ]
                                    return (
                                        <>
                                            <div className="my-4 flex items-center justify-center">
                                                <div className="relative flex size-36 items-center justify-center rounded-full" style={{ background: gradient }}>
                                                    <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                                                        <span className="text-xl font-black text-slate-900 dark:text-white">{totalUsers}</span>
                                                        <span className="text-[10px] text-slate-500">Total</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {items.map(item => (
                                                    <div key={item.label} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`size-3 rounded-full ${item.color}`} />
                                                            <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                                            <span className="text-xs text-slate-400">({item.count})</span>
                                                        </div>
                                                        <span className="font-bold text-slate-900 dark:text-white">{item.percent}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )
                                })()}
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
