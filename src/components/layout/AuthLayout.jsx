import { Outlet, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthLayout() {
    const { isAuthenticated, getDashboardPath, loading } = useAuth()

    // Redirect authenticated users to their dashboard
    if (!loading && isAuthenticated) {
        return <Navigate to={getDashboardPath()} replace />
    }

    return (
        <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
            {/* Left: Branded panel */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900" />
                <div className="relative z-10 p-12 max-w-lg text-white">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                            <span className="material-symbols-outlined material-filled text-2xl">flight_takeoff</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">VisaX</span>
                    </div>
                    <h1 className="text-4xl font-black leading-tight mb-4">
                        Connecting dreams to destinations.
                    </h1>
                    <p className="text-lg text-white/85 leading-relaxed">
                        Join thousands of clients, consultants, and agencies navigating immigration the smart way.
                    </p>

                    {/* Stats */}
                    <div className="mt-10 grid grid-cols-3 gap-4">
                        {[
                            { value: '10k+', label: 'Clients' },
                            { value: '500+', label: 'Consultants' },
                            { value: '98%', label: 'Success Rate' },
                        ].map(s => (
                            <div key={s.label} className="rounded-xl bg-white/10 border border-white/20 p-4 text-center">
                                <p className="text-2xl font-black">{s.value}</p>
                                <p className="text-sm text-white/70 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="mt-8 rounded-xl bg-white/10 border border-white/20 p-5">
                        <p className="text-sm text-white/90 italic leading-relaxed">
                            "VisaX made our H-1B process incredibly smooth. Having everything in one place — documents, appointments, case tracking — was a game changer."
                        </p>
                        <p className="mt-3 text-xs font-bold text-white/60">— Priya M., Software Engineer</p>
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex w-full flex-col lg:w-1/2">
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-2 lg:invisible">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">VisaX</span>
                    </div>
                    <Link to="/" className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
                        ← Back to Home
                    </Link>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-12">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
