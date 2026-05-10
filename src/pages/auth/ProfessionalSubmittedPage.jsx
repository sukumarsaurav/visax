import { Link } from 'react-router-dom'

// Generate a deterministic-looking application ID
function generateAppId() {
    const year = new Date().getFullYear()
    const num = Math.floor(10000 + Math.random() * 90000)
    return `#APP-${year}-${num}`
}

const appId = generateAppId()

const statusSteps = [
    {
        icon: 'check_circle',
        title: 'Registration Submitted',
        description: 'Documents uploaded and profile created.',
        status: 'done',
    },
    {
        icon: 'sync',
        title: 'Team Review In Progress',
        description: (
            <>
                Our team verifies credentials within <strong>1–2 business days</strong>.<br />
                We may contact you if additional information is required.
            </>
        ),
        status: 'active',
    },
    {
        icon: 'radio_button_unchecked',
        title: 'Final Approval & Access',
        description: 'You will receive an email notification.',
        status: 'pending',
    },
]

export default function ProfessionalSubmittedPage() {
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
                    <span className="cursor-default">Dashboard</span>
                    <span className="cursor-default">Resource Library</span>
                    <span className="cursor-default">Settings</span>
                    <span className="font-bold text-slate-900 dark:text-white cursor-default">Global Services</span>
                </nav>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-[680px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Success icon + heading */}
                    <div className="flex flex-col items-center text-center px-8 pt-10 pb-8 border-b border-slate-100 dark:border-slate-800">
                        <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                            Application Submitted Successfully!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md">
                            Thank you for applying to join the VisaX Professional Network. We have received your registration details and documents.
                        </p>
                    </div>

                    {/* Status tracker */}
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Application Status</p>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/30">
                                <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
                                Pending Review
                            </span>
                        </div>

                        <div className="flex flex-col gap-0">
                            {statusSteps.map((step, idx) => (
                                <div key={idx} className="flex gap-4">
                                    {/* Icon + connector */}
                                    <div className="flex flex-col items-center">
                                        <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                                            step.status === 'done'
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : step.status === 'active'
                                                    ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                            <span className={`material-symbols-outlined text-[18px] ${step.status === 'active' ? 'animate-spin' : ''}`}
                                                style={step.status === 'active' ? {} : { fontVariationSettings: step.status === 'done' ? "'FILL' 1" : "'FILL' 0" }}>
                                                {step.icon}
                                            </span>
                                        </div>
                                        {idx < statusSteps.length - 1 && (
                                            <div className={`w-0.5 flex-1 my-1 min-h-[24px] ${step.status === 'done' ? 'bg-green-200 dark:bg-green-900/40' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-6">
                                        <p className={`text-sm font-bold mb-1 ${
                                            step.status === 'active' ? 'text-primary' : step.status === 'done' ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard CTA */}
                    <div className="px-8 py-6 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Want to get familiar with the platform?</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">You can access a limited version of your dashboard while you wait.</p>
                        </div>
                        <Link
                            to="/consultant"
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-md shadow-primary/20"
                        >
                            Go to Dashboard
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Have questions about your application?{' '}
                            <Link to="/help" className="font-semibold text-primary hover:underline">Contact Support</Link>
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Application ID: {appId}</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
