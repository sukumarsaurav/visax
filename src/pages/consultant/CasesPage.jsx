import React, { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { useCases } from '../../hooks/useCases'
import { useMessages } from '../../hooks/useMessages'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/date'

const STATUS_MAP = {
    in_progress: { label: 'In Progress', color: 'blue' },
    under_review: { label: 'Under Review', color: 'purple' },
    draft: { label: 'Draft', color: 'slate' },
    docs_pending: { label: 'Docs Pending', color: 'amber' },
    action_required: { label: 'Action Required', color: 'orange' },
    approved: { label: 'Approved', color: 'green' },
    rejected: { label: 'Rejected', color: 'red' },
    closed: { label: 'Closed', color: 'slate' },
    submitted: { label: 'Submitted', color: 'purple' },
}

const filterTabs = [
    { id: 'all', label: 'All Cases', icon: 'view_list', color: null },
    { id: 'action_required', label: 'Pending Action', icon: 'pending_actions', color: 'text-yellow-500' },
    { id: 'docs_pending', label: 'Docs Pending', icon: 'folder_open', color: 'text-amber-500' },
    { id: 'under_review', label: 'Under Review', icon: 'reviews', color: 'text-purple-500' },
]

export default function CasesPage() {
    const { user } = useAuth()
    const { cases, loading, updateCase } = useCases()
    const { sendMessage } = useMessages()
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedCase, setSelectedCase] = useState(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activities, setActivities] = useState([])
    const [activitiesLoading, setActivitiesLoading] = useState(false)
    const [messageText, setMessageText] = useState('')
    const [sending, setSending] = useState(false)
    const [noteText, setNoteText] = useState('')
    const [savingNote, setSavingNote] = useState(false)
    const [panelTab, setPanelTab] = useState('overview')
    const [updatingStatus, setUpdatingStatus] = useState(false)

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.case_number?.includes(searchTerm) ||
            c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.visa_type?.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeFilter !== 'all') return matchesSearch && c.status === activeFilter
        return matchesSearch
    })

    const fetchActivities = useCallback(async (caseId) => {
        setActivitiesLoading(true)
        const { data } = await supabase
            .from('case_activities')
            .select('*, author:profiles!case_activities_author_id_fkey(id, full_name, avatar_url)')
            .eq('case_id', caseId)
            .order('created_at', { ascending: false })
            .limit(20)
        setActivities(data || [])
        setActivitiesLoading(false)
    }, [])

    const handleCaseSelect = (caseItem) => {
        setSelectedCase(caseItem)
        setIsPanelOpen(true)
        setPanelTab('overview')
        fetchActivities(caseItem.id)
    }

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedCase?.client?.id) return
        setSending(true)
        await sendMessage({ recipientId: selectedCase.client.id, content: messageText, caseId: selectedCase.id })
        // Add to activities
        await supabase.from('case_activities').insert({
            case_id: selectedCase.id,
            author_id: user.id,
            type: 'message',
            content: messageText,
        })
        setMessageText('')
        fetchActivities(selectedCase.id)
        setSending(false)
    }

    const handleAddNote = async () => {
        if (!noteText.trim()) return
        setSavingNote(true)
        await supabase.from('case_activities').insert({
            case_id: selectedCase.id,
            author_id: user.id,
            type: 'note',
            content: noteText,
        })
        setNoteText('')
        fetchActivities(selectedCase.id)
        setSavingNote(false)
    }

    const handleStatusChange = async (newStatus) => {
        if (!selectedCase) return
        setUpdatingStatus(true)
        const { data } = await updateCase(selectedCase.id, { status: newStatus })
        if (data) {
            setSelectedCase(prev => ({ ...prev, status: newStatus }))
            await supabase.from('case_activities').insert({
                case_id: selectedCase.id,
                author_id: user.id,
                type: 'status_change',
                content: `Status changed to ${STATUS_MAP[newStatus]?.label || newStatus}`,
            })
            fetchActivities(selectedCase.id)
        }
        setUpdatingStatus(false)
    }

    const pendingCount = cases.filter(c => c.status === 'action_required').length

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Case Management</h1>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <span className="text-sm text-slate-500">{cases.length} total cases</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search clients, file #, visa type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary w-72 placeholder-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {filterTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === tab.id
                            ? 'bg-primary text-white shadow-sm shadow-blue-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-base ${activeFilter !== tab.id && tab.color ? tab.color : ''}`}>
                            {tab.icon}
                        </span>
                        {tab.label}
                        {tab.id === 'action_required' && pendingCount > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${activeFilter === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            }`}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                <div className="flex-1 min-w-0">
                    <Card className="h-full overflow-hidden p-0 flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/50 z-10">
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Client</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Case / Visa Type</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Updated</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={5} className="py-3 px-4">
                                                    <div className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : filteredCases.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-slate-400">
                                                <span className="material-symbols-outlined text-[40px] block mb-2">folder_open</span>
                                                No cases found
                                            </td>
                                        </tr>
                                    ) : filteredCases.map(c => {
                                        const s = STATUS_MAP[c.status] || { label: c.status, color: 'slate' }
                                        return (
                                            <tr
                                                key={c.id}
                                                onClick={() => handleCaseSelect(c)}
                                                className={`cursor-pointer transition-colors border-l-4 ${selectedCase?.id === c.id && isPanelOpen
                                                    ? 'bg-blue-50/60 dark:bg-blue-900/10 border-l-primary'
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-transparent'
                                                }`}
                                            >
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={c.client?.avatar_url} alt={c.client?.full_name} size="sm" />
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{c.client?.full_name || '—'}</p>
                                                            <p className="text-xs text-slate-500">#{c.case_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{c.title}</p>
                                                    <p className="text-xs text-slate-500">{c.visa_type} · {c.destination_country}</p>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <Badge variant={s.color}>{s.label}</Badge>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">{formatDate(c.updated_at)}</p>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${(c.progress || 0) >= 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                style={{ width: `${c.progress || 0}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.progress || 0}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Case Detail Panel */}
                {selectedCase && (
                    <React.Fragment>
                        <div
                            className={`fixed inset-0 bg-black/20 z-30 transition-opacity xl:hidden ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={() => setIsPanelOpen(false)}
                        />
                        <div className={`fixed right-0 top-0 h-full w-full sm:w-[460px] max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-40 flex flex-col transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            {/* Panel Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={selectedCase.client?.avatar_url} alt={selectedCase.client?.full_name} size="lg" />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCase.client?.full_name}</h3>
                                            <p className="text-xs text-slate-500">{selectedCase.client?.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsPanelOpen(false)} className="text-slate-400 hover:text-slate-600">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">{selectedCase.title}</span>
                                        <Badge variant={STATUS_MAP[selectedCase.status]?.color}>{STATUS_MAP[selectedCase.status]?.label}</Badge>
                                    </div>
                                    <div className="text-xs text-slate-400">{selectedCase.visa_type} · {selectedCase.destination_country}</div>
                                    <div className="relative">
                                        <div className="overflow-hidden h-2 flex rounded bg-slate-100 dark:bg-slate-700">
                                            <div className="bg-primary transition-all" style={{ width: `${selectedCase.progress || 0}%` }} />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{selectedCase.progress || 0}% complete</p>
                                    </div>
                                </div>

                                {/* Status Change */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-medium">Change status:</span>
                                    <select
                                        value={selectedCase.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        disabled={updatingStatus}
                                        className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-primary"
                                    >
                                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Panel Tabs */}
                                <div className="flex items-center gap-1 mt-4 border-b border-slate-100 dark:border-slate-800">
                                    {['overview', 'activity', 'message'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setPanelTab(t)}
                                            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${panelTab === t
                                                ? 'text-primary border-b-2 border-primary font-bold'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {panelTab === 'overview' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 mb-1">Case #</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">#{selectedCase.case_number}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 mb-1">Priority</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{selectedCase.priority || 'Normal'}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 mb-1">Created</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(selectedCase.created_at)}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs text-slate-500 mb-1">Updated</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(selectedCase.updated_at)}</p>
                                            </div>
                                        </div>

                                        {/* Add Note */}
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Internal Note</h4>
                                            <textarea
                                                rows={3}
                                                value={noteText}
                                                onChange={(e) => setNoteText(e.target.value)}
                                                placeholder="Write a note about this case..."
                                                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary resize-none"
                                            />
                                            <button
                                                onClick={handleAddNote}
                                                disabled={savingNote || !noteText.trim()}
                                                className="mt-2 px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                            >
                                                {savingNote ? 'Saving...' : 'Save Note'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {panelTab === 'activity' && (
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Case Activity</h4>
                                        {activitiesLoading ? (
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                                            </div>
                                        ) : activities.length === 0 ? (
                                            <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
                                        ) : (
                                            <div className="relative pl-4 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                                                {activities.map(act => (
                                                    <div key={act.id} className="relative pl-4">
                                                        <div className={`absolute left-[-4px] top-1 size-2.5 rounded-full border-2 border-white dark:border-slate-900 ${act.type === 'message' ? 'bg-primary' : act.type === 'status_change' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                                        <p className="text-xs text-slate-400 mb-0.5">{formatDate(act.created_at)} · {act.author?.full_name || 'System'}</p>
                                                        <p className="text-sm text-slate-700 dark:text-slate-200">
                                                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 mr-2">{act.type}</span>
                                                            {act.content}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {panelTab === 'message' && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Send Message to Client</h4>
                                        <textarea
                                            rows={5}
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder={`Write a message to ${selectedCase.client?.full_name?.split(' ')[0] || 'client'}...`}
                                            className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary resize-none"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={sending || !messageText.trim()}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">send</span>
                                            {sending ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}
