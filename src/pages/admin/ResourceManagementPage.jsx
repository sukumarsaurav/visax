import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const TYPE_COLORS = {
    PDF: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    DOCX: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    URL: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    VIDEO: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    Other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const CATEGORIES = ['Legal Guides', 'Templates', 'External Links', 'Checklists', 'Videos', 'General']

const blankForm = { title: '', description: '', category: 'General', file_url: '', file_type: 'PDF', status: 'published' }

export default function ResourceManagementPage() {
    const { user } = useAuth()
    const [resources, setResources] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedResource, setSelectedResource] = useState(null)
    const [showAddDrawer, setShowAddDrawer] = useState(false)
    const [showEditDrawer, setShowEditDrawer] = useState(false)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [toast, setToast] = useState(null)
    const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0, downloads: 0 })
    const [form, setForm] = useState(blankForm)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchResources = useCallback(async () => {
        setLoading(true)
        let query = supabase.from('resources').select('*, profiles(full_name)').order('created_at', { ascending: false })
        if (search.trim()) query = query.ilike('title', `%${search}%`)
        if (categoryFilter !== 'All') query = query.eq('category', categoryFilter)
        const { data } = await query
        const list = data || []
        setResources(list)
        setStats({
            total: list.length,
            published: list.filter(r => r.status === 'published').length,
            drafts: list.filter(r => r.status === 'draft').length,
            downloads: list.reduce((s, r) => s + (r.download_count || 0), 0),
        })
        if (list.length > 0 && !selectedResource) setSelectedResource(list[0])
        setLoading(false)
    }, [search, categoryFilter])

    useEffect(() => { fetchResources() }, [fetchResources])

    const handleAdd = async () => {
        if (!form.title.trim()) { showToast('Title is required', 'error'); return }
        setSaving(true)
        const { error } = await supabase.from('resources').insert({
            title: form.title,
            description: form.description,
            category: form.category,
            file_url: form.file_url,
            file_type: form.file_type,
            status: form.status,
            is_public: form.status === 'published',
            created_by: user?.id,
        })
        if (error) { showToast('Failed: ' + error.message, 'error') }
        else { showToast('Resource added!'); setShowAddDrawer(false); setForm(blankForm); fetchResources() }
        setSaving(false)
    }

    const handleEdit = async () => {
        if (!selectedResource) return
        setSaving(true)
        const { error } = await supabase.from('resources').update({
            title: form.title,
            description: form.description,
            category: form.category,
            file_url: form.file_url,
            file_type: form.file_type,
            status: form.status,
            is_public: form.status === 'published',
        }).eq('id', selectedResource.id)
        if (error) { showToast('Failed: ' + error.message, 'error') }
        else { showToast('Updated!'); setShowEditDrawer(false); fetchResources() }
        setSaving(false)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this resource?')) return
        await supabase.from('resources').delete().eq('id', id)
        showToast('Deleted')
        setSelectedResource(null)
        fetchResources()
    }

    const openEdit = (res) => {
        setSelectedResource(res)
        setForm({ title: res.title, description: res.description || '', category: res.category || 'General', file_url: res.file_url || '', file_type: res.file_type || 'PDF', status: res.status || 'published' })
        setShowEditDrawer(true)
    }

    function DrawerForm({ drawerTitle, onSave, onClose }) {
        return (
            <div className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]" onClick={onClose}></div>
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{drawerTitle}</h2>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Title *</span>
                            <input className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Resource title" />
                        </label>
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Description</span>
                            <textarea className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none resize-none min-h-[100px]"
                                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Category</span>
                                <select className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Type</span>
                                <select className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    value={form.file_type} onChange={e => setForm(f => ({ ...f, file_type: e.target.value }))}>
                                    {['PDF', 'DOCX', 'URL', 'VIDEO', 'Other'].map(t => <option key={t}>{t}</option>)}
                                </select>
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">URL / Link</span>
                            <input className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
                        </label>
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">Status</span>
                            <select className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </label>
                    </div>
                    <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 justify-end">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Resource'}</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" icon="category">Categories</Button>
                <Button icon="add" onClick={() => { setForm(blankForm); setShowAddDrawer(true) }}>Add Resource</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Resources', value: stats.total, trend: 'All resources', icon: 'library_books', iconColor: 'primary' },
                    { label: 'Published', value: stats.published, desc: 'Active and visible', icon: 'check_circle', iconColor: 'emerald' },
                    { label: 'Drafts', value: stats.drafts, desc: 'Pending review', icon: 'edit_document', iconColor: 'amber' },
                    { label: 'Total Downloads', value: stats.downloads.toLocaleString(), trend: 'Across all resources', icon: 'download', iconColor: 'purple' }
                ].map((stat) => (
                    <Card key={stat.label} className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                            <p className="text-xs text-slate-500 mt-1">{stat.trend || stat.desc}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.iconColor === 'primary' ? 'bg-blue-50 dark:bg-blue-900/20 text-primary' : stat.iconColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : stat.iconColor === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600'}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-4">
                    <Card className="flex flex-col sm:flex-row gap-3 items-center">
                        <div className="relative flex-1 w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input className="pl-10 pr-4 py-2 w-full border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                placeholder="Search resources..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="border border-slate-200 dark:border-slate-700 rounded-lg text-sm py-2 pl-3 pr-8 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:border-primary focus:ring-0"
                            value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </Card>

                    <Card className="p-0 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    {['Resource', 'Category', 'Type', 'Status', 'Downloads', ''].map(h => (
                                        <th key={h} className="py-3 px-5 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {loading ? (
                                    [1, 2, 3].map(i => <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td></tr>)
                                ) : resources.length === 0 ? (
                                    <tr><td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                                        <span className="material-symbols-outlined text-[48px] block mb-2">library_books</span>
                                        No resources yet. Add your first resource.
                                    </td></tr>
                                ) : resources.map(r => (
                                    <tr key={r.id} onClick={() => setSelectedResource(r)}
                                        className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 group ${selectedResource?.id === r.id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-primary' : ''}`}>
                                        <td className="py-4 px-5">
                                            <p className="font-semibold text-slate-900 dark:text-white">{r.title}</p>
                                            {r.description && <p className="text-xs text-slate-500 truncate max-w-[180px]">{r.description}</p>}
                                        </td>
                                        <td className="py-4 px-5 text-sm text-slate-500 dark:text-slate-400">{r.category || 'General'}</td>
                                        <td className="py-4 px-5">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${TYPE_COLORS[r.file_type] || TYPE_COLORS.Other}`}>{r.file_type || 'Other'}</span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'published' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                                {r.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-sm text-slate-500">{r.download_count || 0}</td>
                                        <td className="py-4 px-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={e => { e.stopPropagation(); openEdit(r) }} className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-md">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); handleDelete(r.id) }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>

                {/* Detail Panel */}
                {selectedResource && (
                    <Card className="w-full lg:w-80 flex-shrink-0 self-start">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Resource Details</h3>
                            <button onClick={() => openEdit(selectedResource)} className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className={`flex items-center justify-center h-24 rounded-xl ${selectedResource.file_type === 'PDF' ? 'bg-red-50 dark:bg-red-900/20' : selectedResource.file_type === 'DOCX' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
                                <span className={`material-symbols-outlined text-5xl ${selectedResource.file_type === 'PDF' ? 'text-red-500' : selectedResource.file_type === 'DOCX' ? 'text-blue-500' : 'text-purple-500'}`}>
                                    {selectedResource.file_type === 'PDF' ? 'picture_as_pdf' : selectedResource.file_type === 'URL' ? 'link' : 'description'}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{selectedResource.title}</p>
                                {selectedResource.description && <p className="text-xs text-slate-500 mt-1">{selectedResource.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div><p className="text-slate-400 font-medium">Category</p><p className="text-slate-700 dark:text-slate-300">{selectedResource.category}</p></div>
                                <div><p className="text-slate-400 font-medium">Type</p><p className="text-slate-700 dark:text-slate-300">{selectedResource.file_type}</p></div>
                                <div><p className="text-slate-400 font-medium">Downloads</p><p className="text-slate-700 dark:text-slate-300">{selectedResource.download_count || 0}</p></div>
                                <div><p className="text-slate-400 font-medium">Status</p><p className={`font-bold ${selectedResource.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedResource.status}</p></div>
                            </div>
                            {selectedResource.file_url && (
                                <a href={selectedResource.file_url} target="_blank" rel="noreferrer"
                                    className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-sm">open_in_new</span> Open Resource
                                </a>
                            )}
                            <button onClick={() => handleDelete(selectedResource.id)}
                                className="flex items-center justify-center gap-2 w-full h-9 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">delete</span> Delete
                            </button>
                        </div>
                    </Card>
                )}
            </div>

            {showAddDrawer && <DrawerForm drawerTitle="Add Resource" onSave={handleAdd} onClose={() => setShowAddDrawer(false)} />}
            {showEditDrawer && <DrawerForm drawerTitle="Edit Resource" onSave={handleEdit} onClose={() => setShowEditDrawer(false)} />}
        </div>
    )
}
