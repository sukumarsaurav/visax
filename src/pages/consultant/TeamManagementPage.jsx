import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useAuth } from '../../contexts/AuthContext'
import { usePlanLimits } from '../../hooks/usePlanLimits'
import { formatLimit } from '../../lib/planLimits'
import toast from 'react-hot-toast'
import * as agenciesRepo from '../../data/agenciesRepo'
import * as profilesRepo from '../../data/profilesRepo'

const statusColors = { active: 'green', pending: 'slate', away: 'amber', inactive: 'red' }

export default function TeamManagementPage() {
    const { profile } = useAuth()
    const { limits, usage, canAddMember, planName, usageLoading, refetchUsage } = usePlanLimits()
    const [members, setMembers] = useState([])
    const [agency, setAgency] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)
    // F-TM02: confirmation before deactivating a member
    const [deactivateConfirm, setDeactivateConfirm] = useState(null) // member object

    useEffect(() => { if (profile) fetchTeam() }, [profile])

    async function fetchTeam() {
        setLoading(true)
        const { data: agencyData } = await agenciesRepo.getByOwner(profile.id)
        if (agencyData) {
            setAgency(agencyData)
            const { data: memberData } = await agenciesRepo.listMembers(agencyData.id)
            setMembers(memberData || [])
        }
        setLoading(false)
    }

    async function handleInvite(e) {
        e.preventDefault()
        if (!inviteEmail.trim() || !agency) return

        // Client-side limit guard (DB trigger is the server-side backstop)
        if (!canAddMember) {
            toast.error(`Your ${planName} plan allows up to ${formatLimit(limits.maxMembers)} team members. Upgrade to add more.`)
            return
        }

        setInviting(true)

        const { data: existingProfile } = await profilesRepo.getByEmail(inviteEmail.trim())
        if (existingProfile) {
            const { error } = await agenciesRepo.addMember({
                agencyId: agency.id,
                profileId: existingProfile.id,
                invitedBy: profile.id,
            })
            if (error) toast.error(error.message)
            else { toast.success('Invite sent!'); setInviteEmail(''); fetchTeam(); refetchUsage() }
        } else {
            toast.error('No Immizy account found with that email')
        }
        setInviting(false)
    }

    async function updateMemberStatus(memberId, status) {
        const { error } = await agenciesRepo.setMemberStatus(memberId, status)
        if (error) toast.error(error.message)
        else { toast.success('Member updated'); fetchTeam(); refetchUsage() }
    }

    const activeCount = members.filter(m => m.status === 'active').length
    const pendingCount = members.filter(m => m.status === 'pending').length

    return (
        <div className="flex flex-col gap-6">
            {/* F-TM02: confirm before deactivating a team member */}
            <ConfirmModal
                open={!!deactivateConfirm}
                onClose={() => setDeactivateConfirm(null)}
                onConfirm={() => {
                    updateMemberStatus(deactivateConfirm.id, 'inactive')
                    setDeactivateConfirm(null)
                }}
                title="Deactivate team member?"
                message={`Remove ${deactivateConfirm?.profile?.full_name || 'this member'} from active team access? They will lose access to agency resources until reactivated.`}
                confirmLabel="Deactivate"
                variant="danger"
            />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Team Management</h2>
                    <p className="text-sm text-slate-500">{agency?.name || 'Your Agency'}</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard title="Total Members" value={members.length} icon="groups" color="primary" />
                <StatCard title="Active" value={activeCount} icon="check_circle" color="green" />
                <StatCard title="Pending" value={pendingCount} icon="schedule" color="amber" />
            </div>

            {/* Invite form */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Invite Team Member</CardTitle>
                        {/* Plan member usage indicator */}
                        {!usageLoading && limits.maxMembers !== null && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                canAddMember
                                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                                {usage.members} / {formatLimit(limits.maxMembers)} members
                            </span>
                        )}
                    </div>
                </CardHeader>

                {/* At-limit upgrade banner */}
                {!canAddMember && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-900/10">
                        <span className="material-symbols-outlined text-amber-500 text-[20px]">workspace_premium</span>
                        <p className="flex-1 text-sm text-amber-700 dark:text-amber-400">
                            You've reached the <strong>{planName}</strong> limit of {formatLimit(limits.maxMembers)} team members.
                        </p>
                        <Link to="/pricing" className="text-xs font-bold text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300 whitespace-nowrap">
                            Upgrade plan →
                        </Link>
                    </div>
                )}

                <form onSubmit={handleInvite} className="flex gap-3 mt-3">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        disabled={!canAddMember}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={inviting || !inviteEmail || !canAddMember}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        {inviting ? 'Sending…' : 'Send Invite'}
                    </button>
                </form>
                <p className="mt-2 text-xs text-slate-400">The person must already have a Immizy account.</p>
            </Card>

            {/* Member list */}
            <Card>
                <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
                {loading ? (
                    <div className="space-y-3 mt-4">
                        {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                    </div>
                ) : members.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                        <span className="material-symbols-outlined text-[48px]">group_add</span>
                        <p className="font-semibold">No team members yet</p>
                        <p className="text-sm">Invite your first team member above</p>
                    </div>
                ) : (
                    <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                        {members.map(m => (
                            <div key={m.id} className="flex items-center gap-4 py-4">
                                <Avatar src={m.profile?.avatar_url} alt={m.profile?.full_name} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 dark:text-white">{m.profile?.full_name || 'Unknown'}</p>
                                    <p className="text-sm text-slate-500">{m.profile?.email}</p>
                                    {m.specialty && <p className="text-xs text-slate-400 mt-0.5">{m.specialty} · {m.role}</p>}
                                </div>
                                <Badge variant={statusColors[m.status] || 'slate'}>{m.status}</Badge>
                                {m.status === 'pending' && (
                                    <button
                                        onClick={() => updateMemberStatus(m.id, 'active')}
                                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400"
                                    >
                                        Approve
                                    </button>
                                )}
                                {/* F-TM01: hide Deactivate for the current user (self-demotion prevention) */}
                                {m.status === 'active' && m.profile?.id !== profile?.id && (
                                    <button
                                        onClick={() => setDeactivateConfirm(m)}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-700"
                                    >
                                        Deactivate
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
