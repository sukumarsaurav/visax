import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'

// ─── SEO ─────────────────────────────────────────────────────────────────────
const SEO_META = {
    title: 'For Immigration Consultants & Agencies | Grow Your Practice — Immizy',
    description: 'Join 500+ verified immigration consultants on Immizy. Get quality client leads, manage cases efficiently, and build your online reputation. Start your 15-day free trial.',
    keywords: 'immigration consultant platform india, immigration crm software, leads for immigration consultants, immigration consultant software india, grow immigration practice',
    canonical: 'https://immizy.in/for-professionals',
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STATS = [
    { value: '500+',    label: 'Verified Consultants'  },
    { value: '12,000+', label: 'Cases Managed'         },
    { value: '40+',     label: 'Cities Covered'        },
    { value: '4.8★',    label: 'Average Rating'        },
]

const PAIN_POINTS = [
    { old: 'Leads only from word-of-mouth',       new: 'Verified lead pipeline — clients find you'          },
    { old: 'Documents scattered in WhatsApp/email', new: 'Centralised case management CRM'                  },
    { old: 'No online reputation or reviews',      new: 'Public profile with authentic client reviews'       },
    { old: 'Manual follow-ups and reminders',      new: 'Automated deadlines, tasks, and client alerts'     },
    { old: 'Cash-only payments, no invoices',       new: 'Online invoicing and payment tracking'             },
]

const FEATURES = [
    {
        icon: 'person_search',
        color: 'text-primary',
        bg:    'bg-primary/10',
        title: 'Verified Lead Pipeline',
        desc:  'Clients searching for immigration help on Immizy are matched to verified consultants. You get pre-qualified enquiries — no cold outreach needed.',
        bullets: ['Destination and visa-type matched', 'Lead history and contact details', 'First-response timer to boost ranking'],
    },
    {
        icon:  'folder_open',
        color: 'text-purple-600',
        bg:    'bg-purple-50 dark:bg-purple-900/20',
        title: 'Case Management CRM',
        desc:  'Every document, deadline, note, and status — in one clean workspace. Replace the WhatsApp chaos with a real practice management system.',
        bullets: ['Kanban pipeline by case status', 'Document vault with e-signature', 'Deadline tracking and task reminders'],
    },
    {
        icon:  'verified',
        color: 'text-amber-600',
        bg:    'bg-amber-50 dark:bg-amber-900/20',
        title: 'Verified Profile & Reviews',
        desc:  'Your public Immizy profile ranks on Google. Credential-verified badge, authentic client reviews, and specialization tags all work together to build trust.',
        bullets: ['Schema.org rich results (star ratings in Google)', 'Credential and license verification badge', 'Collect reviews from every closed case'],
    },
    {
        icon:  'groups',
        color: 'text-emerald-600',
        bg:    'bg-emerald-50 dark:bg-emerald-900/20',
        title: 'Team Management',
        desc:  'For agencies: assign cases to team members, track individual performance, and keep every consultant on the same page — without micromanaging.',
        bullets: ['Unlimited team members (Agency plans)', 'Role-based access — admin / consultant', 'Team-wide analytics dashboard'],
    },
]

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: 'edit_note',
        title: 'Register in 5 minutes',
        desc: 'Create your profile, add your specializations, and submit your credentials for verification. No fee to apply.',
    },
    {
        step: '02',
        icon: 'verified_user',
        title: 'Get verified (1–2 days)',
        desc: 'Our team manually checks your credentials and licenses. Once approved, your Verified badge goes live and you start appearing in search results.',
    },
    {
        step: '03',
        icon: 'trending_up',
        title: 'Start growing',
        desc: "Go live on the directory, receive your first client enquiries, and use the CRM to manage cases end-to-end. Most consultants get their first lead within 48 hours.",
    },
]

const PRICING_TEASER = [
    {
        name: 'Solo Basic',
        price: '₹499',
        period: '/mo',
        desc: '1 consultant · 10 cases · client portal',
        cta: '/professional-register?plan=solo_basic',
        highlight: false,
    },
    {
        name: 'Solo Pro',
        price: '₹999',
        period: '/mo',
        desc: '1 consultant · 30 cases · invoicing + analytics',
        cta: '/professional-register?plan=solo_pro',
        highlight: true,
        badge: 'Most Popular',
    },
    {
        name: 'Agency',
        price: 'From ₹2,999',
        period: '/mo',
        desc: 'Up to 3 seats · 50 cases · team management',
        cta: '/professional-register?plan=agency_starter',
        highlight: false,
    },
]

const TESTIMONIALS = [
    {
        quote: "Before Immizy I was getting maybe 2–3 inquiries a month from word of mouth. Now I get 15–20 qualified leads a month and my calendar is always full. The ROI in the first month paid for the plan 10 times over.",
        name:  'Priya Sharma',
        role:  'Canada PR Specialist',
        city:  'Mumbai',
        initials: 'PS',
        bg:    'bg-primary/20',
        color: 'text-primary',
    },
    {
        quote: "The case management CRM alone saved me 10 hours a week. No more digging through WhatsApp threads for documents. My clients love the portal — they always know exactly where their application stands.",
        name:  'Rajesh Mehta',
        role:  'Agency Owner',
        city:  'Delhi',
        initials: 'RM',
        bg:    'bg-purple-100 dark:bg-purple-900/30',
        color: 'text-purple-600',
    },
    {
        quote: "I was sceptical about paying for a platform, but the verified badge and reviews on my profile pushed me to page 1 on Google for 'Canada consultant Mumbai'. Clients come to me now, not the other way around.",
        name:  'Anjali Nair',
        role:  'Australia PR Specialist',
        city:  'Bangalore',
        initials: 'AN',
        bg:    'bg-emerald-100 dark:bg-emerald-900/30',
        color: 'text-emerald-600',
    },
]

const FAQS = [
    {
        q: 'How quickly will I start getting client enquiries?',
        a: 'Most verified consultants receive their first enquiry within 24–48 hours of going live. Response speed matters: the faster you reply, the higher you rank in our match engine.',
    },
    {
        q: 'Do I need a specific license or certification to join?',
        a: 'We accept ICCRC-registered consultants (for Canada), MARA agents (for Australia), solicitors, and specialist immigration practitioners. Our team will guide you through the verification requirements during onboarding.',
    },
    {
        q: 'Is there a commission on client bookings?',
        a: 'No. Immizy charges a flat monthly subscription — we never take a cut of your service fees. The client pays you directly.',
    },
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. No lock-in. Cancel before the end of your billing cycle and you will not be charged again. Your profile and case history are exportable.',
    },
    {
        q: 'How does the 15-day free trial work?',
        a: 'Sign up, get verified, and use every feature without entering a card. At the end of 15 days you choose a plan — or simply stop. No automatic charge.',
    },
]

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ForProfessionalsPage() {
    useSEO(SEO_META)
    const [openFaq, setOpenFaq] = useState(null)

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">

                {/* ── Hero ─────────────────────────────────────────────────── */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f2748] to-[#0a1628] text-white py-24 px-6">
                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                    <div className="relative max-w-5xl mx-auto text-center">
                        {/* Eyebrow */}
                        <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold tracking-widest uppercase mb-5">
                            <span className="material-symbols-outlined text-[14px]">badge</span>
                            For Immigration Professionals
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-5">
                            Get more clients.<br className="hidden md:block" />
                            Manage cases faster.<br className="hidden md:block" />
                            <span className="text-primary">Grow your practice.</span>
                        </h1>

                        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join verified immigration consultants and agencies on Immizy — India's fastest-growing immigration platform. Leads, CRM, and a public profile that ranks on Google.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
                            <Link
                                to="/professional-register?plan=solo_pro"
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30"
                            >
                                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                                Start 15-Day Free Trial
                            </Link>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-bold px-8 py-3.5 rounded-xl transition-all"
                            >
                                See All Plans
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Stats bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                            {STATS.map(s => (
                                <div key={s.label} className="flex flex-col items-center gap-1">
                                    <span className="text-3xl font-black text-white">{s.value}</span>
                                    <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Old Way vs New Way ────────────────────────────────────── */}
                <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            The old way is costing you clients
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-12">
                            Every other immigration consultant in your city is still working the old way. Here's your edge.
                        </p>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                            {/* Header row */}
                            <div className="grid grid-cols-2 bg-slate-900 dark:bg-slate-800">
                                <div className="px-6 py-4 flex items-center gap-2 border-r border-slate-700">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">close</span>
                                    <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Without Immizy</span>
                                </div>
                                <div className="px-6 py-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                                    <span className="text-sm font-bold text-emerald-300 uppercase tracking-wider">With Immizy</span>
                                </div>
                            </div>
                            {PAIN_POINTS.map((p, i) => (
                                <div
                                    key={i}
                                    className={`grid grid-cols-2 ${i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}
                                >
                                    <div className="px-6 py-4 flex items-start gap-3 border-r border-slate-100 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 shrink-0">cancel</span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{p.old}</span>
                                    </div>
                                    <div className="px-6 py-4 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5 shrink-0">check_circle</span>
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.new}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Features ──────────────────────────────────────────────── */}
                <section className="py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            Everything you need to run a modern practice
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-14">
                            One platform — leads, cases, clients, team, payments.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                            {FEATURES.map(f => (
                                <div key={f.title} className="flex flex-col gap-4 p-7 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                                    <div className={`size-12 rounded-xl flex items-center justify-center ${f.bg}`}>
                                        <span className={`material-symbols-outlined text-[24px] ${f.color}`}>{f.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                                    </div>
                                    <ul className="flex flex-col gap-2 mt-1">
                                        {f.bullets.map(b => (
                                            <li key={b} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5 shrink-0">check_circle</span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── How It Works ──────────────────────────────────────────── */}
                <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            Get live in 2 days
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-14">
                            From sign-up to your first client enquiry, the whole process takes under 48 hours.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            {HOW_IT_WORKS.map((step, i) => (
                                <div key={step.step} className="flex flex-col items-center text-center gap-4">
                                    <div className="relative">
                                        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                            <span className="material-symbols-outlined text-white text-[28px]">{step.icon}</span>
                                        </div>
                                        <span className="absolute -top-2 -right-2 size-6 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 flex items-center justify-center text-white dark:text-slate-900 text-[10px] font-black">
                                            {i + 1}
                                        </span>
                                    </div>
                                    {/* Connector line (not on last) */}
                                    <div className="w-full relative">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-14 text-center">
                            <Link
                                to="/professional-register"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30"
                            >
                                <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                                Register Now — Free
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ──────────────────────────────────────────── */}
                <section className="py-20 px-6">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            Consultants who made the switch
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-14">
                            Real results from verified Immizy professionals.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {TESTIMONIALS.map(t => (
                                <div key={t.name} className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} className="material-symbols-outlined material-filled text-amber-400 text-[18px]">star</span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
                                        "{t.quote}"
                                    </p>
                                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className={`size-10 rounded-full ${t.bg} flex items-center justify-center ${t.color} font-bold text-sm shrink-0`}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                                            <p className="text-xs text-slate-500">{t.role} · {t.city}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Pricing Teaser ────────────────────────────────────────── */}
                <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-4">
                            All plans include a 15-day free trial. No credit card required to start.
                        </p>
                        <p className="text-center mb-12">
                            <Link to="/pricing" className="text-sm text-primary hover:underline font-medium">
                                View full feature comparison →
                            </Link>
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {PRICING_TEASER.map(plan => (
                                <div
                                    key={plan.name}
                                    className={`relative flex flex-col gap-4 p-6 rounded-2xl border transition-shadow ${
                                        plan.highlight
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm'
                                    }`}
                                >
                                    {plan.badge && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                            {plan.badge}
                                        </span>
                                    )}
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{plan.name}</p>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                                            <span className="text-sm text-slate-500">{plan.period}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.desc}</p>
                                    </div>
                                    <Link
                                        to={plan.cta}
                                        className={`mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            plan.highlight
                                                ? 'bg-primary hover:bg-blue-600 text-white shadow-md shadow-primary/30'
                                                : 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary'
                                        }`}
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 text-center mt-6">
                            Prices shown exclude 18% GST. Yearly billing saves 2 months.
                        </p>
                    </div>
                </section>

                {/* ── FAQ ───────────────────────────────────────────────────── */}
                <section className="py-20 px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-12">
                            Frequently asked questions
                        </h2>
                        <div className="flex flex-col gap-3">
                            {FAQS.map((faq, i) => (
                                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between px-6 py-4 text-left"
                                        aria-expanded={openFaq === i}
                                    >
                                        <span className="font-bold text-slate-900 dark:text-white text-sm pr-4">{faq.q}</span>
                                        <span className={`material-symbols-outlined text-slate-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-6 pb-5 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-4">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Final CTA ─────────────────────────────────────────────── */}
                <section className="py-20 px-6 bg-gradient-to-br from-[#0a1628] via-[#0f2748] to-[#0a1628] text-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="material-symbols-outlined text-primary text-[48px] mb-4 block">rocket_launch</span>
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Ready to grow your practice?
                        </h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Join 500+ verified immigration professionals already on Immizy. Start your 15-day free trial today — no credit card required.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/professional-register?plan=solo_pro"
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30"
                            >
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                                Join as a Consultant
                            </Link>
                            <Link
                                to="/professional-register?plan=agency_starter&type=agency"
                                className="inline-flex items-center justify-center gap-2 border border-white/25 hover:border-white/50 text-white font-bold px-8 py-3.5 rounded-xl transition-all"
                            >
                                <span className="material-symbols-outlined text-[20px]">apartment</span>
                                Join as an Agency
                            </Link>
                        </div>

                        <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-slate-500">credit_card_off</span>
                                No credit card
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-slate-500">cancel</span>
                                Cancel anytime
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-slate-500">timer</span>
                                15-day free trial
                            </span>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}
