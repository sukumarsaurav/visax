import { Link } from 'react-router-dom'
import Button from '../ui/Button'

export default function PublicHeader() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-[#101822]/90 backdrop-blur-md px-6 md:px-10 py-3">
            <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                </div>
                <span className="text-lg font-black tracking-tight">VisaX</span>
            </Link>
            <div className="flex flex-1 justify-end gap-8">
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/services" className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors">Services</Link>
                    <Link to="/find-professionals" className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors">Find a Pro</Link>
                    <Link to="/pricing" className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                    <Link to="/professional-register" className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors">For Professionals</Link>
                </nav>
                <div className="flex gap-2">
                    <Link to="/login"><Button variant="secondary">Sign In</Button></Link>
                    <Link to="/register"><Button>Get Started</Button></Link>
                </div>
            </div>
            <button className="md:hidden text-slate-900 dark:text-white">
                <span className="material-symbols-outlined">menu</span>
            </button>
        </header>
    )
}
