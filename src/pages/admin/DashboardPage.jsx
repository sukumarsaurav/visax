import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const subscriptionPlans = [
    { name: 'Enterprise (Agency)', users: 0, share: 65, status: 'Stable', color: 'primary' },
    { name: 'Pro Consultant',      users: 0, share: 25, status: 'Growing', color: 'indigo' },
    { name: 'Basic Client',        users: 0, share: 10, status: 'Stable',  color: 'slate' },
]

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchStats() }, [])

    async function fetchStats() {
        setLoading(true)
        const [usersRes, casesRes, invoicesRes, appsRes] = await Promise.all([
            supabase.from('profiles').select('role', { count: 'exact' }),
            supabase.from('cases').select('status', { count: 'exact' }),
            supabase.from('invoices').select('amount, status'),
            supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }).limit(5),
        ])

        const invoices = invoicesRes.data || []
        const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0)
        const roleMap = {}
        for (const u of usersRes.data || []) {
            roleMap[u.role] = (roleMap[u.role] || 0) + 1
        }

        setStats({
            totalUsers: usersRes.count || 0,
            totalCases: casesRes.count || 0,
            totalRevenue: `$${totalRevenue.toLocaleString()}`,
            pendingApplications: (casesRes.data || []).filter(c => c.status === 'under_review').length,
            roleMap,
        })
        setApplications(appsRes.data || [])
        setLoading(false)
    }

    const roleLabel = { client: 'Client', individual: 'Consultant', agency_admin: 'Agency', agency_member: 'Team Member', admin: 'Admin' }

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
                        <StatCard title="Total Revenue" value={stats?.totalRevenue || '$0'} icon="payments" color="green" />
                        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon="group" color="primary" />
                        <StatCard title="Total Cases" value={stats?.totalCases || 0} icon="folder_shared" color="purple" />
                        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Pending Review</p>
                                <div className="flex size-8 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm dark:bg-amber-900/40">
                                    <span className="material-symbols-outlined text-lg">pending_actions</span>
                                </div>
                            </div>
                            <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats?.pendingApplications || 0}</h3>
                            <p className="text-xs text-amber-700/70 dark:text-amber-400/70">Cases under review</p>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Left: Subscription breakdown */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <Card className="overflow-hidden p-0">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                            <h3 className="font-bold text-slate-900 dark:text-white">Subscription Plan Breakdown</h3>
                            <Link to="/admin/sales-subscriptions" className="text-sm font-semibold text-primary hover:underline">View All</Link>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3">Plan</th>
                                    <th className="px-6 py-3">Revenue Share</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {subscriptionPlans.map(plan => (
                                    <tr key={plan.name} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{plan.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-24 rounded-full bg-slate-100 dark:bg-slate-800">
                                                    <div className={`h-1.5 rounded-full ${plan.color === 'primary' ? 'bg-primary' : plan.color === 'indigo' ? 'bg-indigo-500' : 'bg-slate-400'}`} style={{ width: `${plan.share}%` }} />
                                                </div>
                                                <span className="text-slate-600 dark:text-slate-400">{plan.share}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">{plan.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>

                    {/* Revenue placeholder chart */}
                    <Card>
                        <CardHeader>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Monthly Revenue</h3>
                                <p className="text-sm text-slate-500">Connect analytics for live charts</p>
                            </div>
                        </CardHeader>
                        <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800">
                            <div className="text-center text-slate-400">
                                <span className="material-symbols-outlined text-[48px]">show_chart</span>
                                <p className="mt-2 text-sm">Chart data loads from invoices</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: Recent registrations + User mix */}
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Registrations</CardTitle>
                        </CardHeader>
                        {loading ? (
                            <div className="space-y-3 mt-3">
                                {[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                            </div>
                        ) : applications.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-400">No users yet</p>
                        ) : applications.map(u => (
                            <div key={u.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50 mt-3">
                                <Avatar size="md" alt={u.full_name} />
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
                                <div className="my-4 flex items-center justify-center">
                                    <div className="relative flex size-36 items-center justify-center rounded-full"
                                        style={{ background: 'conic-gradient(#136dec 0% 65%, #6366f1 65% 85%, #cbd5e1 85% 100%)' }}>
                                        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900">
                                            <span className="text-xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</span>
                                            <span className="text-[10px] text-slate-500">Total</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {[
                                        { label: 'Clients', percent: 65, color: 'bg-primary' },
                                        { label: 'Consultants', percent: 20, color: 'bg-indigo-500' },
                                        { label: 'Agencies', percent: 15, color: 'bg-slate-300' },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`size-3 rounded-full ${item.color}`} />
                                                <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">{item.percent}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
