import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { formatDate } from '../../utils/date'
import * as clientInvitationsRepo from '../../data/clientInvitationsRepo'
import * as profilesRepo from '../../data/profilesRepo'
import toast from 'react-hot-toast'
import { isEmail } from '../../lib/validators'

const STATUS_CONFIG = {
    pending: { color: 'amber', label: 'Pending', icon: 'schedule' },
    accepted: { color: 'green', label: 'Accepted', icon: 'check_circle' },
    expired: { color: 'red', label: 'Expired', icon: 'timer_off' },
    cancelled: { color: 'slate', label: 'Cancelled', icon: 'cancel' },
}

const DEFAULT_PERMISSIONS = {
    view_status: true,
    upload_docs: true,
    messaging: true,
    sign_contracts: false,
}

export default function InviteClientPage() {
    const { user } = useAuth()
    const [invitations, setInvitations] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('Welcome to the Immizy Client Portal. Please click the link below to set up your account and access your case information.')
    const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS)

    useEffect(() => {
        if (!user) return
        fetchInvitations()
    }, [user])

    async function fetchInvitations() {
        setLoading(true)
        const { data } = await clientInvitationsRepo.listByConsultant(user.id)
        setInvitations(data || [])
        setLoading(false)
    }

    const handleSendInvite = async (e) => {
        e.preventDefault()
        // F-IC01: validate email format before hitting the DB
        if (!email.trim() || !isEmail(email.trim())) {
            toast.error('Please enter a valid email address.')
            return
        }
        setSending(true)

        const token = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const clientEmail = email.toLowerCase().trim()

        const { data: inv, error } = await clientInvitationsRepo.create({
            consultantId: user.id,
            clientEmail,
            permissions,
            message,
            token,
            expiresAt,
        })

        if (error || !inv) {
            toast.error('Failed to send invitation. Please try again.')
        } else {
            // Send the invitation email via edge function
            const { data: consultantProfile } = await profilesRepo.getFullProfile(user.id)

            await supabase.functions.invoke('send-client-invitation', {
                body: {
                    to: clientEmail,
                    consultantName: consultantProfile?.full_name || 'Your consultant',
                    message,
                    token,
                    expiresAt,
                },
            })

            toast.success('Invitation sent!')
            setEmail('')
            setMessage('Welcome to the Immizy Client Portal. Please click the link below to set up your account and access your case information.')
            fetchInvitations()
        }
        setSending(false)
    }

    const handleCancel = async (id) => {
        await clientInvitationsRepo.cancel(id)
        setInvitations(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'cancelled' } : inv))
    }

    const handleResend = async (inv) => {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        await clientInvitationsRepo.resend(inv.id, expiresAt)
        setInvitations(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'pending' } : i))
        toast.success('Invitation resent!')
    }

    const togglePermission = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Invite Client</h1>
                <p className="text-slate-500 mt-1">Send portal access invitations to your clients.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invite Form */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Send New Invitation</h2>
                    <form onSubmit={handleSendInvite} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Client Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">mail</span>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="client@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Personal Message (optional)</label>
                            <textarea
                                rows={3}
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Client Permissions</label>
                            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                                {[
                                    { key: 'view_status', label: 'View Case Status', desc: 'See timeline and status updates' },
                                    { key: 'upload_docs', label: 'Upload Documents', desc: 'Upload files for document requests' },
                                    { key: 'messaging', label: 'Secure Messaging', desc: 'Direct chat with you' },
                                    { key: 'sign_contracts', label: 'Sign Contracts', desc: 'Digital signing of retainers' },
                                ].map(p => (
                                    <div key={p.key} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.label}</p>
                                            <p className="text-xs text-slate-400">{p.desc}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => togglePermission(p.key)}
                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${permissions[p.key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                        >
                                            <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${permissions[p.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-xs text-slate-400 mb-3">Invitation link expires in 7 days. Client will be prompted to create an account or sign in.</p>
                            <Button type="submit" icon="send" disabled={sending} className="w-full justify-center">
                                {sending ? 'Sending...' : 'Send Invitation'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Recent Invitations */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Invitations</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <span className="material-symbols-outlined text-[40px]">person_add</span>
                            <p className="text-sm">No invitations sent yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invitations.map(inv => {
                                const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending
                                return (
                                    <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex-shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className={`material-symbols-outlined text-[16px] ${sc.color === 'green' ? 'text-emerald-500' : sc.color === 'amber' ? 'text-amber-500' : sc.color === 'red' ? 'text-red-500' : 'text-slate-400'}`}>{sc.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{inv.client_email}</p>
                                            <p className="text-xs text-slate-400">Invited {formatDate(inv.created_at)}</p>
                                        </div>
                                        <Badge variant={sc.color}>{sc.label}</Badge>
                                        <div className="flex items-center gap-1">
                                            {inv.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancel(inv.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Cancel"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                                                </button>
                                            )}
                                            {(inv.status === 'expired' || inv.status === 'cancelled') && (
                                                <button
                                                    onClick={() => handleResend(inv)}
                                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                    title="Resend"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
