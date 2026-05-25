import { useState } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { COMPARISONS, DESTINATIONS, buildBreadcrumb, buildFAQ } from '../../lib/seo'
import { supabase } from '../../lib/supabase'

/**
 * Route: `/compare/:slug`
 *
 * Top-of-funnel comparison pages — "Canada vs Australia for Indians", etc.
 * These are some of the highest-volume mid-funnel queries for the Indian
 * audience because most applicants are deciding between 2–3 countries
 * before they commit to a consultant.
 *
 * The page side-by-sides the two destination configs (programs, FAQs,
 * intro) and links to both destination pages + the consultant directory.
 */
export default function ComparisonPage() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const cmp = COMPARISONS[slug]
    const [aKey, bKey] = cmp?.countries || []
    const a = DESTINATIONS[aKey]
    const b = DESTINATIONS[bKey]

    // Frictionless lead capture
    const [phone, setPhone]           = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone]             = useState(false)

    async function handleLeadSubmit(e) {
        e.preventDefault()
        if (!phone.trim()) return
        setSubmitting(true)
        try {
            await supabase.from('leads').insert({
                phone: phone.trim(),
                source: `comparison_page_${slug}`,
                metadata: { compared: [aKey, bKey] },
            })
        } catch (_) {}
        setDone(true)
        setSubmitting(false)
        setTimeout(() => navigate('/find-professionals'), 1400)
    }

    useSEO({
        title: cmp?.title || 'Immigration Pathway Comparison',
        description: cmp?.description || 'Compare immigration pathways on Immizy.',
        keywords: cmp && a && b
            ? `${a.country.toLowerCase()} vs ${b.country.toLowerCase()} for indian, ${a.country.toLowerCase()} or ${b.country.toLowerCase()} pr, best country to migrate from india, ${a.country.toLowerCase()} vs ${b.country.toLowerCase()} comparison`
            : undefined,
        canonical: cmp ? `https://immizy.in/compare/${cmp.slug}` : 'https://immizy.in/find-professionals',
        schema: cmp && a && b ? [
            buildBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Compare', url: '/find-professionals' },
                { name: `${a.country} vs ${b.country}`, url: `/compare/${cmp.slug}` },
            ]),
            // Merge both destinations' FAQs into one FAQPage — high keyword density
            buildFAQ([...(a.faqs || []).slice(0, 2), ...(b.faqs || []).slice(0, 2)]),
        ] : null,
    })

    if (!cmp || !a || !b) return <Navigate to="/find-professionals" replace />

    const renderCountryCard = (dest) => (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{dest.flag}</span>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{dest.country}</h3>
                    <p className="text-xs text-slate-500">{dest.subtitle}</p>
                </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                {dest.intro}
            </p>
            <div className="space-y-2 mb-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Key Programs</p>
                <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    {(dest.programs || []).slice(0, 4).map(p => (
                        <li key={p} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[14px] text-primary mt-1">check_circle</span>
                            {p}
                        </li>
                    ))}
                </ul>
            </div>
            <Link to={`/immigration/${dest.slug}`}
                className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors">
                Full {dest.country} guide
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#0d1b2e] via-[#0f2748] to-[#0d1b2e] text-white py-20 px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="text-6xl mb-6">{a.flag} <span className="text-3xl mx-2 text-blue-300">vs</span> {b.flag}</div>
                        <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">
                            Comparison Guide
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">{cmp.h1}</h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">{cmp.intro}</p>
                        <Link to="/find-professionals" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors">
                            Find a consultant for both
                        </Link>
                    </div>
                </section>

                {/* Side-by-side */}
                <section className="py-16 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {renderCountryCard(a)}
                            {renderCountryCard(b)}
                        </div>
                    </div>
                </section>

                {/* Lead Capture — still deciding? */}
                <section className="py-12 px-6 border-y border-slate-100 dark:border-slate-800 bg-white dark:bg-[#101822]">
                    <div className="max-w-2xl mx-auto">
                        {done ? (
                            <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
                                <span className="material-symbols-outlined text-emerald-600 text-[32px]">check_circle</span>
                                <div>
                                    <p className="font-bold text-emerald-900 dark:text-emerald-100">Got it! Finding your matches…</p>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Connecting you with experts who've handled both pathways.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-slate-800/50 rounded-2xl p-6 border border-primary/20 dark:border-primary/30">
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="material-symbols-outlined text-primary text-[28px] shrink-0 mt-0.5">support_agent</span>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white text-lg leading-snug">
                                            Still deciding between {a?.country} and {b?.country}?
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Talk to a verified consultant who has handled both pathways — free assessment, no commitment.
                                        </p>
                                    </div>
                                </div>
                                <form onSubmit={handleLeadSubmit} className="flex gap-3">
                                    <div className="flex flex-1 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden focus-within:border-primary transition-colors bg-white dark:bg-slate-800">
                                        <span className="flex items-center px-3 bg-slate-50 dark:bg-slate-700 text-slate-500 text-sm border-r border-slate-200 dark:border-slate-600">+91</span>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="Your WhatsApp number"
                                            className="flex-1 px-3 py-2.5 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting || !phone.trim()}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all shrink-0"
                                    >
                                        {submitting
                                            ? <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                                            : 'Get Free Advice →'
                                        }
                                    </button>
                                </form>
                                <p className="text-[11px] text-slate-400 mt-2">✓ 100% free &nbsp;·&nbsp; ✓ No spam &nbsp;·&nbsp; ✓ Reply within 2 hours</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Merged FAQs */}
                <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                            Common Questions
                        </h2>
                        <div className="space-y-6">
                            {[...(a.faqs || []).slice(0, 2), ...(b.faqs || []).slice(0, 2)].map((f, i) => (
                                <details key={i} className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                                    <summary className="cursor-pointer font-bold text-slate-900 dark:text-white list-none flex justify-between items-center">
                                        {f.q}
                                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
                                    </summary>
                                    <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">{f.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Other comparisons */}
                <section className="py-16 px-6 max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">More comparisons</h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(COMPARISONS).filter(c => c.slug !== cmp.slug).map(c => (
                            <Link key={c.slug} to={`/compare/${c.slug}`}
                                className="text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                {c.h1.replace(/ for Indians?$/i, '').replace('?', '')}
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
