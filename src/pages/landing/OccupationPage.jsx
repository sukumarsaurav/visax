import { Link, useParams, Navigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { OCCUPATIONS, DESTINATIONS, buildBreadcrumb, buildFAQ } from '../../lib/seo'

/**
 * Long-tail SEO landing: `/immigration/:slug` where slug is one of
 * OCCUPATIONS keys like 'canada-pr-for-software-engineer'.
 *
 * These pages target very high-intent queries with low SERP competition,
 * because most competitors only optimise for head terms like "Canada PR".
 * The combo of destination + occupation captures researched, ready-to-buy
 * Indian professionals.
 *
 * The route shares the `/immigration/:destination` slot — DestinationPage's
 * router is wrapped so it tries OCCUPATIONS first, then DESTINATIONS, then
 * 404s to /find-professionals. See App.jsx.
 */
export default function OccupationPage() {
    // The route is `/immigration/:destination` (shared with DestinationPage —
    // see ImmigrationRouter.jsx). For occupations, `destination` is actually
    // the OCCUPATIONS key like 'canada-pr-for-software-engineer'.
    const { destination } = useParams()
    const occ = OCCUPATIONS[destination]
    const dest = occ && DESTINATIONS[occ.destination]

    useSEO({
        title: occ?.title || 'Immigration Pathways',
        description: occ?.description || 'Find immigration consultants on Immizy.',
        keywords: occ
            ? `${dest?.country?.toLowerCase() || ''} pr for ${occ.occupation?.toLowerCase()}, ${occ.occupation?.toLowerCase()} immigration to ${dest?.country?.toLowerCase() || ''}, ${occ.occupation?.toLowerCase()} visa india, best country for ${occ.occupation?.toLowerCase()} from india`
            : undefined,
        canonical: occ ? `https://immizy.in/immigration/${occ.slug}` : 'https://immizy.in/find-professionals',
        schema: occ ? [
            buildBreadcrumb([
                { name: 'Home', url: '/' },
                { name: 'Immigration', url: '/find-professionals' },
                { name: dest?.country || 'Destination', url: `/immigration/${occ.destination}` },
                { name: `For ${occ.occupation}`, url: `/immigration/${occ.slug}` },
            ]),
            buildFAQ(occ.faqs),
        ] : null,
    })

    if (!occ) return <Navigate to="/find-professionals" replace />

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#0d1b2e] via-[#0f2748] to-[#0d1b2e] text-white py-20 px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <span className="text-5xl mb-4 block">{dest?.flag || '🌍'}</span>
                        <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">
                            <span className="material-symbols-outlined text-[14px]">work</span>
                            {dest?.country} · {occ.occupation}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">{occ.h1}</h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">{occ.intro}</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link to="/find-professionals" className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-colors">
                                Find a consultant
                            </Link>
                            {dest && (
                                <Link to={`/immigration/${dest.slug}`} className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold transition-colors">
                                    Full {dest.country} guide
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                {occ.faqs?.length > 0 && (
                    <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
                        <div className="max-w-3xl mx-auto">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                                Frequently Asked Questions
                            </h2>
                            <div className="space-y-6">
                                {occ.faqs.map((f, i) => (
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
                )}

                {/* Related */}
                <section className="py-16 px-6 max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Other immigration pathways</h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(OCCUPATIONS).filter(o => o.slug !== occ.slug).slice(0, 6).map(o => (
                            <Link key={o.slug} to={`/immigration/${o.slug}`}
                                className="text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                {DESTINATIONS[o.destination]?.flag} {o.occupation} → {DESTINATIONS[o.destination]?.country}
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
