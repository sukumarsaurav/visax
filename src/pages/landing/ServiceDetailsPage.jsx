import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { supabase } from '../../lib/supabase'

const PROCESS_STEPS = [
    { step: 1, title: 'Select a Provider', description: 'Choose a verified attorney or agency from our list.' },
    { step: 2, title: 'Upload Documents', description: 'Securely upload your documents and background info.' },
    { step: 3, title: 'Review & Consult', description: 'Professional reviews your case and provides guidance.' },
    { step: 4, title: 'Track Progress', description: 'Receive updates throughout the process.' },
]

export default function ServiceDetailsPage() {
    const { serviceId } = useParams()
    const [activeTab, setActiveTab] = useState('overview')
    const [openFaq, setOpenFaq] = useState(null)

    const [service, setService] = useState(null)
    const [provider, setProvider] = useState(null)
    const [reviews, setReviews] = useState([])
    const [relatedServices, setRelatedServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        if (!serviceId) return
        fetchServiceData()
    }, [serviceId])

    async function fetchServiceData() {
        setLoading(true)

        const { data: svc } = await supabase
            .from('services')
            .select(`
                *,
                provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, bio, languages, years_experience, specializations, role)
            `)
            .eq('id', serviceId)
            .single()

        if (!svc) {
            setNotFound(true)
            setLoading(false)
            return
        }

        setService(svc)
        setProvider(svc.provider)

        // Fetch reviews for the provider
        const { data: revs } = await supabase
            .from('reviews')
            .select(`
                id, rating, comment, created_at, is_anonymous,
                reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)
            `)
            .eq('consultant_id', svc.provider_id)
            .order('created_at', { ascending: false })
            .limit(3)
        setReviews(revs || [])

        // Fetch related services (same category, different service)
        const { data: related } = await supabase
            .from('services')
            .select(`
                id, title, price, category,
                provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, years_experience)
            `)
            .eq('is_active', true)
            .eq('category', svc.category || '')
            .neq('id', serviceId)
            .limit(3)
        setRelatedServices(related || [])

        setLoading(false)
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'process', label: 'Process' },
        { id: 'reviews', label: 'Reviews' },
    ]

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
                <PublicHeader />
                <div className="mx-auto max-w-5xl px-4 md:px-10 py-12 space-y-6">
                    <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
                <Footer />
            </div>
        )
    }

    if (notFound || !service) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
                <PublicHeader />
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                    <span className="material-symbols-outlined text-[64px]">search_off</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">Service not found</p>
                    <Link to="/services"><Button>Browse Services</Button></Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1">
                <div className="mx-auto max-w-5xl px-4 md:px-10 py-5">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 py-2 mb-4 text-sm">
                        <Link to="/" className="text-slate-500 hover:text-primary font-medium">Home</Link>
                        <span className="text-slate-400">/</span>
                        <Link to="/services" className="text-slate-500 hover:text-primary font-medium">Services</Link>
                        {service.category && (
                            <>
                                <span className="text-slate-400">/</span>
                                <span className="text-slate-500 font-medium">{service.category}</span>
                            </>
                        )}
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-900 dark:text-white font-medium line-clamp-1">{service.title}</span>
                    </div>

                    {/* Hero */}
                    <div className="flex flex-col gap-6 py-8 md:flex-row">
                        <div className="w-full aspect-video md:w-1/2 bg-gradient-to-br from-primary/20 to-blue-100 dark:from-primary/10 dark:to-slate-800 rounded-xl shadow-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[80px] text-primary/40">description</span>
                        </div>
                        <div className="flex flex-col gap-5 md:w-1/2 md:justify-center">
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    {service.category && (
                                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded">{service.category}</span>
                                    )}
                                    <span className="flex items-center text-xs text-green-600 font-medium">
                                        <span className="material-symbols-outlined text-[16px] mr-1">verified</span>
                                        Verified Provider
                                    </span>
                                </div>
                                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                                    {service.title}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                    {service.description}
                                </p>
                                {avgRating && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map(i => {
                                                const filled = avgRating >= i
                                                const half = !filled && avgRating >= i - 0.5
                                                return (
                                                    <span key={i} className={`material-symbols-outlined text-[18px] ${filled || half ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                                                        style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        {half ? 'star_half' : 'star'}
                                                    </span>
                                                )
                                            })}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{avgRating}</span>
                                        <span className="text-sm text-slate-500">({reviews.length} reviews)</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4">
                                {provider && (
                                    <Link to={provider.role === 'agency_admin' ? `/agency/${provider.id}` : `/consultant/${provider.id}`}>
                                        <Button size="lg" icon="arrow_forward" iconPosition="right">
                                            Book This Service
                                        </Button>
                                    </Link>
                                )}
                                <Link to="/find-professionals">
                                    <Button variant="outline" size="lg">View All Providers</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="sticky top-16 z-40 bg-slate-50 dark:bg-slate-950 pt-2 pb-1">
                        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 gap-8">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center justify-center pb-3 pt-4 min-w-fit border-b-[3px] transition-colors ${activeTab === tab.id
                                        ? 'border-b-primary text-slate-900 dark:text-white'
                                        : 'border-b-transparent text-slate-500 hover:text-primary'
                                    }`}
                                >
                                    <span className="text-sm font-bold">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-12 py-8">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <>
                                {/* Provider */}
                                {provider && (
                                    <section>
                                        <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">Service Provider</h2>
                                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                            <div className="flex gap-4 items-start">
                                                <Avatar src={provider.avatar_url} alt={provider.full_name} size="xl" />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{provider.full_name}</h3>
                                                    <p className="text-sm text-slate-500 mt-1 capitalize">{provider.role === 'agency_admin' ? 'Agency' : 'Consultant'}</p>
                                                    {provider.years_experience && (
                                                        <p className="text-xs text-slate-500 mt-1">{provider.years_experience} years experience</p>
                                                    )}
                                                    {provider.languages?.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {provider.languages.map(l => (
                                                                <span key={l} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">{l}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {provider.bio && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 line-clamp-3">{provider.bio}</p>
                                                    )}
                                                    <div className="mt-4 flex gap-3">
                                                        <Link to={provider.role === 'agency_admin' ? `/agency/${provider.id}` : `/consultant/${provider.id}`}>
                                                            <Button size="sm">Book Consultation</Button>
                                                        </Link>
                                                        <Link to={provider.role === 'agency_admin' ? `/agency/${provider.id}` : `/consultant/${provider.id}`}>
                                                            <Button size="sm" variant="outline">View Profile</Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                                {service.price && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400">From</p>
                                                        <p className="text-2xl font-black text-slate-900 dark:text-white">${service.price}</p>
                                                        <p className="text-xs text-slate-500">/hr</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {/* Expertise Areas */}
                                {service.expertise_areas?.length > 0 && (
                                    <section>
                                        <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-4">Expertise Areas</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {service.expertise_areas.map(area => (
                                                <span key={area} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">{area}</span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Pricing */}
                                {service.price && (
                                    <section>
                                        <div className="bg-blue-50 dark:bg-slate-800/50 rounded-xl p-6 border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Service Rate</h3>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm">
                                                    Starting at <span className="font-bold text-primary">${service.price}/hr</span>
                                                    {service.duration_minutes && ` · ${service.duration_minutes} min sessions`}
                                                </p>
                                            </div>
                                            {provider && (
                                                <Link to={provider.role === 'agency_admin' ? `/agency/${provider.id}` : `/consultant/${provider.id}`}>
                                                    <Button size="sm">Book Now</Button>
                                                </Link>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* Related Services */}
                                {relatedServices.length > 0 && (
                                    <section>
                                        <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">Related Services</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {relatedServices.map(rel => (
                                                <Link key={rel.id} to={`/services/${rel.id}`}
                                                    className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{rel.title}</h4>
                                                    {rel.provider?.full_name && (
                                                        <p className="text-xs text-slate-500 mb-2">by {rel.provider.full_name}</p>
                                                    )}
                                                    {rel.price && (
                                                        <p className="text-sm font-bold text-primary">${rel.price}/hr</p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}

                        {/* Process Tab */}
                        {activeTab === 'process' && (
                            <section>
                                <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">How It Works</h2>
                                <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="hidden md:block absolute top-[80px] left-12 right-12 h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                                        {PROCESS_STEPS.map((step, idx) => (
                                            <div key={step.step} className="flex flex-col md:items-center md:text-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 shadow-md ${idx === 0
                                                    ? 'bg-primary text-white border-white dark:border-slate-900'
                                                    : 'bg-white dark:bg-slate-800 border-primary text-primary'
                                                }`}>
                                                    {step.step}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">{step.title}</h4>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-slate-900 dark:text-white text-xl font-bold">Client Reviews</h2>
                                    {avgRating && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-slate-900 dark:text-white">{avgRating}</span>
                                            <div className="flex text-amber-400">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <span key={i} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: i <= Math.floor(avgRating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {reviews.length === 0 ? (
                                    <p className="text-slate-400 italic text-sm">No reviews for this provider yet.</p>
                                ) : (
                                    <div className="space-y-6">
                                        {reviews.map(review => (
                                            <div key={review.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        {review.is_anonymous || !review.reviewer ? (
                                                            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                                                            </div>
                                                        ) : (
                                                            <Avatar src={review.reviewer.avatar_url} alt={review.reviewer.full_name} size="sm" />
                                                        )}
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                                {review.is_anonymous ? 'Anonymous' : review.reviewer?.full_name || 'Client'}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="flex text-amber-400 text-sm">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <span key={i} className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: i <= review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {/* CTA */}
                        <section className="mt-4 mb-12">
                            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                <div className="relative z-10 max-w-2xl mx-auto">
                                    <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                                    <p className="text-blue-100 mb-8 text-lg">Connect with a verified professional today and get your application moving.</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        {provider && (
                                            <Link to={provider.role === 'agency_admin' ? `/agency/${provider.id}` : `/consultant/${provider.id}`}
                                                className="bg-white text-primary hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                                                Book with {provider.full_name.split(' ')[0]}
                                            </Link>
                                        )}
                                        <Link to="/find-professionals"
                                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg transition-colors">
                                            Browse All Professionals
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
