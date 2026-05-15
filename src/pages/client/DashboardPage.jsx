import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { useAuth } from '../../contexts/AuthContext'
import { useCases } from '../../hooks/useCases'
import { useAppointments } from '../../hooks/useAppointments'
import { useInvoices } from '../../hooks/useInvoices'
import { formatDate } from '../../utils/date'

const statusColors = {
    in_progress: 'blue', under_review: 'blue', draft: 'slate',
    docs_pending: 'amber', action_required: 'orange',
    approved: 'green', rejected: 'red', closed: 'slate',
}

function SkeletonCard() {
    return <div className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
}

const ONBOARDING_DISMISSED_KEY = 'immizy-onboarding-dismissed'

function OnboardingChecklist({ profile, hasCases, hasAppointments }) {
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true' } catch { return false }
    })

    if (dismissed) return null

    const steps = [
        { label: 'Create your account', icon: 'check_circle', done: true, path: null },
        { label: 'Complete your profile', icon: profile?.bio ? 'check_circle' : 'radio_button_unchecked', done: !!profile?.bio, path: '/client' },
        { label: 'Browse services', icon: hasCases ? 'check_circle' : 'radio_button_unchecked', done: hasCases, path: '/client/services' },
        { label: 'Book a consultation', icon: hasAppointments ? 'check_circle' : 'radio_button_unchecked', done: hasAppointments, path: '/find-professionals' },
    ]

    const completedCount = steps.filter(s => s.done).length
    const allDone = completedCount === steps.length

    // Auto-hide when all done
    if (allDone) return null

    const progress = (completedCount / steps.length) * 100

    function handleDismiss() {
        localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
        setDismissed(true)
    }

    return (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-800/50 p-5">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">rocket_launch</span>
                        Get Started with Immizy
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{completedCount} of {steps.length} steps complete</p>
                </div>
                <button
                    onClick={handleDismiss}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label="Dismiss onboarding checklist"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {steps.map((step, idx) => {
                    const content = (
                        <div
                            key={idx}
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                step.done
                                    ? 'bg-white/60 dark:bg-slate-800/40'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50'
                            }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${step.done ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                {step.icon}
                            </span>
                            <span className={`text-sm font-medium ${step.done ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {step.label}
                            </span>
                        </div>
                    )
                    return step.path && !step.done ? (
                        <Link key={idx} to={step.path}>{content}</Link>
                    ) : (
                        <div key={idx}>{content}</div>
                    )
                })}
            </div>
        </div>
    )
}

export default function ClientDashboard() {
    const { profile } = useAuth()
    const { cases, loading: casesLoading } = useCases()
    const { upcoming, loading: apptLoading } = useAppointments()
    const { invoices, loading: invLoading } = useInvoices()

    const activeCases = cases.filter(c => ['in_progress', 'under_review', 'docs_pending', 'action_required'].includes(c.status))
    const pendingInvoices = invoices.filter(i => i.status === 'pending')
    const nextAppt = upcoming[0]

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
                </h2>
                <p className="mt-1 text-slate-500">Here's what's happening with your cases</p>
            </div>

            {/* Onboarding Checklist — shown for new users */}
            <OnboardingChecklist
                profile={profile}
                hasCases={cases.length > 0}
                hasAppointments={upcoming.length > 0}
            />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {casesLoading ? [1,2,3].map(i => <SkeletonCard key={i} />) : (
                    <>
                        <StatCard title="Active Cases" value={activeCases.length} icon="work" color="primary" />
                        <StatCard title="Pending Invoices" value={pendingInvoices.length} icon="receipt_long" color="amber" />
                        <StatCard title="Next Appointment" value={nextAppt ? formatDate(nextAppt.scheduled_at) : 'None'} icon="calendar_month" color="green" />
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Cases */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Cases</CardTitle>
                        <Link to="/client/cases" className="text-xs font-bold text-primary hover:underline">View all →</Link>
                    </CardHeader>
                    {casesLoading ? (
                        <div className="space-y-3 mt-4">
                            {[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                        </div>
                    ) : cases.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                            <span className="material-symbols-outlined text-[40px]">folder_open</span>
                            <p className="text-sm">No cases yet</p>
                            <Link to="/client/services">
                                <Button size="sm">Browse Services</Button>
                            </Link>
                        </div>
                    ) : cases.slice(0, 3).map(c => (
                        <div key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 mt-3">
                            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <span className="material-symbols-outlined text-[20px] text-primary">folder_shared</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
                                <p className="text-xs text-slate-500">{c.case_number}</p>
                            </div>
                            <Badge variant={statusColors[c.status] || 'slate'}>
                                {c.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    ))}
                </Card>

                {/* Upcoming appointments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <Link to="/client/appointments" className="text-xs font-bold text-primary hover:underline">View all →</Link>
                    </CardHeader>
                    {apptLoading ? (
                        <div className="space-y-3 mt-4">
                            {[1,2].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                            <span className="material-symbols-outlined text-[40px]">calendar_month</span>
                            <p className="text-sm">No upcoming appointments</p>
                            <Link to="/client/services">
                                <Button size="sm">Book a Consultation</Button>
                            </Link>
                        </div>
                    ) : upcoming.slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 mt-3">
                            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                <span className="material-symbols-outlined text-[20px] text-purple-600">
                                    {a.type === 'video' ? 'videocam' : a.type === 'phone' ? 'call' : 'place'}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                <p className="text-xs text-slate-500">{formatDate(a.scheduled_at)}</p>
                            </div>
                            <Badge variant="blue">Upcoming</Badge>
                        </div>
                    ))}
                </Card>
            </div>

            {/* Recent invoices */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                    <Link to="/client/invoices" className="text-xs font-bold text-primary hover:underline">View all →</Link>
                </CardHeader>
                {invLoading ? (
                    <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 mt-4" />
                ) : invoices.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No invoices yet</p>
                ) : (
                    <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                        {invoices.slice(0, 3).map(inv => (
                            <div key={inv.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{inv.invoice_number}</p>
                                    <p className="text-xs text-slate-500">{inv.due_date ? `Due ${formatDate(inv.due_date)}` : 'No due date'}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-bold text-slate-900 dark:text-white">${Number(inv.amount).toFixed(2)}</p>
                                    <Badge variant={inv.status === 'paid' ? 'green' : inv.status === 'overdue' ? 'red' : 'amber'}>
                                        {inv.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    )
}
