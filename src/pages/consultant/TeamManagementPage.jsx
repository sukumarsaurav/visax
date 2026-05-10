import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const statusColors = { active: 'green', pending: 'slate', away: 'amber', inactive: 'red' }

export default function TeamManagementPage() {
    const { profile } = useAuth()
    const [members, setMembers] = useState([])
    const [agency, setAgency] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviting, setInviting] = useState(false)

    useEffect(() => { if (profile) fetchTeam() }, [profile])

    async function fetchTeam() {
        setLoading(true)

        // Get agency owned by this admin
        const { data: agencyData } = await supabase
            .from('agencies')
            .select('*')
            .eq('owner_id', profile.id)
            .single()

        if (agencyData) {
            setAgency(agencyData)
            const { data: memberData } = await supabase
                .from('agency_members')
                .select(`*, profile:profiles!agency_members_profile_id_fkey(id, full_name, avatar_url, email)`)
                .eq('agency_id', agencyData.id)
                .order('created_at', { ascending: false })
            setMembers(memberData || [])
        }
        setLoading(false)
    }

    async function handleInvite(e) {
        e.preventDefault()
        if (!inviteEmail.trim() || !agency) return
        setInviting(true)

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', inviteEmail.trim())
            .single()

        if (existingProfile) {
            const { error } = await supabase.from('agency_members').insert({
                agency_id: agency.id,
                profile_id: existingProfile.id,
                invited_by: profile.id,
                status: 'pending',
            })
            if (error) toast.error(error.message)
            else { toast.success('Invite sent!'); setInviteEmail(''); fetchTeam() }
        } else {
            toast.error('No VisaX account found with that email')
        }
        setInviting(false)
    }

    async function updateMemberStatus(memberId, status) {
        const { error } = await supabase
            .from('agency_members')
            .update({ status })
            .eq('id', memberId)
        if (error) toast.error(error.message)
        else { toast.success('Member updated'); fetchTeam() }
    }

    const activeCount = members.filter(m => m.status === 'active').length
    const pendingCount = members.filter(m => m.status === 'pending').length

    return (
        <div className="flex flex-col gap-6">
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
                <CardHeader><CardTitle>Invite Team Member</CardTitle></CardHeader>
                <form onSubmit={handleInvite} className="flex gap-3 mt-3">
                    <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="colleague@example.com"
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={inviting || !inviteEmail}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        {inviting ? 'Sending…' : 'Send Invite'}
                    </button>
                </form>
                <p className="mt-2 text-xs text-slate-400">The person must already have a VisaX account.</p>
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
                                {m.status === 'active' && (
                                    <button
                                        onClick={() => updateMemberStatus(m.id, 'inactive')}
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
