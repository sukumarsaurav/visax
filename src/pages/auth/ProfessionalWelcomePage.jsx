import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'

const benefits = [
    {
        icon: 'verified_user',
        title: 'Get Verified & Build Trust',
        description: 'Earn the Immizy Verified badge. Clients prioritise verified professionals when booking.'
    },
    {
        icon: 'people',
        title: 'Grow Your Client Base',
        description: 'Access thousands of clients actively seeking immigration expertise across all visa types.'
    },
    {
        icon: 'folder_shared',
        title: 'All-in-One Case Management',
        description: 'Track cases, send invoices, schedule consultations, and message clients from one dashboard.'
    }
]

const consultantAvatars = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face',
]

const stats = [
    { value: '500+', label: 'Verified Professionals' },
    { value: '10k+', label: 'Clients Served' },
    { value: '98%', label: 'Success Rate' },
]

export default function ProfessionalWelcomePage() {
    useSEO(SEO.professionalWelcome)
    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822] overflow-x-hidden">
            <PublicHeader />

            <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-14 lg:px-10 lg:py-20">
                <div className="w-full max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

                        {/* Left: Hero image */}
                        <div className="relative order-2 lg:order-1 w-full min-h-[300px] lg:min-h-[580px] flex flex-col justify-center">
                            <div className="absolute -left-10 -top-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                            <div className="absolute -right-10 bottom-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10" />

                            <div
                                className="w-full bg-center bg-no-repeat bg-cover rounded-2xl shadow-2xl shadow-slate-200 dark:shadow-slate-900/50 overflow-hidden relative aspect-[4/3] lg:aspect-auto lg:h-[560px]"
                                style={{
                                    backgroundImage: `url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1470&auto=format&fit=crop')`
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                                {/* Stats bar */}
                                <div className="absolute top-5 left-5 right-5 flex gap-3">
                                    {stats.map((s) => (
                                        <div key={s.value} className="flex-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm">
                                            <p className="text-lg font-black text-primary">{s.value}</p>
                                            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Trust badge */}
                                <div className="absolute bottom-5 left-5 right-5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2 shrink-0">
                                            {consultantAvatars.map((avatar, idx) => (
                                                <div
                                                    key={idx}
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 bg-cover bg-center"
                                                    style={{ backgroundImage: `url('${avatar}')` }}
                                                />
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">500+ professionals trust Immizy</p>
                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="material-symbols-outlined text-yellow-400 text-[12px]">star</span>
                                                ))}
                                                <span className="text-xs text-slate-500 ml-1">4.9 avg. rating</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="flex flex-col gap-8 order-1 lg:order-2">
                            <div className="flex flex-col gap-3">
                                <span className="inline-flex items-center gap-1.5 text-primary font-bold tracking-wide uppercase text-xs">
                                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                                    Professional Registration
                                </span>
                                <h1 className="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                                    Grow Your Practice<br />with <span className="text-primary">Immizy</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-[480px]">
                                    Join 500+ immigration professionals and agencies managing their entire practice — clients, cases, and consultations — in one place.
                                </p>
                            </div>

                            {/* Value props */}
                            <div className="flex flex-col gap-5">
                                {benefits.map((b) => (
                                    <div key={b.icon} className="flex items-start gap-4">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">{b.title}</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{b.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col gap-3 mt-2">
                                <Link
                                    to="/professional-register/form"
                                    className="flex items-center justify-center gap-2 rounded-xl py-3.5 px-8 bg-primary hover:bg-blue-600 text-white text-base font-bold transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
                                >
                                    <span>Start Registration</span>
                                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                </Link>
                                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                    Already registered?{' '}
                                    <Link to="/login" className="font-semibold text-primary hover:underline">Log in to your dashboard</Link>
                                </p>
                            </div>

                            {/* Account types note */}
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    We support both <strong>Individual Consultants</strong> and <strong>Immigration Agencies</strong>. You'll choose your account type during registration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
