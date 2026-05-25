import { useState, useEffect } from 'react'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { supabase } from '../../lib/supabase'
import * as analyticsRepo from '../../data/analyticsRepo'

// ── Destination wizard data ─────────────────────────────────────────────────

const DESTINATIONS = [
    { key: 'canada',    flag: '🇨🇦', label: 'Canada',    popular: true  },
    { key: 'australia', flag: '🇦🇺', label: 'Australia', popular: true  },
    { key: 'uk',        flag: '🇬🇧', label: 'UK',        popular: false },
    { key: 'germany',   flag: '🇩🇪', label: 'Germany',   popular: false },
    { key: 'usa',       flag: '🇺🇸', label: 'USA',       popular: true  },
    { key: 'other',     flag: '🌍', label: 'Other',      popular: false },
]

const VISA_TYPES = [
    { key: 'pr',       icon: 'home',         label: 'Permanent Residency' },
    { key: 'work',     icon: 'work',         label: 'Work Permit / Visa'  },
    { key: 'student',  icon: 'school',       label: 'Study / Student Visa'},
    { key: 'family',   icon: 'family_restroom', label: 'Family Sponsorship' },
    { key: 'business', icon: 'business_center', label: 'Business / Investor' },
    { key: 'other',    icon: 'more_horiz',   label: 'Not Sure / Other'   },
]

// ── Static content ───────────────────────────────────────────────────────────

const proTestimonials = [
    { name: 'Rajesh K.', role: 'Immigration Consultant, Delhi', initials: 'RK', color: 'bg-blue-500',
      text: 'I was spending 3 hours a day chasing leads on WhatsApp groups. Immizy sends me 8–12 qualified leads a week. My revenue doubled in 4 months.' },
    { name: 'Sunita A.', role: 'Agency Owner, Bangalore', initials: 'SA', color: 'bg-violet-500',
      text: 'The CRM alone is worth every rupee. My team of 6 consultants all work in one place — cases, docs, messaging. No more spreadsheets.' },
]

const clientTestimonials = [
    { name: 'Priya M.', role: 'Software Engineer → Canada PR', initials: 'PM', color: 'bg-emerald-500',
      text: 'Immizy matched me with a consultant who specialised exactly in Canada Express Entry. Got my PR in 11 months. The case tracking gave me peace of mind throughout.' },
    { name: 'Carlos R.', role: 'Family Visa Applicant', initials: 'CR', color: 'bg-amber-500',
      text: 'Found a consultant who spoke my language and understood my situation. Got my Green Card approved in record time. Highly recommend!' },
    { name: 'Sarah K.', role: 'International Student', initials: 'SK', color: 'bg-rose-500',
      text: 'The document tracking alone saved me weeks of stress. My consultant caught a missing form before submission — worth every penny.' },
]

const proFeatures = [
    { icon: 'leaderboard',    title: 'Qualified Leads',      desc: 'Clients matched to your specialisation, city, and language — no cold outreach needed.' },
    { icon: 'folder_shared',  title: 'Full CRM',             desc: 'Cases, documents, appointments, invoices, and client messages — all in one dashboard.' },
    { icon: 'groups',         title: 'Team Management',      desc: 'Invite staff, assign cases, track workload across your agency — from one login.' },
    { icon: 'analytics',      title: 'Business Analytics',   desc: 'See conversion rates, revenue, case outcomes, and client satisfaction over time.' },
]

const CITIES = [
    { label: 'Mumbai',    slug: 'mumbai'    },
    { label: 'Delhi',     slug: 'delhi'     },
    { label: 'Bangalore', slug: 'bangalore' },
    { label: 'Hyderabad', slug: 'hyderabad' },
    { label: 'Chennai',   slug: 'chennai'   },
    { label: 'Pune',      slug: 'pune'      },
]

// ── Lead Wizard Component ────────────────────────────────────────────────────

function LeadWizard({ platformStats }) {
    const navigate = useNavigate()
    const [step, setStep] = useState(1)   // 1 = destination, 2 = visa type, 3 = capture
    const [dest, setDest] = useState(null)
    const [visaType, setVisaType] = useState(null)
    const [phone, setPhone] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    function pickDest(key) {
        setDest(key)
        setStep(2)
    }

    function pickVisa(key) {
        setVisaType(key)
        setStep(3)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!phone.trim()) return
        setSubmitting(true)
        try {
            // Store lead in Supabase for consultant notification
            await supabase.from('leads').insert({
                phone: phone.trim(),
                destination: dest,
                visa_type: visaType,
                source: 'homepage_wizard',
            }).throwOnError()
        } catch (_) {
            // Non-blocking — even if DB insert fails, redirect user
        }
        setDone(true)
        setSubmitting(false)
        // Redirect to filtered professionals list
        const params = new URLSearchParams()
        if (dest && dest !== 'other') params.set('destination', dest)
        if (visaType && visaType !== 'other') params.set('visa', visaType)
        setTimeout(() => navigate(`/find-professionals?${params}`), 1200)
    }

    const destLabel  = DESTINATIONS.find(d => d.key === dest)?.label
    const visaLabel  = VISA_TYPES.find(v => v.key === visaType)?.label

    if (done) {
        return (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="size-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600 text-[36px]">check_circle</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Finding your matches…</h3>
                <p className="text-slate-500 text-sm">Taking you to verified consultants who specialise in {destLabel} {visaLabel?.toLowerCase()}.</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Progress bar */}
            <div className="flex h-1 bg-slate-100 dark:bg-slate-700">
                {[1,2,3].map(s => (
                    <div key={s} className={`flex-1 transition-all duration-300 ${s <= step ? 'bg-primary' : ''}`} />
                ))}
            </div>

            <div className="p-6 sm:p-8">
                {step === 1 && (
                    <>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Step 1 of 3</p>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Where do you want to immigrate?</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Pick your destination country to see matched consultants.</p>
                        <div className="grid grid-cols-3 gap-3">
                            {DESTINATIONS.map(d => (
                                <button key={d.key} onClick={() => pickDest(d.key)}
                                    className="relative flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-4 text-center hover:border-primary hover:bg-primary/5 transition-all active:scale-95">
                                    {d.popular && (
                                        <span className="absolute -top-2 right-2 text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded-full uppercase">Hot</span>
                                    )}
                                    <span className="text-3xl">{d.flag}</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{d.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary mb-4 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                        </button>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Step 2 of 3</p>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">What do you need help with?</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {DESTINATIONS.find(d => d.key === dest)?.flag} {destLabel} — select your visa type.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {VISA_TYPES.map(v => (
                                <button key={v.key} onClick={() => pickVisa(v.key)}
                                    className="flex items-center gap-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 p-3.5 text-left hover:border-primary hover:bg-primary/5 transition-all active:scale-95">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                        <span className="material-symbols-outlined text-primary text-[18px]">{v.icon}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <button onClick={() => setStep(2)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary mb-4 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back
                        </button>
                        <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Step 3 of 3</p>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Get matched with 3 experts — free</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            {DESTINATIONS.find(d => d.key === dest)?.flag} {destLabel} · {visaLabel}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Enter your phone number. We'll connect you with verified consultants who reply within 2 hours.</p>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <div className="flex rounded-xl border-2 border-slate-200 dark:border-slate-600 overflow-hidden focus-within:border-primary transition-colors">
                                <span className="flex items-center px-3 bg-slate-50 dark:bg-slate-700 text-slate-500 text-sm font-medium border-r border-slate-200 dark:border-slate-600">+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="Your WhatsApp number"
                                    className="flex-1 px-4 py-3 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                                    required
                                />
                            </div>
                            <button type="submit" disabled={submitting || !phone.trim()}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold py-3.5 text-sm hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-95">
                                {submitting ? (
                                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                )}
                                {submitting ? 'Matching…' : 'Find My Consultants →'}
                            </button>
                            <p className="text-center text-[11px] text-slate-400">
                                ✓ 100% free &nbsp;·&nbsp; ✓ No spam &nbsp;·&nbsp; ✓ Verified consultants only
                            </p>
                        </form>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                            <Link to={`/find-professionals`} className="text-xs text-slate-500 hover:text-primary transition-colors">
                                Prefer to browse yourself → View all consultants
                            </Link>
                        </div>
                    </>
                )}
            </div>

            {/* Trust bar */}
            <div className="px-6 pb-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-amber-400 text-[14px]">star</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{platformStats.avgRating || '4.9'}</span>
                    <span>from {platformStats.reviews > 0 ? `${platformStats.reviews}+` : '500+'} reviews</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="material-symbols-outlined text-emerald-500 text-[14px]">verified_user</span>
                    {platformStats.consultants > 0 ? `${platformStats.consultants}+` : '500+'} verified consultants
                </div>
            </div>
        </div>
    )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
    useSEO(SEO.home)
    const [platformStats, setPlatformStats] = useState({ consultants: 0, avgRating: null, reviews: 0 })
    const [featuredConsultants, setFeaturedConsultants] = useState([])

    useEffect(() => { fetchHeroData() }, [])

    async function fetchHeroData() {
        const [stats, consultantsRes] = await Promise.all([
            analyticsRepo.getPlatformStats(),
            supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role, specializations, city')
                .in('role', ['individual', 'agency_admin'])
                .eq('application_status', 'approved')
                .limit(6),
        ])
        if (stats) setPlatformStats({ consultants: stats.consultants, avgRating: stats.avgRating, reviews: stats.reviews })
        if (consultantsRes.data?.length) setFeaturedConsultants(consultantsRes.data.slice(0, 4))
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117]">
            <PublicHeader />

            {/* ── HERO — Lead Capture Wizard ─────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0d1b2e] via-[#0f2a4a] to-[#0d1b2e] py-16 md:py-24 px-6">
                {/* Subtle radial glow */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl opacity-40" />
                    <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-blue-400/20 blur-3xl opacity-30" />
                </div>

                <div className="relative max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left — headline */}
                    <div className="flex flex-col gap-6 text-white">
                        <div className="inline-flex w-fit items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            {platformStats.consultants > 0 ? `${platformStats.consultants}+ verified professionals` : 'Trusted by thousands'}
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
                            Find Your<br />
                            <span className="text-blue-400">Immigration</span><br />
                            Expert Today
                        </h1>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                            Tell us where you want to go — we'll match you with a verified consultant who has helped hundreds get there.
                        </p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-6 pt-2">
                            {[
                                { value: platformStats.consultants > 0 ? `${platformStats.consultants}+` : '500+', label: 'Verified Experts' },
                                { value: '10K+',  label: 'Cases Handled'  },
                                { value: '100%',  label: 'Free for Clients' },
                            ].map(({ value, label }) => (
                                <div key={label}>
                                    <p className="text-2xl font-black text-white">{value}</p>
                                    <p className="text-xs text-slate-400">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Featured consultant avatars */}
                        {featuredConsultants.length > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {featuredConsultants.map(c => (
                                        <Avatar key={c.id} src={c.avatar_url} alt={c.full_name} size="sm"
                                            className="ring-2 ring-[#0f2748]" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-400">
                                    <span className="text-white font-semibold">{featuredConsultants[0]?.full_name?.split(' ')[0]}</span>
                                    {' '}and {featuredConsultants.length - 1}+ others are online
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right — wizard */}
                    <div>
                        <LeadWizard platformStats={platformStats} />
                    </div>
                </div>
            </section>

            {/* ── TRUST BAR ──────────────────────────────────────────────── */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-center flex-wrap gap-8 text-sm text-slate-500 dark:text-slate-400">
                    {[
                        { icon: 'verified_user', text: 'All consultants verified' },
                        { icon: 'lock',          text: '100% free for clients'   },
                        { icon: 'schedule',      text: 'Reply within 2 hours'    },
                        { icon: 'star',          text: '4.9/5 average rating'    },
                    ].map(({ icon, text }) => (
                        <div key={text} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
                            <span className="font-medium">{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── HOW IT WORKS (CLIENT) ───────────────────────────────────── */}
            <section className="py-20 px-6 bg-white dark:bg-[#0d1117]">
                <div className="max-w-[1100px] mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-black uppercase tracking-widest text-primary mb-3">For People Seeking Immigration Help</span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                            Get Expert Guidance in 3 Steps
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-0.5 border-t-2 border-dashed border-slate-200 dark:border-slate-700" />
                        {[
                            { n: '01', icon: 'tune',       title: 'Tell us your goal',     desc: 'Pick your destination and visa type. Takes 30 seconds.' },
                            { n: '02', icon: 'connect_without_contact', title: 'Get matched instantly',  desc: 'We show you 3 verified consultants who specialize in exactly that.' },
                            { n: '03', icon: 'verified',   title: 'Book & get approved',   desc: 'Book a free first call. Your consultant handles the rest.' },
                        ].map(({ n, icon, title, desc }) => (
                            <div key={n} className="flex flex-col items-center text-center relative">
                                <div className="relative mb-6">
                                    <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                                    </div>
                                    <span className="absolute -top-2 -right-2 text-[10px] font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-6 h-6 rounded-full flex items-center justify-center">{n}</span>
                                </div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/find-professionals">
                            <Button size="lg" icon="arrow_forward" iconPosition="right">Browse All Consultants</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── CLIENT TESTIMONIALS ─────────────────────────────────────── */}
            <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-[1100px] mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">
                            Real people. Real approvals.
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">Stories from clients who found their consultant on Immizy.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {clientTestimonials.map(t => (
                            <div key={t.name} className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined material-filled text-amber-400 text-[16px]">star</span>)}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <div className={`size-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{t.initials}</div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CITY QUICK LINKS ────────────────────────────────────────── */}
            <section className="py-14 px-6 bg-white dark:bg-[#0d1117] border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-[1100px] mx-auto">
                    <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
                        Find consultants near you
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {CITIES.map(({ label, slug }) => (
                            <Link key={slug} to={`/immigration-consultant-${slug}`}
                                className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── DIVIDER: FOR PROFESSIONALS ──────────────────────────────── */}
            <div className="bg-gradient-to-r from-primary via-blue-600 to-indigo-700 py-3 px-6 text-center">
                <p className="text-white text-sm font-medium">
                    Are you an immigration consultant or agency?{' '}
                    <Link to="/for-professionals" className="font-black underline underline-offset-2 hover:no-underline">
                        See how Immizy grows your practice →
                    </Link>
                </p>
            </div>

            {/* ── FOR PROFESSIONALS SECTION ───────────────────────────────── */}
            <section className="py-20 px-6 bg-slate-900 dark:bg-[#060d18]">
                <div className="max-w-[1100px] mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-black uppercase tracking-widest text-blue-400 mb-3">For Immigration Consultants & Agencies</span>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Stop chasing leads.<br />Let clients come to you.
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Clients are searching for consultants like you every day. Immizy matches them directly to your profile — and gives you the CRM to manage every case.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
                        {proFeatures.map(f => (
                            <div key={f.title} className="flex flex-col gap-3 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[20px]">{f.icon}</span>
                                </div>
                                <h3 className="font-bold text-white">{f.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pro testimonials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {proTestimonials.map(t => (
                            <div key={t.name} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <div className="flex gap-0.5 mb-3">
                                    {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined material-filled text-amber-400 text-[14px]">star</span>)}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed mb-4">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`size-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>{t.initials}</div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing teaser */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 text-center sm:text-left">
                        <div>
                            <p className="text-white font-black text-lg">Starts at ₹499/month</p>
                            <p className="text-slate-400 text-sm">15-day free trial · No credit card required · Cancel anytime</p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Link to="/for-professionals">
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">Learn More</Button>
                            </Link>
                            <Link to="/professional-register?plan=solo_pro">
                                <Button className="bg-white text-primary hover:bg-slate-100 font-black">Start Free Trial</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA (CLIENTS) ─────────────────────────────────────── */}
            <section className="relative overflow-hidden py-20 px-6 bg-primary">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative max-w-[700px] mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Your immigration journey starts with the right expert.
                    </h2>
                    <p className="text-white/80 text-lg mb-8">Find a verified consultant for free — matched to your destination and visa type in under a minute.</p>
                    <Link to="/find-professionals">
                        <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-black" icon="arrow_forward" iconPosition="right">
                            Find My Expert — Free
                        </Button>
                    </Link>
                    <p className="text-white/60 text-xs mt-4">✓ No signup needed to browse &nbsp;·&nbsp; ✓ 500+ verified professionals &nbsp;·&nbsp; ✓ Free for clients</p>
                </div>
            </section>

            <Footer />
        </div>
    )
}
