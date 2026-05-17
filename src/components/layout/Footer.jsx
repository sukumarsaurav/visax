import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const SOCIAL_ICONS = {
    twitter:   { label: 'Twitter / X', path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.737-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
    linkedin:  { label: 'LinkedIn',    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    facebook:  { label: 'Facebook',    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    instagram: { label: 'Instagram',   path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
    youtube:   { label: 'YouTube',     path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
}

// Module-level cache so the DB is only queried once per app session
let _socialLinksCache = null
let _legalCache = null

export default function Footer() {
    const [socialLinks, setSocialLinks] = useState(_socialLinksCache || {})
    const [legal, setLegal] = useState(_legalCache || {})

    useEffect(() => {
        const toFetch = []
        if (!_socialLinksCache) toFetch.push(supabase.from('platform_settings').select('value').eq('key', 'social_links').single()
            .then(({ data }) => { if (data?.value) { _socialLinksCache = data.value; setSocialLinks(data.value) } }))
        if (!_legalCache) toFetch.push(supabase.from('platform_settings').select('value').eq('key', 'legal').single()
            .then(({ data }) => { if (data?.value) { _legalCache = data.value; setLegal(data.value) } }))
        if (toFetch.length) Promise.all(toFetch)
    }, [])

    const activeSocials = Object.entries(SOCIAL_ICONS).filter(([key]) => socialLinks[key])

    return (
        <footer className="bg-white dark:bg-[#101822] border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Logo & Description */}
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined material-filled text-lg">flight_takeoff</span>
                            </div>
                            <span className="font-black text-lg">Immizy</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Empowering your journey with the right guidance, every step of the way.
                        </p>
                        {/* Social links — only rendered when URLs are configured */}
                        {activeSocials.length > 0 && (
                        <div className="flex items-center gap-3">
                            {activeSocials.map(([key, { label, path }]) => (
                                <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary transition-colors">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d={path} /></svg>
                                </a>
                            ))}
                        </div>
                        )}
                    </div>

                    {/* Platform Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Platform</h4>
                        <Link to="/find-professionals" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Find a Pro
                        </Link>
                        <Link to="/services" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Services
                        </Link>
                        <Link to="/pricing" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Pricing
                        </Link>
                    </div>

                    {/* Resources Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Resources</h4>
                        <Link to="/professional-register" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            For Professionals
                        </Link>
                        <Link to="/support" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Help Center
                        </Link>
                    </div>

                    {/* Company Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Company</h4>
                        <Link to="/about" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            About Us
                        </Link>
                        <Link to="/support#trust-safety" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Trust & Safety
                        </Link>
                        <Link to="/support#contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} Immizy Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {legal.privacy_url ? (
                            <a href={legal.privacy_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                        ) : (
                            <Link to="/privacy" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
                        )}
                        {legal.terms_url ? (
                            <a href={legal.terms_url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                        ) : (
                            <Link to="/terms" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    )
}
