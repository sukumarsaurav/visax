import { getMaintenanceMessage } from '../lib/platformConfig'
import { Link } from 'react-router-dom'

export default function MaintenancePage() {
    const message = getMaintenanceMessage()
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-primary text-white mx-auto mb-6 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-[40px]">construction</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Down for Maintenance</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">{message}</p>
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-primary transition-colors"
                >
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    Admin login
                </Link>
            </div>
        </div>
    )
}
