import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import * as gdprRepo from '../../data/gdprRepo'
import toast from 'react-hot-toast'

// ── Primitives ────────────────────────────────────────────────────────────────

function Section({ title, description, children }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
                {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    )
}

function StatusBadge({ status }) {
    const colors = {
        pending:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300',
        processing:'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300',
        completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300',
        failed:    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300',
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${colors[status] ?? colors.pending}`}>
            {status}
        </span>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AccountDataPage() {
    const { user, signOut } = useAuth()

    // Export state
    const [exportRequest, setExportRequest] = useState(null)
    const [exportLoading, setExportLoading] = useState(true)
    const [requestingExport, setRequestingExport] = useState(false)

    // Deletion state
    const [deletionRequest, setDeletionRequest] = useState(null)
    const [deletionLoading, setDeletionLoading] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteReason, setDeleteReason] = useState('no_longer_needed')
    const [confirmText, setConfirmText] = useState('')
    const [requestingDeletion, setRequestingDeletion] = useState(false)

    useEffect(() => {
        if (!user) return
        Promise.all([
            gdprRepo.getLatestExport(user.id).then(({ data }) => setExportRequest(data)).finally(() => setExportLoading(false)),
            gdprRepo.getDeletionRequest(user.id).then(({ data }) => setDeletionRequest(data)).finally(() => setDeletionLoading(false)),
        ])
    }, [user])

    // ── Handlers ──────────────────────────────────────────────────────────────

    async function handleRequestExport() {
        setRequestingExport(true)
        const { data, error } = await gdprRepo.requestExport(user.id)
        if (error) {
            toast.error('Failed to request export. Please try again.')
        } else {
            setExportRequest(data)
            toast.success("Export request submitted! You'll receive an email when it's ready — usually within 24 hours.")
        }
        setRequestingExport(false)
    }

    async function handleRequestDeletion() {
        if (confirmText !== 'DELETE') return
        setRequestingDeletion(true)
        const { data, error } = await gdprRepo.requestDeletion(user.id, deleteReason)
        if (error) {
            toast.error('Failed to submit deletion request. Please try again.')
            setRequestingDeletion(false)
            return
        }
        setDeletionRequest(data)
        toast.success('Deletion request received. Your account will be removed within 30 days.')
        setShowDeleteConfirm(false)
        // Sign out the user immediately — the UI is no longer meaningful.
        await signOut()
    }

    // ── Derived ───────────────────────────────────────────────────────────────

    const exportPending   = exportRequest?.status === 'pending' || exportRequest?.status === 'processing'
    const deletionPending = deletionRequest?.status === 'pending' || deletionRequest?.status === 'processing'

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Data &amp; Privacy</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage your personal data in accordance with GDPR and applicable privacy laws.
                </p>
            </div>

            {/* ── Export section ── */}
            <Section
                title="Export My Data"
                description="Download a copy of all data we hold about you, including your profile, cases, appointments, and messages."
            >
                {exportLoading ? (
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                ) : exportPending ? (
                    <div className="flex items-center gap-3">
                        <div className="size-9 flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-900/20">
                            <span className="material-symbols-outlined text-amber-500 text-[18px]">pending</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Export in progress</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Requested {new Date(exportRequest.created_at).toLocaleDateString()} · Status: <StatusBadge status={exportRequest.status} />
                            </p>
                        </div>
                    </div>
                ) : exportRequest?.status === 'completed' ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-9 flex items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                                <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Export ready</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Completed {new Date(exportRequest.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        {exportRequest.download_url && (
                            <a href={exportRequest.download_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold w-fit hover:opacity-90 transition-opacity">
                                <span className="material-symbols-outlined text-[16px]">download</span>
                                Download My Data
                            </a>
                        )}
                        <p className="text-xs text-slate-400">
                            Download link expires 7 days after generation. You can request a new export any time.
                        </p>
                        <button onClick={handleRequestExport} disabled={requestingExport}
                            className="text-xs text-primary font-semibold hover:underline w-fit disabled:opacity-50">
                            Request new export
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Your export will be prepared within <strong>24 hours</strong> and you'll receive an email with a secure download link.
                            The link is valid for 7 days.
                        </p>
                        <button
                            onClick={handleRequestExport}
                            disabled={requestingExport}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold w-fit hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            <span className={`material-symbols-outlined text-[16px] ${requestingExport ? 'animate-spin' : ''}`}>
                                {requestingExport ? 'progress_activity' : 'download'}
                            </span>
                            {requestingExport ? 'Submitting…' : 'Request Data Export'}
                        </button>
                    </div>
                )}
            </Section>

            {/* ── Consent summary ── */}
            <Section
                title="Consent &amp; Communications"
                description="Control how we use your data for communications and marketing."
            >
                <div className="flex flex-col gap-4">
                    {[
                        { label: 'Essential communications', hint: 'Account, security, and service emails', locked: true },
                        { label: 'Platform updates & newsletters', hint: 'New features, immigration news', locked: false },
                        { label: 'Marketing & promotions', hint: 'Special offers and partner content', locked: false },
                    ].map(item => (
                        <div key={item.label} className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {item.locked ? (
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">lock</span>
                                ) : (
                                    {/* F-AD01: await consent log so failures surface rather than being silently dropped */}
                                    <input type="checkbox" defaultChecked
                                        className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary"
                                        onChange={async (e) => {
                                            try {
                                                await gdprRepo.logConsent({
                                                    userId: user.id,
                                                    type: item.label.toLowerCase().replace(/ /g, '_'),
                                                    granted: e.target.checked,
                                                })
                                            } catch (err) {
                                                toast.error('Failed to update preference. Please try again.')
                                                // Revert the checkbox to reflect server state
                                                e.target.checked = !e.target.checked
                                            }
                                        }}
                                    />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.hint}</p>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-slate-400 pt-1">
                        Consent changes are logged with a timestamp for compliance purposes.
                        Essential communications cannot be disabled while your account is active.
                    </p>
                </div>
            </Section>

            {/* ── Deletion section ── */}
            <Section
                title="Delete Account"
                description="Permanently remove your account and all associated personal data."
            >
                {deletionLoading ? (
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                ) : deletionPending ? (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-500 text-[20px] mt-0.5">warning</span>
                        <div>
                            <p className="text-sm font-bold text-red-700 dark:text-red-400">Deletion pending</p>
                            <p className="text-xs text-red-600/80 dark:text-red-300/70 mt-1">
                                Your deletion request was received on {new Date(deletionRequest.created_at).toLocaleDateString()}.
                                Your account and personal data will be removed within 30 days.
                                Contact support if you want to cancel this request.
                            </p>
                        </div>
                    </div>
                ) : !showDeleteConfirm ? (
                    <div className="flex flex-col gap-3">
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4">
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                <strong>This action is irreversible.</strong> Deleting your account will permanently remove
                                your profile, cases, messages, and all personal data within 30 days. Active subscriptions
                                will not be automatically refunded.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold w-fit hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                            Delete My Account
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-4">
                            <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">Final confirmation required</p>
                            <p className="text-xs text-red-600/80 dark:text-red-300/70">
                                This will schedule permanent deletion of your account. You will be signed out immediately.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                Reason for leaving
                            </label>
                            <select
                                value={deleteReason}
                                onChange={e => setDeleteReason(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm"
                            >
                                <option value="no_longer_needed">No longer need the service</option>
                                <option value="privacy">Privacy concerns</option>
                                <option value="found_alternative">Found an alternative</option>
                                <option value="too_expensive">Too expensive</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                Type DELETE to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={e => setConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm font-mono"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setConfirmText('') }}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestDeletion}
                                disabled={confirmText !== 'DELETE' || requestingDeletion}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                            >
                                {requestingDeletion
                                    ? <><span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>Processing…</>
                                    : <><span className="material-symbols-outlined text-[15px]">delete_forever</span>Delete My Account</>
                                }
                            </button>
                        </div>
                    </div>
                )}
            </Section>

            {/* Legal links */}
            <p className="text-xs text-slate-400 text-center">
                Read our{' '}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                {' '}for details on how we process and protect your data.
            </p>
        </div>
    )
}
