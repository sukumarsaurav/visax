import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Button from '../ui/Button'

// ── Desktop nav items ─────────────────────────────────────────────────────────
// Two groups: client-facing (left) and pro-facing (right dropdown)

const CLIENT_NAV = [
    { to: '/find-professionals', label: 'Find Experts', icon: 'search'          },
    { to: '/services',           label: 'Services',    icon: 'design_services'  },
    { to: '/blog',               label: 'Visa Guides', icon: 'article'          },
]

const PRO_NAV = [
    { to: '/for-professionals',  label: 'How It Works',     icon: 'info',        desc: 'See how Immizy grows your practice' },
    { to: '/pricing',            label: 'Plans & Pricing',   icon: 'payments',    desc: 'Solo & agency plans from ₹499/mo'  },
    { to: '/professional-register', label: 'Register / Join', icon: 'badge',      desc: 'Start your free 15-day trial'      },
]

export default function PublicHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [proDropdownOpen, setProDropdownOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const dropdownRef = useRef(null)

    // Close on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 8)
            setProDropdownOpen(false)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false)
        setProDropdownOpen(false)
    }, [location.pathname])

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setProDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')

    return (
        <>
            <header className={`sticky top-0 z-50 flex items-center justify-between gap-4 border-b bg-white/95 dark:bg-[#101822]/95 backdrop-blur-md px-6 md:px-10 py-3 transition-all duration-200 ${scrolled ? 'border-slate-200 dark:border-slate-700 shadow-sm' : 'border-transparent'}`}>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white shrink-0">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined material-filled text-lg">flight_takeoff</span>
                    </div>
                    <span className="text-lg font-black tracking-tight">Immizy</span>
                </Link>

                {/* Desktop nav — client links */}
                <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {CLIENT_NAV.map(({ to, label }) => (
                        <Link key={to} to={to}
                            className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isActive(to)
                                    ? 'text-primary bg-primary/5'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}>
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop nav — right side */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                    {/* For Professionals dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setProDropdownOpen(v => !v)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                proDropdownOpen || isActive('/for-professionals') || isActive('/pricing') || isActive('/professional-register')
                                    ? 'text-primary bg-primary/5'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            aria-expanded={proDropdownOpen}
                            aria-haspopup="true"
                        >
                            <span className="material-symbols-outlined text-[16px]">badge</span>
                            For Professionals
                            <span className={`material-symbols-outlined text-[16px] transition-transform ${proDropdownOpen ? 'rotate-180' : ''}`}>
                                expand_more
                            </span>
                        </button>

                        {/* Dropdown panel */}
                        {proDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 overflow-hidden z-50">
                                <div className="p-2">
                                    {PRO_NAV.map(({ to, label, icon, desc }) => (
                                        <Link key={to} to={to}
                                            className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mt-0.5">
                                                <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="border-t border-slate-100 dark:border-slate-800 p-3">
                                    <Link to="/professional-register?plan=solo_pro"
                                        className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-white text-sm font-bold py-2.5 hover:bg-primary/90 transition-colors">
                                        <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                                        Start 15-Day Free Trial
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                    <Link to="/login">
                        <Button variant="secondary" size="sm">Sign In</Button>
                    </Link>
                    <Link to="/find-professionals">
                        <Button size="sm" icon="search">Get Help Free</Button>
                    </Link>
                </div>

                {/* Mobile: hamburger */}
                <button
                    className="md:hidden ml-2 flex size-9 items-center justify-center rounded-lg text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setMobileMenuOpen(v => !v)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        {mobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </header>

            {/* ── Mobile menu ─────────────────────────────────────────────── */}
            <div
                aria-hidden={!mobileMenuOpen}
                className={`md:hidden fixed inset-x-0 top-[57px] z-40 bg-white dark:bg-[#101822] border-b border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden transition-all duration-200 ease-in-out ${mobileMenuOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
            >
                <nav className="p-4 flex flex-col gap-0.5">

                    {/* Section label */}
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 pt-2 pb-1">For Clients</p>

                    {CLIENT_NAV.map(({ to, label, icon }) => (
                        <Link key={to} to={to}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[20px] text-slate-400">{icon}</span>
                            {label}
                        </Link>
                    ))}

                    <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4 py-1">For Professionals</p>

                    {PRO_NAV.map(({ to, label, icon }) => (
                        <Link key={to} to={to}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
                            {label}
                        </Link>
                    ))}

                    <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                    <div className="flex gap-3 px-2 pt-1 pb-2">
                        <Link to="/login" className="flex-1">
                            <Button variant="secondary" className="w-full" size="sm">Sign In</Button>
                        </Link>
                        <Link to="/find-professionals" className="flex-1">
                            <Button className="w-full" size="sm">Get Help Free</Button>
                        </Link>
                    </div>
                </nav>
            </div>
        </>
    )
}
