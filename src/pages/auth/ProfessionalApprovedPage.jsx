import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const nextSteps = [
    {
        icon: 'person_add',
        iconColor: 'text-primary bg-blue-100 dark:bg-blue-900/30',
        title: 'Start Managing Clients',
        description: 'Add your existing clients, create new cases, and securely upload documents.',
    },
    {
        icon: 'edit_note',
        iconColor: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
        title: 'Complete Your Profile',
        description: 'Update your agency details and certifications to stand out in the consultant directory.',
    },
    {
        icon: 'school',
        iconColor: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
        title: 'Explore Resources',
        description: 'Access the latest immigration forms, policy guides, and training materials.',
    },
]

export default function ProfessionalApprovedPage() {
    const { profile, updateProfile, getDashboardPath } = useAuth()
    const navigate = useNavigate()
    const dashPath = getDashboardPath()

    // Mark onboarding as complete when they visit this page
    useEffect(() => {
        if (profile && !profile.professional_onboarding_complete) {
            updateProfile({ professional_onboarding_complete: true }).catch(() => {})
        }
    }, [profile])

    const agencyName = profile?.agency_name || profile?.full_name || 'your agency'

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                    </div>
                    <span className="text-lg font-black tracking-tight">VisaX</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <Link to={dashPath} className="hover:text-slate-900 dark:hover:text-white transition-colors">Dashboard</Link>
                    <Link to={`${dashPath}/resources`} className="hover:text-slate-900 dark:hover:text-white transition-colors">Resource Library</Link>
                    <Link to={`${dashPath}/settings`} className="hover:text-slate-900 dark:hover:text-white transition-colors">Settings</Link>
                    <span className="font-bold text-slate-900 dark:text-white cursor-default">Global Services</span>
                </nav>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-[680px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Approved icon + heading */}
                    <div className="flex flex-col items-center text-center px-8 pt-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                            Your Account is Now Active!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md">
                            Congratulations, <strong className="text-slate-900 dark:text-white">{agencyName}</strong>! Your application has been successfully reviewed. You now have full access to the VisaX Professional Network.
                        </p>
                    </div>

                    {/* Next steps */}
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Get Started with Your Account</p>
                        <div className="flex flex-col gap-3">
                            {nextSteps.map((step) => (
                                <div
                                    key={step.title}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-default"
                                >
                                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${step.iconColor}`}>
                                        <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.description}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[20px] shrink-0">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="px-8 py-6 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Ready to dive in?</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Your professional dashboard is fully configured.</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link
                                to={`${dashPath}/settings`}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Set Up Profile
                            </Link>
                            <Link
                                to={dashPath}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-md shadow-primary/20"
                            >
                                Go to Dashboard
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Need help getting started?{' '}
                            <Link to="/help" className="font-semibold text-primary hover:underline">Contact Support</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
