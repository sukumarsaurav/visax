import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-[#101822] border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="max-w-[1200px] mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Logo & Description */}
                    <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                            </div>
                            <span className="font-black text-lg">VisaX</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Empowering your journey with the right guidance, every step of the way.
                        </p>
                    </div>

                    {/* Platform Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Platform</h4>
                        <Link to="/services" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Find a Pro
                        </Link>
                        <Link to="/how-it-works" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            How it Works
                        </Link>
                        <Link to="/pricing" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Pricing
                        </Link>
                    </div>

                    {/* Resources Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Resources</h4>
                        <Link to="/blog" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Blog
                        </Link>
                        <Link to="/guides" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Visa Guides
                        </Link>
                        <Link to="/community" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Community Forum
                        </Link>
                    </div>

                    {/* Support Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Support</h4>
                        <Link to="/help" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Help Center
                        </Link>
                        <Link to="/trust" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Trust & Safety
                        </Link>
                        <Link to="/contact" className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                            Contact Us
                        </Link>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-400">
                        © 2025 VisaX Inc. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Privacy
                        </Link>
                        <Link to="/terms" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Terms
                        </Link>
                        <Link to="/sitemap" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Sitemap
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
