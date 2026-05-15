import { Link, useParams, Navigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { DESTINATIONS } from '../../lib/seo'

const destSchema = (dest) => ({
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'Service',
            name: `${dest.country} Immigration Consulting — Immizy`,
            description: dest.description,
            url: `https://immizy.in/immigration/${dest.slug}`,
            provider: { '@type': 'Organization', name: 'Immizy', url: 'https://immizy.in' },
            areaServed: { '@type': 'Country', name: 'India' },
            serviceType: `${dest.country} Immigration Consulting`,
        },
        {
            '@type': 'FAQPage',
            mainEntity: dest.faqs.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
            })),
        },
    ],
})

const countryFlag = {
    Canada: '🇨🇦',
    Australia: '🇦🇺',
    Germany: '🇩🇪',
    'United Kingdom': '🇬🇧',
    Portugal: '🇵🇹',
}

export default function DestinationPage() {
    const { destination } = useParams()
    const dest = DESTINATIONS[destination]

    if (!dest) return <Navigate to="/find-professionals" replace />

    useSEO({
        title: dest.title,
        description: dest.description,
        canonical: `https://immizy.in/immigration/${dest.slug}`,
        schema: destSchema(dest),
    })

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#0d1b2e] via-[#0f2748] to-[#0d1b2e] text-white py-20 px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <span className="text-5xl mb-4 block">{countryFlag[dest.country] || '🌍'}</span>
                        <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold tracking-widest uppercase mb-3">
                            <span className="material-symbols-outlined text-[14px]">flight_takeoff</span>
                            {dest.subtitle}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                            {dest.h1}
                        </h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                            {dest.description}
                        </p>
                        <Link
                            to={`/find-professionals?q=${encodeURIComponent(dest.country + ' PR')}`}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30"
                        >
                            <span className="material-symbols-outlined text-[20px]">search</span>
                            Find {dest.country} Specialists
                        </Link>
                    </div>
                </section>

                {/* Programs */}
                <section className="py-14 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {dest.country} Immigration Pathways
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Our verified consultants cover every major route
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dest.programs.map((program) => (
                                <div
                                    key={program}
                                    className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                                >
                                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 shrink-0">check_circle</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{program}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About section */}
                <section className="py-14 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-start">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                    Why use a verified consultant for {dest.country}?
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                    {dest.intro}
                                </p>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    All {dest.country} immigration consultants on Immizy are manually verified — credentials checked, reviews authenticated, and fee structures transparent.
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                {[
                                    { icon: 'verified_user', title: 'Verified credentials', desc: `Only registered, licensed ${dest.country} immigration professionals` },
                                    { icon: 'reviews', title: 'Real client reviews', desc: 'Read authenticated reviews from applicants like you' },
                                    { icon: 'payments', title: 'Transparent fees', desc: 'No hidden charges — compare fees before booking' },
                                    { icon: 'support_agent', title: 'End-to-end support', desc: 'From eligibility assessment to visa approval' },
                                ].map((f) => (
                                    <div key={f.icon} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">{f.icon}</span>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{f.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-14 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 text-center">
                            {dest.country} Immigration — Common Questions
                        </h2>
                        <div className="flex flex-col gap-4">
                            {dest.faqs.map(({ q, a }) => (
                                <details key={q} className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                                    <summary className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white text-sm list-none">
                                        {q}
                                        <span className="material-symbols-outlined text-slate-400 group-open:rotate-180 transition-transform shrink-0 ml-3">expand_more</span>
                                    </summary>
                                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">
                            Start your {dest.country} journey today
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Connect with a verified {dest.country} immigration consultant on Immizy.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to={`/find-professionals?q=${encodeURIComponent(dest.country)}`}
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">search</span>
                                Find a Specialist
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold px-8 py-3.5 rounded-xl hover:border-primary hover:text-primary transition-all"
                            >
                                Create Free Account
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Other destinations */}
                <section className="py-10 px-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-5xl mx-auto">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Other Destinations</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(DESTINATIONS).filter(d => d.slug !== dest.slug).map(d => (
                                <Link
                                    key={d.slug}
                                    to={`/immigration/${d.slug}`}
                                    className="text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
                                >
                                    {countryFlag[d.country] || ''} {d.country}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
