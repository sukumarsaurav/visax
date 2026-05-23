import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { slackNotify, trackEvent } from '../../lib/integrations'
import { friendlyError } from '../../lib/errors'
import { writeAuditLog } from '../../lib/auditLog'
import { useDebounce } from '../../hooks/useDebounce'
import ConfirmModal from '../../components/ui/ConfirmModal'
import * as profilesRepo from '../../data/profilesRepo'
import * as documentsRepo from '../../data/documentsRepo'

const STATUS_COLORS = {
    pending_review: 'yellow',
    approved: 'green',
    rejected: 'red',
    active: 'green',
}

const PAGE_SIZE = 30

export default function ApplicationReviewPage() {
    const [applications, setApplications] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)
    const [selectedApp, setSelectedApp] = useState(null)
    const [activeTab, setActiveTab] = useState('documents')
    const [activeFilter, setActiveFilter] = useState('pending')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const [documents, setDocuments] = useState([])
    const [docsLoading, setDocsLoading] = useState(false)
    const [confirm, setConfirm] = useState(null) // { type: 'approve'|'reject' }
    const listRef = useRef(null)

    const debouncedSearch = useDebounce(search, 300)

    const fetchApplications = useCallback(async () => {
        setLoading(true)
        const { data, count, error } = await profilesRepo.applicationList({
            filter: activeFilter,
            search: debouncedSearch,
            page,
            pageSize: PAGE_SIZE,
        })
        if (error) toast.error(friendlyError(error, 'Failed to load applications'))

        const apps = (data || []).map(u => ({
            ...u,
            statusColor: STATUS_COLORS[u.application_status] || 'gray',
            time: timeAgo(u.created_at),
        }))
        setApplications(apps)
        setTotalCount(count || 0)

        // Auto-select first item only on initial load or filter change, not on page advance
        if (apps.length > 0 && !selectedApp) setSelectedApp(apps[0])
        if (selectedApp) {
            const updated = apps.find(a => a.id === selectedApp.id)
            if (updated) setSelectedApp(updated)
        }
        setLoading(false)
    }, [activeFilter, debouncedSearch, page])

    const fetchDocuments = useCallback(async (userId) => {
        if (!userId) return
        setDocsLoading(true)
        const { data, error } = await documentsRepo.listByUploader(userId)
        if (error) toast.error(friendlyError(error, 'Failed to load documents'))
        setDocuments(data || [])
        setDocsLoading(false)
    }, [])

    useEffect(() => {
        setPage(0)
        setSelectedApp(null)
    }, [activeFilter, debouncedSearch])

    useEffect(() => { fetchApplications() }, [fetchApplications])

    useEffect(() => {
        if (selectedApp) {
            setNote(selectedApp.notification_preferences?.application_notes || '')
            fetchDocuments(selectedApp.id)
        }
    }, [selectedApp?.id, fetchDocuments])

    function timeAgo(ts) {
        const diff = Date.now() - new Date(ts).getTime()
        const h = Math.floor(diff / 3600000)
        if (h < 1) return 'just now'
        if (h < 24) return `${h}h ago`
        return `${Math.floor(h / 24)}d ago`
    }

    const saveNote = async (profileId) => {
        if (!note.trim()) return
        const { data: existing } = await profilesRepo.getNotificationPreferences(profileId)
        const prefs = existing?.notification_preferences || {}
        await profilesRepo.updateBare(profileId, {
            notification_preferences: { ...prefs, application_notes: note.trim() },
        })
    }

    const executeApprove = async () => {
        if (!selectedApp) return
        setSaving(true)
        setConfirm(null)
        await saveNote(selectedApp.id)
        const { error } = await profilesRepo.updateBare(selectedApp.id, {
            application_status: 'approved',
            is_verified: true,
        })

        if (error) {
            toast.error(friendlyError(error, 'Failed to approve application'))
        } else {
            toast.success('Application approved!')
            await writeAuditLog({
                action: 'User Approved',
                entityType: 'profile',
                entityId: selectedApp.id,
                details: { role: selectedApp.role, note: note.trim() },
            })
            slackNotify('application.approved', { name: selectedApp.full_name, role: selectedApp.role })
            trackEvent('application_approved', { role: selectedApp.role })
            fetchApplications()
        }
        setSaving(false)
    }

    const executeReject = async () => {
        if (!selectedApp) return
        setSaving(true)
        setConfirm(null)
        await saveNote(selectedApp.id)
        const { error } = await profilesRepo.updateBare(selectedApp.id, {
            application_status: 'rejected',
            is_verified: false,
        })

        if (error) {
            toast.error(friendlyError(error, 'Failed to reject application'))
        } else {
            toast.success('Application rejected')
            await writeAuditLog({
                action: 'User Rejected',
                entityType: 'profile',
                entityId: selectedApp.id,
                details: { role: selectedApp.role, note: note.trim() },
            })
            slackNotify('application.rejected', { name: selectedApp.full_name, role: selectedApp.role, note: note.trim() })
            trackEvent('application_rejected', { role: selectedApp.role })
            fetchApplications()
        }
        setSaving(false)
    }

    const statusChipClass = (color) => {
        const map = {
            yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            green: 'bg-green-100 text-green-800 border-green-200',
            red: 'bg-red-100 text-red-800 border-red-200',
            gray: 'bg-gray-100 text-gray-700 border-gray-200',
        }
        return map[color] || map.gray
    }

    const statusLabel = (status) => {
        const map = { pending_review: 'Pending Review', approved: 'Approved', rejected: 'Rejected', active: 'Active' }
        return map[status] || status
    }

    const pendingCount = activeFilter === 'pending' ? totalCount : 0
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    return (
        // Use flex layout relative to parent rather than a fixed viewport hack
        <div className="flex -m-6 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
            {/* Confirm modals */}
            <ConfirmModal
                open={confirm?.type === 'approve'}
                onClose={() => setConfirm(null)}
                onConfirm={executeApprove}
                title="Approve Application"
                message={`Approve ${selectedApp?.full_name || selectedApp?.email}? This will mark them as verified and grant full platform access.`}
                confirmLabel="Approve"
                variant="primary"
                loading={saving}
            />
            <ConfirmModal
                open={confirm?.type === 'reject'}
                onClose={() => setConfirm(null)}
                onConfirm={executeReject}
                title="Reject Application"
                message={`Reject ${selectedApp?.full_name || selectedApp?.email}? They will be notified and will not have access to professional features.`}
                confirmLabel="Reject"
                variant="danger"
                loading={saving}
            />

            {/* Left Column: Queue */}
            <aside className="w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex-shrink-0">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary"
                            placeholder="Search name or email"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {[
                            { id: 'pending', label: `Pending${activeFilter === 'pending' && totalCount ? ` (${totalCount})` : ''}` },
                            { id: 'approved', label: 'Approved' },
                            { id: 'rejected', label: 'Rejected' },
                            { id: 'all', label: 'All' },
                        ].map((chip) => (
                            <button key={chip.id} onClick={() => setActiveFilter(chip.id)}
                                className={`flex shrink-0 items-center justify-center h-7 px-3 rounded-full text-xs font-medium transition-colors ${activeFilter === chip.id ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 m-2" />)
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-[40px] text-slate-300">inbox</span>
                            <p className="text-sm text-slate-400 mt-2">No applications found</p>
                        </div>
                    ) : applications.map((app) => (
                        <div key={app.id} onClick={() => setSelectedApp(app)}
                            className={`p-3 rounded-lg cursor-pointer relative transition-colors ${selectedApp?.id === app.id ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}>
                            {selectedApp?.id === app.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />}
                            <div className={`flex justify-between items-start mb-1 ${selectedApp?.id === app.id ? 'pl-2' : 'px-2'}`}>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{app.full_name || app.email}</h3>
                                <span className="text-xs text-slate-400 ml-2 shrink-0">{app.time}</span>
                            </div>
                            <div className={`flex items-center gap-2 mb-2 ${selectedApp?.id === app.id ? 'pl-2' : 'px-2'}`}>
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${app.role === 'individual' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-blue-700/10' : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 ring-purple-700/10'}`}>
                                    {app.role === 'individual' ? 'Consultant' : 'Agency'}
                                </span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${selectedApp?.id === app.id ? 'pl-2' : 'px-2'}`}>
                                <span className={`h-2 w-2 rounded-full ${app.statusColor === 'yellow' ? 'bg-yellow-500' : app.statusColor === 'green' ? 'bg-green-500' : app.statusColor === 'red' ? 'bg-red-500' : 'bg-gray-400'}`} />
                                <span className="text-xs font-medium text-slate-400">{statusLabel(app.application_status)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{totalCount} total</span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                                className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded disabled:opacity-40">
                                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                            </button>
                            <span className="px-2 py-1">{page + 1} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                                className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded disabled:opacity-40">
                                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            {/* Right Column: Detail */}
            {selectedApp ? (
                <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
                    {/* Header */}
                    <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start shrink-0">
                        <div className="flex gap-5">
                            <div className="h-16 w-16 rounded-xl bg-gray-200 dark:bg-slate-700 overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
                                {selectedApp.avatar_url
                                    ? <img className="h-full w-full object-cover" src={selectedApp.avatar_url} alt="" loading="lazy" />
                                    : <span className="material-symbols-outlined text-4xl text-slate-400">person</span>}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedApp.full_name || selectedApp.email}</h1>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${statusChipClass(selectedApp.statusColor)}`}>
                                        {statusLabel(selectedApp.application_status)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">badge</span>
                                        {selectedApp.role === 'individual' ? 'Immigration Consultant' : 'Agency'}
                                    </span>
                                    {selectedApp.country && (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">location_on</span> {selectedApp.country}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                        Applied {new Date(selectedApp.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification</span>
                            {selectedApp.is_verified
                                ? <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">verified</span> Verified</span>
                                : <span className="text-sm font-bold text-slate-400">Not Verified</span>}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
                        <div className="flex gap-6">
                            {[
                                { id: 'profile', label: 'Applicant Profile' },
                                { id: 'documents', label: 'Documents', badge: documents.length > 0 ? `${documents.length}` : null },
                            ].map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 pt-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                    {tab.label}
                                    {tab.badge && <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 pb-32">
                        {selectedApp.application_status === 'pending_review' && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">info</span>
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Verification Required</p>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Review the applicant's details and documents before approving.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Submitted Documents</h3>
                                {docsLoading ? (
                                    <div className="h-24 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                                ) : documents.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-4xl text-slate-300">folder_open</span>
                                        <p className="text-sm text-slate-400 mt-2">No documents submitted yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {documents.map((doc) => {
                                            const ext = (doc.mime_type || '').includes('pdf') ? 'pdf' : (doc.mime_type || '').includes('image') ? 'image' : 'file'
                                            return (
                                                <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                                                    <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <span className={`material-symbols-outlined text-4xl ${ext === 'pdf' ? 'text-red-500' : ext === 'image' ? 'text-blue-500' : 'text-gray-400'}`}>
                                                            {ext === 'pdf' ? 'picture_as_pdf' : ext === 'image' ? 'image' : 'description'}
                                                        </span>
                                                    </div>
                                                    <div className="p-4">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                                                        <p className="text-xs text-slate-400">{doc.file_size ? `${(doc.file_size / 1024).toFixed(0)} KB` : ''} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                                        {doc.file_path && (
                                                            <a href={doc.file_path} target="_blank" rel="noreferrer"
                                                                className="mt-3 flex items-center justify-center gap-1 h-8 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-400 text-xs font-medium transition-colors">
                                                                <span className="material-symbols-outlined text-base">open_in_new</span> View
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Application Details</h3>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                        {[
                                            { label: 'Full Name', value: selectedApp.full_name },
                                            { label: 'Email', value: selectedApp.email },
                                            { label: 'Phone', value: selectedApp.phone },
                                            { label: 'Country', value: selectedApp.country },
                                            { label: 'Role', value: selectedApp.role === 'individual' ? 'Consultant' : 'Agency Admin' },
                                            { label: 'Applied', value: new Date(selectedApp.created_at).toLocaleDateString() },
                                        ].map(({ label, value }) => (
                                            <div key={label}>
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{value || '—'}</p>
                                            </div>
                                        ))}
                                        {selectedApp.bio && (
                                            <div className="col-span-2">
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Bio</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedApp.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sticky action footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 shadow-lg z-20">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-5xl mx-auto w-full">
                            <input
                                className="w-full md:flex-1 h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary"
                                placeholder="Add internal note…"
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                            <div className="flex gap-3 w-full md:w-auto justify-end">
                                {selectedApp.application_status !== 'rejected' && (
                                    <button disabled={saving} onClick={() => setConfirm({ type: 'reject' })}
                                        className="h-10 px-6 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-lg">block</span> Reject
                                    </button>
                                )}
                                {selectedApp.application_status !== 'approved' && (
                                    <button disabled={saving} onClick={() => setConfirm({ type: 'approve' })}
                                        className="h-10 px-6 rounded-lg bg-primary text-white hover:bg-blue-700 font-semibold text-sm shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-lg">check_circle</span> Approve
                                    </button>
                                )}
                                {selectedApp.application_status === 'approved' && (
                                    <span className="h-10 px-6 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm flex items-center gap-2 border border-emerald-200">
                                        <span className="material-symbols-outlined text-lg">check_circle</span> Approved
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-[64px]">inbox</span>
                        <p className="mt-2">No application selected</p>
                    </div>
                </div>
            )}
        </div>
    )
}
