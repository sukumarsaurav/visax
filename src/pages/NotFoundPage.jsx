import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function NotFoundPage() {
    const navigate = useNavigate()
    const { isAuthenticated, getDashboardPath } = useAuth()

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light p-6 dark:bg-background-dark">
            <div className="flex flex-col items-center gap-6 text-center max-w-md">
                <div className="flex size-24 items-center justify-center rounded-3xl bg-primary/10">
                    <span className="material-symbols-outlined material-filled text-[56px] text-primary">
                        flight_land
                    </span>
                </div>
                <div>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white">404</h1>
                    <h2 className="mt-2 text-xl font-bold text-slate-700 dark:text-slate-300">Page not found</h2>
                    <p className="mt-2 text-slate-500">This destination doesn't exist on the Immizy map. Let's get you back on track.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Go back
                    </button>
                    <Link
                        to={isAuthenticated ? getDashboardPath() : '/'}
                        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90"
                    >
                        <span className="material-symbols-outlined text-[18px]">home</span>
                        {isAuthenticated ? 'Go to Dashboard' : 'Go Home'}
                    </Link>
                </div>
            </div>
        </div>
    )
}
