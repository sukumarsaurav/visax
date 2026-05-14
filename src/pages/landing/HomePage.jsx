import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { supabase } from '../../lib/supabase'

const features = [
    { icon: 'search', title: 'Find Experts', description: 'Browse verified immigration consultants and attorneys', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
    { icon: 'calendar_month', title: 'Book Consultations', description: 'Schedule appointments that fit your timeline', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' },
    { icon: 'folder_shared', title: 'Track Progress', description: 'Monitor your case status in real-time', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    { icon: 'verified_user', title: 'Verified Pros', description: 'All professionals are vetted and certified', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' }
]

const testimonials = [
    { name: 'Priya M.', role: 'Software Engineer', initials: 'PM', color: 'bg-violet-500', text: 'VisaX made our H-1B process incredibly smooth. Having everything in one place — documents, appointments, case tracking — was a game changer.' },
    { name: 'Carlos R.', role: 'Family Visa Applicant', initials: 'CR', color: 'bg-emerald-500', text: 'Found a consultant who spoke my language and understood my situation. Got my Green Card approved in record time. Highly recommend!' },
    { name: 'Sarah K.', role: 'International Student', initials: 'SK', color: 'bg-amber-500', text: 'The document tracking alone saved me weeks of stress. My consultant caught a missing form before submission — worth every penny.' },
]

const steps = [
    { number: 1, title: 'Create Your Profile', description: 'Sign up and tell us about your immigration needs' },
    { number: 2, title: 'Find a Professional', description: 'Browse and compare verified consultants' },
    { number: 3, title: 'Book a Consultation', description: 'Schedule a video call or in-person meeting' },
    { number: 4, title: 'Get Expert Guidance', description: 'Receive personalized advice for your journey' }
]

export default function HomePage() {
    const [featuredConsultant, setFeaturedConsultant] = useState(null)
    const [platformStats, setPlatformStats] = useState({ consultants: 0, avgRating: null, reviews: 0 })

    useEffect(() => {
        fetchHeroData()
    }, [])

    async function fetchHeroData() {
        // Run platform stats and featured consultant in parallel
        const [statsRes, consultantsRes] = await Promise.all([
            // Single RPC call replaces full reviews table scan
            supabase.rpc('get_platform_stats'),
            supabase
                .from('profiles')
                .select('id, full_name, avatar_url, role, specializations, years_experience')
                .in('role', ['individual', 'agency_admin'])
                .eq('application_status', 'approved')
                .limit(5),
        ])

        // Platform stats from pre-aggregated RPC
        const stats = statsRes.data
        if (stats) {
            setPlatformStats({
                consultants: stats.consultant_count || 0,
                avgRating: stats.avg_rating ? Number(stats.avg_rating).toFixed(1) : null,
                reviews: stats.total_reviews || 0,
            })
        }

        // Featured consultant: fetch pre-aggregated ratings for just these 5 profiles
        const consultants = consultantsRes.data || []
        if (consultants.length > 0) {
            const ids = consultants.map(c => c.id)
            const { data: ratings } = await supabase
                .from('consultant_rating_summary')
                .select('consultant_id, avg_rating, review_count')
                .in('consultant_id', ids)

            const ratingMap = Object.fromEntries(
                (ratings || []).map(r => [r.consultant_id, r])
            )

            let best = null
            let bestRating = 0
            for (const c of consultants) {
                const r = ratingMap[c.id]
                const avg = r ? Number(r.avg_rating) : 0
                if (avg > bestRating || !best) {
                    bestRating = avg
                    best = {
                        ...c,
                        rating: avg > 0 ? avg.toFixed(1) : null,
                        reviews: r?.review_count || 0,
                    }
                }
            }
            setFeaturedConsultant(best)
        }
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header — shared across all public pages */}
            <PublicHeader />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-slate-900 dark:via-background-dark dark:to-slate-800 py-20 md:py-32">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold w-fit">
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                {platformStats.consultants > 0
                                    ? `${platformStats.consultants}+ verified professionals`
                                    : 'Trusted by immigrants worldwide'}
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                Your Immigration Journey, <span className="text-primary">Simplified</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
                                Connect with verified immigration professionals, track your applications, and navigate the process with confidence.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <Link to="/find-professionals">
                                    <Button size="lg" icon="arrow_forward" iconPosition="right">
                                        Find a Professional
                                    </Button>
                                </Link>
                                <Link to="/professional-register">
                                    <Button size="lg" variant="outline">
                                        Register as a Professional
                                    </Button>
                                </Link>
                            </div>
                            {/* Trust indicators */}
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex -space-x-2">
                                    {[
                                        { bg: 'bg-violet-500', text: 'A' },
                                        { bg: 'bg-emerald-500', text: 'B' },
                                        { bg: 'bg-amber-500', text: 'C' },
                                        { bg: 'bg-rose-500', text: 'D' },
                                    ].map((av) => (
                                        <div key={av.text} className={`size-10 rounded-full border-2 border-white dark:border-slate-900 ${av.bg} flex items-center justify-center text-white text-xs font-bold`}>{av.text}</div>
                                    ))}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <StarRating rating={parseFloat(platformStats.avgRating) || 5} />
                                    <span className="font-semibold text-slate-900 dark:text-white">{platformStats.avgRating || '5.0'}/5</span> from {platformStats.reviews > 0 ? `${platformStats.reviews}+` : '100+'} reviews
                                </div>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                                {featuredConsultant ? (
                                    <>
                                        <div className="flex items-center gap-4 mb-6">
                                            <Avatar src={featuredConsultant.avatar_url} alt={featuredConsultant.full_name} size="lg" />
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">{featuredConsultant.full_name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {featuredConsultant.specializations?.[0] || 'Immigration Consultant'}
                                                </p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary ml-auto">verified</span>
                                        </div>
                                        {featuredConsultant.rating && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="material-symbols-outlined text-amber-500 text-[18px]">star</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">{featuredConsultant.rating}</span>
                                                <span className="text-slate-500 text-sm">({featuredConsultant.reviews} reviews)</span>
                                            </div>
                                        )}
                                        <Link to={`/consultant/${featuredConsultant.id}`}>
                                            <Button className="w-full" icon="calendar_month">Book Consultation</Button>
                                        </Link>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                                                <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                                            </div>
                                        </div>
                                        <Link to="/find-professionals">
                                            <Button className="w-full" icon="search">Find a Professional</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                            Everything You Need for Your Immigration Journey
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We provide all the tools and resources to make your immigration process seamless and stress-free.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="group flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                                <div className={`size-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110`}>
                                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-background-dark">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Get started in just a few simple steps.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="relative">
                                <div className="flex flex-col items-center text-center">
                                    <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-primary/30">
                                        {step.number}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                                </div>
                                {step.number < 4 && (
                                    <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/register">
                            <Button size="lg" icon="arrow_forward" iconPosition="right">
                                Get Started Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                            Stories from Our Community
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Real people, real results. See what our clients say about their experience.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t) => (
                            <div key={t.name} className="flex flex-col gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => (
                                        <span key={i} className="material-symbols-outlined material-filled text-amber-400 text-[18px]">star</span>
                                    ))}
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed flex-1">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <div className={`size-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>{t.initials}</div>
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

            {/* CTA Section */}
            <section className="relative py-20 bg-primary overflow-hidden">
                {/* Subtle dot-grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative max-w-[1200px] mx-auto px-6 md:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                        Join thousands of satisfied clients who have successfully navigated their immigration process with our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100">
                                Create Free Account
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}
