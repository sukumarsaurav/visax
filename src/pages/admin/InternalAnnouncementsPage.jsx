import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useAuth } from '../../contexts/AuthContext'
import { slackNotify, trackEvent } from '../../lib/integrations'
import { writeAuditLog } from '../../lib/auditLog'
import { useDebounce } from '../../hooks/useDebounce'
import * as announcementsRepo from '../../data/announcementsRepo'

const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    normal: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    low: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
}

const statusColor = (ann) => {
    if (ann.is_global) return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
    return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
}

const statusDot = (ann) => ann.is_global ? 'bg-green-600' : 'bg-gray-500'

const PRIORITY_ICONS = { high: 'priority_high', normal: 'info', low: 'arrow_downward' }

export default function InternalAnnouncementsPage() {
    const { user } = useAuth()
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showDrawer, setShowDrawer] = useState(false)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All Statuses')
    const [form, setForm] = useState({ title: '', content: '', priority: 'normal', is_global: true })
    const [stats, setStats] = useState({ published: 0, drafts: 0 })
    // F-IA02: confirm before permanently deleting an announcement
    const [deleteConfirm, setDeleteConfirm] = useState(null) // announcement object
    const [deleting, setDeleting] = useState(false)

    const debouncedSearch = useDebounce(search, 300)

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true)
        const { data } = await announcementsRepo.list({ search: debouncedSearch, scope: filterStatus })
        const list = data || []
        setAnnouncements(list)
        setStats({
            published: list.filter(a => a.is_global).length,
            drafts: list.filter(a => !a.is_global).length,
        })
        setLoading(false)
    }, [debouncedSearch, filterStatus])

    useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

    const handleCreate = async (asDraft = false) => {
        if (!form.title.trim() || !form.content.trim()) {
            toast.error('Title and content are required')
            return
        }
        setSaving(true)
        const { error } = await announcementsRepo.create({
            title: form.title,
            content: form.content,
            priority: form.priority,
            is_global: asDraft ? false : form.is_global,
            author_id: user?.id,
        })
        if (error) {
            toast.error('Failed: ' + error.message)
        } else {
            toast.success(asDraft ? 'Saved as draft' : 'Announcement published!')
            // F-IA05: audit log on create
            await writeAuditLog({
                action: 'Announcement Created',
                entityType: 'announcement',
                details: { title: form.title, priority: form.priority, is_global: asDraft ? false : form.is_global },
            })
            if (!asDraft) {
                slackNotify('announcement.published', { title: form.title, is_global: form.is_global })
                trackEvent('announcement_published', { priority: form.priority, is_global: form.is_global })
            }
            setShowDrawer(false)
            setForm({ title: '', content: '', priority: 'normal', is_global: true })
            fetchAnnouncements()
        }
        setSaving(false)
    }

    const handleToggleGlobal = async (ann) => {
        await announcementsRepo.update(ann.id, { is_global: !ann.is_global })
        // F-IA05: audit log on publish/unpublish
        await writeAuditLog({
            action: 'Settings Updated',
            entityType: 'announcement',
            entityId: ann.id,
            details: { title: ann.title, action: ann.is_global ? 'unpublished' : 'published' },
        })
        fetchAnnouncements()
    }

    // F-IA02: extracted delete logic — called after ConfirmModal confirms
    const doDelete = async (ann) => {
        setDeleting(true)
        await announcementsRepo.remove(ann.id)
        // F-IA05: audit log on delete
        await writeAuditLog({
            action: 'Resource Deleted',
            entityType: 'announcement',
            entityId: ann.id,
            details: { title: ann.title },
        })
        toast.success('Deleted')
        fetchAnnouncements()
        setDeleteConfirm(null)
        setDeleting(false)
    }

    return (
        <div className="flex flex-col gap-6 relative">
            {/* F-IA02: confirm before permanently deleting an announcement */}
            <ConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => doDelete(deleteConfirm)}
                title="Delete announcement?"
                message={`"${deleteConfirm?.title}" will be permanently removed and cannot be recovered.`}
                confirmLabel="Delete"
                variant="danger"
                loading={deleting}
            />

            {/* Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400">Create and manage updates sent to immigration professionals and agencies.</p>
                <Button icon="add" onClick={() => setShowDrawer(true)}>Create Announcement</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Published', value: stats.published, trend: 'Global announcements', icon: 'check_circle', color: 'green' },
                    { label: 'Total', value: announcements.length, trend: 'All announcements', icon: 'campaign', color: 'blue' },
                    { label: 'Agency Only', value: stats.drafts, trend: 'Not globally visible', icon: 'edit_document', color: 'gray' }
                ].map((stat) => (
                    <Card key={stat.label} className="flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                            <p className={`text-xs mt-2 ${stat.color === 'green' ? 'text-green-600' : 'text-slate-500'}`}>{stat.trend}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.color === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <Card className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="Search announcements..."
                        value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select className="border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 pl-3 pr-8 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:border-primary focus:ring-0"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}>
                        <option>All Statuses</option>
                        <option>Global</option>
                        <option>Agency-specific</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden p-0">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            {['Title', 'Author', 'Created', 'Priority', 'Status', ''].map((h) => (
                                <th key={h} className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td></tr>
                            ))
                        ) : announcements.length === 0 ? (
                            <tr><td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                                <span className="material-symbols-outlined text-[48px] block mb-2">campaign</span>
                                No announcements yet. Create one to get started.
                            </td></tr>
                        ) : announcements.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                <td className="py-4 px-6">
                                    <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                    {a.content && <p className="text-xs text-slate-500 truncate max-w-[200px]">{a.content}</p>}
                                </td>
                                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">
                                    {a.profiles?.full_name || 'Admin'}
                                </td>
                                <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                                    {new Date(a.created_at).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${priorityColors[a.priority] || priorityColors.normal}`}>
                                        {a.priority}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor(a)}`}>
                                        <span className={`size-1.5 rounded-full ${statusDot(a)}`}></span>
                                        {a.is_global ? 'Published' : 'Agency Only'}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleToggleGlobal(a)}
                                            className={`p-1.5 rounded-md text-xs font-medium ${a.is_global ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                                            title={a.is_global ? 'Unpublish' : 'Publish globally'}>
                                            <span className="material-symbols-outlined text-[18px]">{a.is_global ? 'unpublished' : 'publish'}</span>
                                        </button>
                                        <button onClick={() => setDeleteConfirm(a)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Create Drawer */}
            {showDrawer && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]" onClick={() => setShowDrawer(false)}></div>
                    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">New Announcement</h2>
                                <p className="text-xs text-slate-500">Draft a new message for your professionals.</p>
                            </div>
                            <button onClick={() => setShowDrawer(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Title / Subject</span>
                                <input className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="e.g. System Maintenance Update"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </label>
                            <div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Visibility</span>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {[
                                        { val: true, label: 'All Professionals', sub: 'Agencies & Consultants' },
                                        { val: false, label: 'Agency Specific', sub: 'Your agency only' },
                                    ].map(opt => (
                                        <label key={String(opt.val)} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${form.is_global === opt.val ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            <input type="radio" name="visibility" checked={form.is_global === opt.val} onChange={() => setForm(f => ({ ...f, is_global: opt.val }))} className="text-primary focus:ring-primary" />
                                            <div>
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{opt.label}</span>
                                                <span className="block text-xs text-slate-500">{opt.sub}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="block">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Content</span>
                                <textarea
                                    className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none min-h-[200px]"
                                    placeholder="Type your announcement content here..."
                                    value={form.content}
                                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                                />
                            </div>
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Priority Level</span>
                                <select className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    value={form.priority}
                                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                            </label>
                        </div>
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                            <button className="text-sm font-medium text-slate-500 hover:text-red-600" onClick={() => setShowDrawer(false)}>Cancel</button>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => handleCreate(true)} disabled={saving}>Save Draft</Button>
                                <Button icon="send" iconPosition="right" onClick={() => handleCreate(false)} disabled={saving}>
                                    {saving ? 'Publishing...' : 'Publish Now'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
