import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button'

export default function PublicHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

    return (
        <>
            <header className={`sticky top-0 z-50 flex items-center justify-between border-b bg-white/90 dark:bg-[#101822]/90 backdrop-blur-md px-6 md:px-10 py-3 transition-all duration-200 ${scrolled ? 'border-slate-200 dark:border-slate-700 shadow-sm' : 'border-transparent'}`}>
                <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined material-filled text-lg">flight_takeoff</span>
                    </div>
                    <span className="text-lg font-black tracking-tight">Immizy</span>
                </Link>
                <div className="flex flex-1 justify-end gap-8">
                    <nav className="hidden md:flex items-center gap-8">
                        {[
                            { to: '/services', label: 'Services' },
                            { to: '/find-professionals', label: 'Find a Pro' },
                            { to: '/pricing', label: 'Pricing' },
                            { to: '/professional-register', label: 'For Professionals' },
                        ].map(({ to, label }) => {
                            const isActive = location.pathname === to || location.pathname.startsWith(to + '/')
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`text-sm font-medium transition-colors relative pb-0.5 ${isActive ? 'text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary' : 'text-slate-700 dark:text-slate-200 hover:text-primary'}`}
                                >
                                    {label}
                                </Link>
                            )
                        })}
                    </nav>
                    <div className="flex gap-2">
                        <Link to="/login"><Button variant="secondary">Sign In</Button></Link>
                        <Link to="/register"><Button>Get Started</Button></Link>
                    </div>
                </div>
                <button
                    className="md:hidden ml-2 text-slate-900 dark:text-white"
                    onClick={() => setMobileMenuOpen(v => !v)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        {mobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </header>

            {/* Mobile dropdown nav — always rendered, height animated */}
            <div aria-hidden={!mobileMenuOpen} className={`md:hidden fixed inset-x-0 top-[57px] z-40 bg-white dark:bg-[#101822] border-b border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden transition-all duration-200 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <nav className="flex flex-col p-4 gap-1">
                        <Link
                            to="/services"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">design_services</span>
                            Services
                        </Link>
                        <Link
                            to="/find-professionals"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">search</span>
                            Find a Pro
                        </Link>
                        <Link
                            to="/pricing"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">payments</span>
                            Pricing
                        </Link>
                        <Link
                            to="/professional-register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">badge</span>
                            For Professionals
                        </Link>
                        <Link
                            to="/help"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">help</span>
                            Help Center
                        </Link>
                    </nav>
            </div>
        </>
    )
}
