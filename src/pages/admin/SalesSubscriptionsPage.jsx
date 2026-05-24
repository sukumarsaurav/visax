import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { createStripePaymentLink, slackNotify, trackEvent } from '../../lib/integrations'
import { escField } from '../../lib/csvEscape'
import { writeAuditLog } from '../../lib/auditLog'
import * as invoicesRepo from '../../data/invoicesRepo'
import * as promotionsRepo from '../../data/promotionsRepo'
import * as adminStatsRepo from '../../data/adminStatsRepo'
import * as paymentsRepo from '../../data/paymentsRepo'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_COLORS = {
    paid: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    pending: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    overdue: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    draft: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const PAGE_SIZE = 10

export default function SalesSubscriptionsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('invoices')
    const [invoices, setInvoices] = useState([])
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, overdue: 0, count: 0 })
    const [statsLoading, setStatsLoading] = useState(true)
    const [generatingLink, setGeneratingLink] = useState(null)

    const fetchInvoices = useCallback(async () => {
        setLoading(true)
        const { data, count } = await invoicesRepo.adminList({ status: statusFilter, page, pageSize: PAGE_SIZE })
        setInvoices(data || [])
        setTotal(count || 0)
        setLoading(false)
    }, [page, statusFilter])

    // Stats from server-side aggregate RPC — no full-table scan
    const fetchStats = useCallback(async () => {
        setStatsLoading(true)
        const { data } = await adminStatsRepo.getInvoiceStats()
        if (data) {
            setStats({
                totalRevenue: Number(data.total_revenue || 0),
                pending: Number(data.pending || 0),
                overdue: Number(data.overdue || 0),
                count: Number(data.total_count || 0),
            })
        }
        setStatsLoading(false)
    }, [])

    const fetchPromotions = useCallback(async () => {
        const { data } = await promotionsRepo.listAll()
        setPromotions(data || [])
    }, [])

    useEffect(() => { fetchStats() }, [fetchStats])

    useEffect(() => {
        if (activeTab === 'invoices') fetchInvoices()
        if (activeTab === 'promotions') fetchPromotions()
    }, [activeTab, fetchInvoices, fetchPromotions])

    const handleGeneratePaymentLink = async (inv) => {
        setGeneratingLink(inv.id)
        // Record the intent before calling Stripe — prevents duplicate charges if the
        // admin double-clicks or the network drops mid-flight.
        const idempotencyKey = paymentsRepo.newIdempotencyKey()
        const userId = inv.profiles?.id || user?.id
        if (userId) {
            await paymentsRepo.ensureIntent({
                userId,
                idempotencyKey,
                provider: 'stripe',
                amount: Number(inv.amount),
                currency: (inv.currency || 'USD').toLowerCase(),
                metadata: { invoice_id: inv.id },
            })
        }
        const result = await createStripePaymentLink({
            invoice_id: inv.id,
            amount: Number(inv.amount),
            currency: (inv.currency || 'USD').toLowerCase(),
            description: inv.invoice_number || `Invoice ${inv.id.slice(0, 8).toUpperCase()}`,
            customer_email: inv.profiles?.email,
            idempotency_key: idempotencyKey,
        })
        if (result.success) {
            toast.success('Payment link created — opening in new tab')
            window.open(result.url, '_blank')
            // F-SS03: audit log whenever an admin generates a payment link
            await writeAuditLog({
                action: 'Settings Updated',
                entityType: 'invoice',
                entityId: inv.id,
                details: {
                    action: 'payment_link_generated',
                    invoice_number: inv.invoice_number,
                    amount: inv.amount,
                    currency: inv.currency || 'USD',
                    client: inv.profiles?.email,
                },
            })
            slackNotify('payment.received', {
                client: inv.profiles?.full_name || 'Unknown',
                amount: inv.amount,
                currency: inv.currency || 'USD',
                invoice_number: inv.invoice_number,
            })
            trackEvent('payment_link_generated', { amount: inv.amount })
            fetchInvoices()
        } else {
            toast.error(result.error || 'Failed to create payment link')
        }
        setGeneratingLink(null)
    }

    const exportCSV = () => {
        const headers = ['Invoice #', 'Client', 'Email', 'Amount', 'Currency', 'Status', 'Due Date', 'Created']
        const rows = invoices.map(i => [
            i.invoice_number || i.id.slice(0, 8),
            i.profiles?.full_name || '',
            i.profiles?.email || '',
            i.amount,
            i.currency || 'USD',
            i.status,
            i.due_date || '',
            new Date(i.created_at).toLocaleDateString(),
        ])
        const csv = [headers, ...rows].map(r => r.map(escField).join(',')).join('\n')
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'invoices.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="flex flex-col gap-6">
            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" icon="download" onClick={exportCSV}>Report</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: 'payments', color: 'emerald' },
                    { label: 'Total Invoices', value: stats.count, icon: 'receipt_long', color: 'blue' },
                    { label: 'Pending', value: stats.pending, icon: 'pending_actions', color: 'amber' },
                    { label: 'Overdue', value: stats.overdue, icon: 'warning', color: 'red' },
                ].map(s => (
                    <Card key={s.label} className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{s.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : s.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : s.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                            <span className="material-symbols-outlined">{s.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex gap-6">
                    {[
                        { id: 'invoices', label: 'Invoices' },
                        { id: 'promotions', label: 'Promotions' },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id) }}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'invoices' && (
                <>
                    {/* Filters */}
                    <Card className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="flex gap-2 overflow-x-auto">
                            {['all', 'paid', 'pending', 'overdue', 'cancelled'].map(s => (
                                <button key={s} onClick={() => { setStatusFilter(s); setPage(0) }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${statusFilter === s ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'} capitalize`}>
                                    {s === 'all' ? 'All' : s}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Table */}
                    <Card className="p-0 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        {['Invoice', 'Client', 'Amount', 'Status', 'Due Date', 'Created', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                                    {loading ? (
                                        [1, 2, 3, 4].map(i => <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td></tr>)
                                    ) : invoices.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-slate-400">
                                            <span className="material-symbols-outlined text-[48px] block mb-2">receipt_long</span>
                                            No invoices found.
                                        </td></tr>
                                    ) : invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900 dark:text-white">
                                                {inv.invoice_number || `#${inv.id.slice(0, 8).toUpperCase()}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar size="sm" alt={inv.profiles?.full_name} src={inv.profiles?.avatar_url} />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{inv.profiles?.full_name || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-400">{inv.profiles?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                ${Number(inv.amount || 0).toFixed(2)} <span className="text-xs font-normal text-slate-400">{inv.currency || 'USD'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${STATUS_COLORS[inv.status] || STATUS_COLORS.draft}`}>{inv.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {new Date(inv.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {inv.payment_link ? (
                                                    <a href={inv.payment_link} target="_blank" rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline">
                                                        <span className="material-symbols-outlined text-[14px]">link</span>
                                                        Pay Link
                                                    </a>
                                                ) : inv.status !== 'paid' && inv.status !== 'cancelled' ? (
                                                    <button
                                                        onClick={() => handleGeneratePaymentLink(inv)}
                                                        disabled={generatingLink === inv.id}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                                                    >
                                                        <span className={`material-symbols-outlined text-[14px] ${generatingLink === inv.id ? 'animate-spin' : ''}`}>
                                                            {generatingLink === inv.id ? 'sync' : 'add_link'}
                                                        </span>
                                                        {generatingLink === inv.id ? 'Creating...' : 'Stripe Link'}
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 px-6 py-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * PAGE_SIZE + 1, total)}</span>–<span className="font-bold text-slate-900 dark:text-white">{Math.min((page + 1) * PAGE_SIZE, total)}</span> of <span className="font-bold text-slate-900 dark:text-white">{total}</span>
                            </p>
                            <div className="flex gap-1">
                                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                    className="px-3 py-2 rounded-l-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-40">
                                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                    className="px-3 py-2 rounded-r-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-40">
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {activeTab === 'promotions' && (
                <Card className="p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white">Active Promotions</h3>
                        <a href="/admin/referral-program" className="text-sm text-primary font-semibold hover:underline">Manage →</a>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                            <tr>
                                {['Code', 'Discount', 'Redemptions', 'Expires', 'Status'].map(h => (
                                    <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {promotions.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No promotions created yet.</td></tr>
                            ) : promotions.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{p.code}</td>
                                    <td className="px-6 py-4 font-bold text-primary">{p.discount_percent}% off</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.redemption_count || 0}{p.max_redemptions ? ` / ${p.max_redemptions}` : ''}</td>
                                    <td className="px-6 py-4 text-slate-500">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'Never'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${p.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{p.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    )
}
