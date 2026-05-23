import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../contexts/AuthContext'
import { useSendMessage } from '../../hooks/useSendMessage'
import { formatDate } from '../../utils/date'
import * as casesRepo from '../../data/casesRepo'

const STATUS_COLORS = {
    in_progress: 'blue', under_review: 'purple', docs_pending: 'amber',
    action_required: 'orange', approved: 'green', rejected: 'red',
    closed: 'slate', draft: 'slate',
}
const STATUS_LABELS = {
    in_progress: 'In Progress', under_review: 'Under Review', docs_pending: 'Docs Pending',
    action_required: 'Action Required', approved: 'Approved', rejected: 'Rejected',
    closed: 'Closed', draft: 'Draft',
}

const PAGE_SIZE = 20

export default function ClientsPage() {
    const { user } = useAuth()
    const sendMessage = useSendMessage()
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [msgClientId, setMsgClientId] = useState(null)
    const [msgText, setMsgText] = useState('')
    const [sending, setSending] = useState(false)

    useEffect(() => {
        if (!user) return
        fetchClients()
    }, [user, page])

    async function fetchClients() {
        setLoading(true)
        const { data, error, count } = await casesRepo.listClientsForConsultant({
            consultantId: user.id,
            page,
            pageSize: PAGE_SIZE,
        })

        if (!error) {
            // Deduplicate by client_id, keeping most recent case info
            const seen = new Set()
            const unique = []
            for (const row of data || []) {
                if (!seen.has(row.client_id)) {
                    seen.add(row.client_id)
                    unique.push(row)
                }
            }
            setClients(unique)
            setTotalCount(count || 0)
        }
        setLoading(false)
    }

    const filtered = useMemo(() => clients.filter(c => {
        const name = c.client?.full_name?.toLowerCase() || ''
        const email = c.client?.email?.toLowerCase() || ''
        const q = searchQuery.toLowerCase()
        const matchesSearch = name.includes(q) || email.includes(q) || c.visa_type?.toLowerCase().includes(q)
        const matchesStatus = !statusFilter || c.status === statusFilter
        return matchesSearch && matchesStatus
    }), [clients, searchQuery, statusFilter])

    const stats = useMemo(() => ({
        total: totalCount,
        active: clients.filter(c => ['in_progress', 'under_review', 'docs_pending'].includes(c.status)).length,
        actionRequired: clients.filter(c => c.status === 'action_required').length,
        approved: clients.filter(c => c.status === 'approved').length,
    }), [clients, totalCount])

    const handleSendMessage = async () => {
        if (!msgText.trim() || !msgClientId) return
        setSending(true)
        await sendMessage({ recipientId: msgClientId, content: msgText })
        setMsgText('')
        setMsgClientId(null)
        setSending(false)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">Client Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base mt-1">
                        All clients assigned to your cases.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link to="/consultant/invite-client">
                        <Button icon="add">Invite Client</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Clients', value: stats.total, icon: 'groups', color: 'text-primary' },
                    { label: 'Active Cases', value: stats.active, icon: 'folder_shared', color: 'text-blue-500' },
                    { label: 'Action Required', value: stats.actionRequired, icon: 'priority_high', color: 'text-red-500' },
                    { label: 'Approved', value: stats.approved, icon: 'check_circle', color: 'text-emerald-500' },
                ].map(s => (
                    <div key={s.label} className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                            <span className={`material-symbols-outlined text-[20px] ${s.color}`}>{s.icon}</span>
                        </div>
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">
                            {loading ? <span className="inline-block w-8 h-6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" /> : s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Search by name, email, or visa type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                </div>
                <div className="relative min-w-[180px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                </div>
            </div>

            {/* Message Modal */}
            {msgClientId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Send Message</h3>
                        <textarea
                            rows={4}
                            value={msgText}
                            onChange={(e) => setMsgText(e.target.value)}
                            placeholder="Write your message..."
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-1 focus:ring-primary"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => { setMsgClientId(null); setMsgText('') }} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            <button
                                onClick={handleSendMessage}
                                disabled={sending || !msgText.trim()}
                                className="px-4 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clients Table */}
            <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visa Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Activity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-6 py-4">
                                            <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-slate-400">
                                        <span className="material-symbols-outlined text-[40px] block mb-2">person_search</span>
                                        No clients found
                                    </td>
                                </tr>
                            ) : filtered.map((c) => (
                                <tr key={c.client_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar src={c.client?.avatar_url} alt={c.client?.full_name} size="sm" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{c.client?.full_name || '—'}</p>
                                                <p className="text-xs text-slate-500">{c.client?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{c.visa_type || '—'}</p>
                                        <p className="text-xs text-slate-500">{c.destination_country}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status] || c.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {formatDate(c.updated_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => setMsgClientId(c.client_id)}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="Send Message"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">mail</span>
                                            </button>
                                            <Link
                                                to="/consultant/cases"
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="View Cases"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">folder_shared</span>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> clients
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >Previous</button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={(page + 1) * PAGE_SIZE >= totalCount}
                            className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >Next</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
