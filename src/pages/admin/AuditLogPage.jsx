import { useState, useEffect, useCallback } from 'react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { supabase } from '../../lib/supabase'

const ACTION_COLORS = {
    'User Approved': 'blue',
    'User Rejected': 'red',
    'User Suspended': 'red',
    'User Updated': 'blue',
    'Resource Created': 'green',
    'Resource Deleted': 'red',
    'Announcement Created': 'purple',
    'Settings Updated': 'purple',
    'Promotion Created': 'green',
    'System': 'slate',
}

const PAGE_SIZE = 20

export default function AdminAuditLog() {
    const [logs, setLogs] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [selectedLog, setSelectedLog] = useState(null)

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('audit_logs')
            .select('*, profiles(full_name, email, role)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

        if (search.trim()) {
            query = query.ilike('action', `%${search}%`)
        }

        const { data, count } = await query
        setLogs(data || [])
        setTotal(count || 0)
        setLoading(false)
    }, [search, page])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    const exportCSV = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'IP Address']
        const rows = logs.map(l => [
            new Date(l.created_at).toISOString(),
            l.profiles?.full_name || l.profiles?.email || 'System',
            l.action,
            l.entity_type || '',
            l.ip_address || '',
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'audit_logs.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const getActionColor = (action) => {
        const color = ACTION_COLORS[action] || 'slate'
        const map = {
            blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
            red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
            slate: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        }
        return map[color] || map.slate
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="flex flex-col gap-6">
            {/* Actions */}
            <div className="flex items-center justify-between">
                <p className="text-slate-500 dark:text-slate-400 text-sm">{total.toLocaleString()} total entries</p>
                <Button variant="outline" icon="download" onClick={exportCSV}>Export CSV</Button>
            </div>

            {/* Search */}
            <Card className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center material-symbols-outlined text-slate-400">search</span>
                    <input
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary text-sm"
                        placeholder="Search by action..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0) }}
                    />
                </div>
                <button onClick={() => { setSearch(''); setPage(0) }} className="text-sm text-slate-500 hover:text-primary font-medium whitespace-nowrap">Clear filters</button>
            </Card>

            {/* Table */}
            <Card className="p-0 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                {['Timestamp', 'User', 'Action', 'Entity', 'IP Address', ''].map(h => (
                                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td></tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-slate-400">
                                    <span className="material-symbols-outlined text-[48px] block mb-2">history</span>
                                    No audit logs yet. Actions taken by admins will appear here.
                                </td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {new Date(log.created_at).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(log.created_at).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Avatar size="sm" alt={log.profiles?.full_name} />
                                            <div>
                                                <div className="text-sm font-bold text-slate-900 dark:text-white">{log.profiles?.full_name || log.profiles?.email || 'System'}</div>
                                                <div className="text-xs text-slate-400 capitalize">{log.profiles?.role || 'system'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getActionColor(log.action)}`}>{log.action}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {log.entity_type || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                                        {log.ip_address || '—'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="text-slate-400 hover:text-primary p-1 rounded-full">
                                            <span className="material-symbols-outlined text-[20px]">{selectedLog?.id === log.id ? 'expand_less' : 'expand_more'}</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {/* Expanded row */}
                            {logs.map((log) => selectedLog?.id === log.id ? (
                                <tr key={`${log.id}-details`} className="bg-slate-50 dark:bg-slate-800/30">
                                    <td colSpan={6} className="px-8 py-4">
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-700 dark:text-slate-300 mb-2">Details</p>
                                            {log.details && Object.keys(log.details).length > 0 ? (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(log.details).map(([k, v]) => (
                                                        <div key={k} className="flex gap-2">
                                                            <span className="text-slate-400 capitalize">{k}:</span>
                                                            <span className="text-slate-700 dark:text-slate-300 font-medium">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-400">No additional details</p>
                                            )}
                                            {log.entity_id && <p className="mt-2 text-slate-400 font-mono text-xs">Entity ID: {log.entity_id}</p>}
                                        </div>
                                    </td>
                                </tr>
                            ) : null)}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * PAGE_SIZE + 1, total)}</span>–<span className="font-bold text-slate-900 dark:text-white">{Math.min((page + 1) * PAGE_SIZE, total)}</span> of <span className="font-bold text-slate-900 dark:text-white">{total.toLocaleString()}</span>
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
        </div>
    )
}
