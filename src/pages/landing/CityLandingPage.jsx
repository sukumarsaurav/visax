import { Link, useParams, Navigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { useSEO } from '../../hooks/useSEO'
import { CITIES } from '../../lib/seo'

const citySchema = (city) => ({
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'LocalBusiness',
            name: `Immizy — Immigration Consultants in ${city.fullName}`,
            description: city.description,
            url: `https://immizy.in/immigration-consultant-${city.slug}`,
            areaServed: { '@type': 'City', name: city.fullName },
            serviceType: 'Immigration Consulting',
            priceRange: '₹₹',
        },
        {
            '@type': 'FAQPage',
            mainEntity: [
                {
                    '@type': 'Question',
                    name: `How do I find a verified immigration consultant in ${city.fullName}?`,
                    acceptedAnswer: { '@type': 'Answer', text: `Use Immizy to browse verified immigration consultants in ${city.fullName}. All listed professionals are credential-checked. Filter by visa type, language, and rating.` },
                },
                {
                    '@type': 'Question',
                    name: `What is the best immigration consultant in ${city.fullName}?`,
                    acceptedAnswer: { '@type': 'Answer', text: `Immizy lists top-rated verified immigration consultants in ${city.fullName}. Compare profiles, read real client reviews, and check credentials before booking.` },
                },
            ],
        },
    ],
})

const visaIconMap = {
    'Canada PR': 'travel_explore',
    'Canada Express Entry': 'travel_explore',
    'Australia PR': 'flight_takeoff',
    'UK Skilled Worker': 'work',
    'Germany Job Seeker': 'engineering',
    'USA H-1B': 'business_center',
    'USA Visa': 'business_center',
    'Student Visa': 'school',
    'Portugal D7': 'sunny',
}

export default function CityLandingPage() {
    const { city: citySlug } = useParams()
    const city = CITIES[citySlug]

    if (!city) return <Navigate to="/find-professionals" replace />

    useSEO({
        title: city.title,
        description: city.description,
        canonical: `https://immizy.in/immigration-consultant-${city.slug}`,
        schema: citySchema(city),
    })

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            <main id="main-content">
                {/* Hero */}
                <section className="bg-gradient-to-br from-[#0d1b2e] via-[#0f2748] to-[#0d1b2e] text-white py-20 px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <span className="inline-flex items-center gap-1.5 text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {city.fullName}, India
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                            {city.h1}
                        </h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                            Find verified, credential-checked immigration consultants in {city.fullName}. Compare profiles, read real reviews, and book a consultation today.
                        </p>
                        <Link
                            to={`/find-professionals?location=${city.name}`}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/30"
                        >
                            <span className="material-symbols-outlined text-[20px]">search</span>
                            Browse {city.name} Consultants
                        </Link>
                    </div>
                </section>

                {/* Top visa types */}
                <section className="py-14 px-6 bg-slate-50 dark:bg-slate-900/50">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            Popular Visa Types in {city.fullName}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Find a specialist for your specific visa category
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {city.topVisas.map((visa) => (
                                <Link
                                    key={visa}
                                    to={`/find-professionals?q=${encodeURIComponent(visa)}&location=${city.name}`}
                                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md transition-all text-center group"
                                >
                                    <span className="material-symbols-outlined text-primary text-[28px] group-hover:scale-110 transition-transform">
                                        {visaIconMap[visa] || 'description'}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{visa}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Immizy section */}
                <section className="py-14 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                                    About Immigration in {city.fullName}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                                    {city.intro}
                                </p>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                                >
                                    Get started for free
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: 'verified_user', label: 'All consultants verified', desc: 'Credentials checked before listing' },
                                    { icon: 'star', label: 'Real client reviews', desc: 'Transparent ratings you can trust' },
                                    { icon: 'compare_arrows', label: 'Compare side-by-side', desc: 'Shortlist up to 3 consultants' },
                                    { icon: 'calendar_month', label: 'Book instantly', desc: 'Schedule consultations in minutes' },
                                ].map((f) => (
                                    <div key={f.icon} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <span className="material-symbols-outlined text-primary text-[22px]">{f.icon}</span>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">{f.label}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
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
                            Frequently Asked Questions
                        </h2>
                        <div className="flex flex-col gap-4">
                            {[
                                {
                                    q: `How do I find a trusted immigration consultant in ${city.fullName}?`,
                                    a: `Use Immizy to browse verified consultants in ${city.fullName}. Every listed professional has been manually vetted — you can see their credentials, specialisations, client reviews, and fee range before booking.`,
                                },
                                {
                                    q: `How much does an immigration consultant charge in ${city.fullName}?`,
                                    a: `Fees vary by consultant and visa type. Most ${city.fullName} consultants charge ₹15,000–₹80,000 for Canada PR or Australia applications. Immizy shows transparent pricing so you can compare before committing.`,
                                },
                                {
                                    q: `Can I consult online with an immigration consultant in ${city.fullName}?`,
                                    a: `Yes — Immizy supports video consultations. Many ${city.fullName} consultants offer both in-person and online meetings. You can book directly from their profile.`,
                                },
                            ].map(({ q, a }) => (
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
                            Ready to find your consultant in {city.fullName}?
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            Join thousands of applicants who found their verified consultant on Immizy.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to={`/find-professionals?location=${city.name}`}
                                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25"
                            >
                                <span className="material-symbols-outlined text-[20px]">search</span>
                                Find a Consultant
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

                {/* Other cities */}
                <section className="py-10 px-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-5xl mx-auto">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Other Cities</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.values(CITIES).filter(c => c.slug !== citySlug).map(c => (
                                <Link
                                    key={c.slug}
                                    to={`/immigration-consultant-${c.slug}`}
                                    className="text-sm px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors"
                                >
                                    {c.name}
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
