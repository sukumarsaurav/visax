import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { PLAN_LIMITS } from '../../lib/planLimits'
import toast from 'react-hot-toast'

/**
 * Post-registration onboarding experience.
 * User lands here after successful registration (/?plan=solo_pro&accountType=individual)
 *
 * Flow:
 * 1. Welcome: "You're in! Here's what you get"
 * 2. Approval timeline: "Your account is being verified (2-4 hours)"
 * 3. Quick wins: 3 cards showing fast actions they can take
 * 4. Feature tour: 3-4 short videos on key features
 * 5. Next steps: Download app or wait for email
 */
export default function RegistrationOnboardingPage() {
    const navigate = useNavigate()
    const { user, profile } = useAuth()
    const [searchParams] = useSearchParams()

    const planId = searchParams.get('plan') || profile?.plan_id || 'solo_basic'
    const accountType = searchParams.get('accountType') || profile?.role || 'individual'
    const planLimits = PLAN_LIMITS[planId]

    const [currentStep, setCurrentStep] = useState(0)
    const [completedTours, setCompletedTours] = useState({})

    // Redirect to dashboard if user is already approved
    useEffect(() => {
        if (!user) {
            navigate('/professional-register')
            return
        }
        if (profile?.application_status === 'approved') {
            navigate('/consultant/dashboard')
        }
    }, [user, profile, navigate])

    if (!user || !profile) {
        return null
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Quick Wins - 3 fast actions they can do immediately
    // ─────────────────────────────────────────────────────────────────────────
    const quickWins = accountType === 'agency' ? [
        {
            icon: 'group_add',
            title: 'Invite Your Team',
            description: 'Add team members and start collaborating',
            action: 'Go to Team Management',
            href: '/consultant/team-management',
            color: 'blue',
        },
        {
            icon: 'person_add',
            title: 'Invite Your First Client',
            description: 'Send portal access to a client',
            action: 'Send Invitation',
            href: '/consultant/invite-client',
            color: 'emerald',
        },
        {
            icon: 'settings',
            title: 'Complete Your Profile',
            description: 'Add credentials and branding',
            action: 'Go to Settings',
            href: '/consultant/settings',
            color: 'purple',
        },
    ] : [
        {
            icon: 'person_add',
            title: 'Invite Your First Client',
            description: 'Send portal access to someone',
            action: 'Send Invitation',
            href: '/consultant/invite-client',
            color: 'emerald',
        },
        {
            icon: 'document_scanner',
            title: 'Add Your Credentials',
            description: 'Build trust with clients',
            action: 'Go to Settings',
            href: '/consultant/settings',
            color: 'purple',
        },
        {
            icon: 'school',
            title: 'Browse Resources',
            description: 'Learn best practices and templates',
            action: 'Go to Library',
            href: '/consultant/resource-library',
            color: 'amber',
        },
    ]

    // ─────────────────────────────────────────────────────────────────────────
    // Feature Tour Videos - embedded or external links
    // ─────────────────────────────────────────────────────────────────────────
    const featureTours = [
        {
            id: 'add-case',
            title: '📝 Add Your First Case',
            duration: '1:45',
            description: 'Learn how to create a case and invite clients',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: '🎯',
        },
        {
            id: 'client-portal',
            title: '🔗 Client Portal Overview',
            duration: '2:30',
            description: 'Show clients what they can see and do',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: '👥',
        },
        {
            id: 'documents',
            title: '📁 Document Management',
            duration: '1:20',
            description: 'Upload, organize, and share documents',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            thumbnail: '📄',
        },
    ]

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-700">
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-4">
                            Welcome to {planLimits.name}!
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            {accountType === 'agency'
                                ? 'Your team is ready. Here's how to get started and maximize your plan.'
                                : 'Your solo practice is set up. Here's how to add your first clients.'}
                        </p>
                    </div>

                    {/* Approval Status */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 max-w-2xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <span className="text-xl">⏱️</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Account Verification</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Your profile is being reviewed. Most accounts are approved within <strong>2-4 hours</strong>. You'll receive an email when you're ready.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan Features Highlight */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Plan Capacity</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {planLimits.maxCases === null ? '∞' : planLimits.maxCases}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Active cases</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Storage</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                            {planLimits.maxCases === null ? '∞' : planLimits.maxCases === 10 ? '2 GB' : planLimits.maxCases === 30 ? '10 GB' : '∞'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Document storage</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Support</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                            {planId.includes('pro') || planId.includes('growth') ? '⭐ Priority' : 'Email'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Help & assistance</p>
                    </div>
                </div>

                {/* Quick Wins */}
                <div className="mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6">
                        Quick Wins — Get Started Now
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {quickWins.map((win) => (
                            <a
                                key={win.href}
                                href={win.href}
                                className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:-translate-y-1"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-${win.color}-100 dark:bg-${win.color}-900/30 group-hover:scale-110 transition-transform`}>
                                    <span className="material-symbols-outlined text-slate-900 dark:text-white text-[24px]">
                                        {win.icon}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {win.title}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    {win.description}
                                </p>
                                <span className={`inline-flex items-center gap-2 text-sm font-semibold text-${win.color}-700 dark:text-${win.color}-400 group-hover:gap-3 transition-all`}>
                                    {win.action}
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Feature Tour */}
                <div className="mb-12 sm:mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                            Quick Video Tours (5 min total)
                        </h2>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Optional
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {featureTours.map((tour) => (
                            <button
                                key={tour.id}
                                onClick={() => setCurrentStep(featureTours.indexOf(tour) + 1)}
                                className="group relative text-left"
                            >
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-lg">
                                    {/* Thumbnail */}
                                    <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                                        <span className="text-6xl">{tour.thumbnail}</span>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                            {tour.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {tour.duration}
                                        </p>
                                    </div>

                                    {/* Play Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/10">
                                        <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-primary text-[28px]">play_arrow</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 dark:border-primary/30 rounded-xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-2">
                                What's Next?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                Check your email for account approval (usually 2-4 hours). In the meantime, you can complete your profile or watch our quick tours.
                            </p>
                        </div>
                        <div className="flex gap-3 flex-col sm:flex-row">
                            <button
                                onClick={() => navigate('/consultant/dashboard')}
                                className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap text-sm sm:text-base"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/consultant/settings')}
                                className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap text-sm sm:text-base"
                            >
                                Complete Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>Questions? Contact us at <a href="mailto:support@immizy.in" className="text-primary hover:underline">support@immizy.in</a></p>
            </div>
        </div>
    )
}
