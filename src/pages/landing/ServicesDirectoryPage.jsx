import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'

const categories = ['All Services', 'Visa Applications', 'Citizenship', 'Asylum', 'Family Sponsorship', 'Business']

const featuredServices = [
    {
        id: 'f1-student-visa',
        title: 'F-1 Student Visa Consultation',
        description: 'Complete guidance for international students applying for US studies, including interview prep.',
        icon: 'school',
        iconColor: 'text-primary',
        iconBg: 'bg-primary/10',
        rating: 4.9,
        reviews: 342,
        popular: true,
        providersCount: 24
    },
    {
        id: 'h1b-visa',
        title: 'H-1B Specialty Occupation',
        description: 'Expert legal assistance for employers and employees navigating the H-1B visa process.',
        icon: 'work',
        iconColor: 'text-green-600',
        iconBg: 'bg-green-50',
        rating: 4.8,
        reviews: 189,
        popular: false,
        agency: 'Global Mobility Law Group'
    },
    {
        id: 'family-green-card',
        title: 'Family Green Card Petition',
        description: 'Reunite with your loved ones. Comprehensive filing service for immediate relatives.',
        icon: 'family_restroom',
        iconColor: 'text-purple-600',
        iconBg: 'bg-purple-50',
        rating: 4.9,
        reviews: 512,
        popular: false,
        providersCount: 8
    }
]

const allServices = [
    {
        id: 'asylum-defense',
        title: 'Asylum Application Defense',
        description: 'Representation in removal proceedings and affirmative asylum applications before USCIS.',
        icon: 'gavel',
        iconColor: 'text-orange-600',
        iconBg: 'bg-orange-50',
        rating: 4.7,
        badge: 'Legal Rep',
        availability: 'Available Immediately',
        languages: 'English, Spanish'
    },
    {
        id: 'document-translation',
        title: 'Document Translation Services',
        description: 'USCIS-certified translations for birth certificates, diplomas, and legal documents in 50+ languages.',
        icon: 'description',
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-50',
        rating: 5.0,
        badge: 'Certified',
        turnaround: '24hr Turnaround'
    },
    {
        id: 'eb5-investor',
        title: 'Investor Visa (EB-5) Consulting',
        description: 'Connect with specialized attorneys and regional centers for investment-based immigration.',
        icon: 'flight_takeoff',
        iconColor: 'text-red-600',
        iconBg: 'bg-red-50',
        rating: 4.9,
        agencies: 5
    },
    {
        id: 'citizenship-naturalization',
        title: 'Citizenship & Naturalization',
        description: 'Full support for N-400 applications, interview preparation, and civics test coaching.',
        icon: 'flag',
        iconColor: 'text-emerald-600',
        iconBg: 'bg-emerald-50',
        rating: 4.8,
        badge: 'Popular'
    }
]

const immigrationTypes = ['All Types', 'Work Visas', 'Family Sponsorship', 'Student Visas', 'Asylum', 'Business Immigration']
const languages = ['English', 'Spanish', 'Mandarin', 'Hindi', 'French', 'Arabic']

export default function ServicesDirectoryPage() {
    const [activeCategory, setActiveCategory] = useState('All Services')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTypes, setSelectedTypes] = useState(['All Types'])
    const [destination, setDestination] = useState('United States')

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1 flex flex-col">
                {/* Hero Search Section */}
                <section className="relative bg-slate-900 py-16 md:py-24">
                    <div className="absolute inset-0 z-0 opacity-30">
                        <img
                            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200"
                            alt="Background"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 md:px-10">
                        <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6 text-center">
                            <div className="flex flex-col gap-3">
                                <h1 className="text-4xl font-black leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                                    Find the Right Immigration<br className="hidden md:block" /> Help for Your Journey
                                </h1>
                                <p className="text-base font-medium text-slate-200 md:text-lg">
                                    Browse services offered by verified professionals and agencies tailored to your needs.
                                </p>
                            </div>
                            <div className="mx-auto flex w-full max-w-[600px] flex-col gap-2">
                                <div className="relative flex h-14 w-full items-center overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-primary md:h-16">
                                    <div className="flex h-full w-14 items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined">search</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search 'Student Visa', 'Green Card', 'Asylum'..."
                                        className="h-full flex-1 border-0 bg-transparent p-0 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 md:text-lg"
                                    />
                                    <div className="p-2">
                                        <button className="flex h-full items-center justify-center rounded-lg bg-primary px-6 text-base font-bold text-white hover:bg-blue-600 transition-colors">
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-10 lg:gap-12 lg:py-12">
                    {/* Sidebar Filters */}
                    <aside className="flex w-full flex-col gap-6 md:w-64 lg:w-72 md:shrink-0">
                        <div className="sticky top-24 flex flex-col gap-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                                <button className="text-sm font-medium text-primary hover:underline">Reset</button>
                            </div>

                            {/* Immigration Type */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Immigration Type</label>
                                <div className="flex flex-col gap-2">
                                    {immigrationTypes.slice(0, 4).map((type) => (
                                        <label key={type} className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.includes(type)}
                                                onChange={() => {
                                                    if (selectedTypes.includes(type)) {
                                                        setSelectedTypes(selectedTypes.filter(t => t !== type))
                                                    } else {
                                                        setSelectedTypes([...selectedTypes, type])
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            {/* Destination */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Destination</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">public</span>
                                    <select
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option>United States</option>
                                        <option>Canada</option>
                                        <option>United Kingdom</option>
                                        <option>Australia</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <hr className="border-slate-200 dark:border-slate-700" />

                            {/* Language */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Language</label>
                                <div className="flex flex-wrap gap-2">
                                    {languages.slice(0, 4).map((lang) => (
                                        <button key={lang} className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex flex-1 flex-col">
                        {/* Category Chips */}
                        <div className="mb-8 overflow-x-auto pb-2">
                            <div className="flex gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`whitespace-nowrap rounded-lg px-5 py-2 text-sm font-bold shadow-sm transition-colors ${activeCategory === category
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Featured Services */}
                        <div className="mb-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Featured Services</h2>
                                <a href="#" className="text-sm font-bold text-primary hover:underline">View All Featured</a>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {featuredServices.map((service) => (
                                    <div key={service.id} className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                                        {service.popular && (
                                            <div className="absolute right-0 top-0 rounded-bl-lg bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                                Popular
                                            </div>
                                        )}
                                        <div className="mb-4">
                                            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${service.iconBg} ${service.iconColor}`}>
                                                <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{service.title}</h3>
                                            <p className="mb-4 text-sm leading-relaxed text-slate-500">{service.description}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-lg text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{service.rating}</span>
                                                <span className="text-xs text-slate-500">({service.reviews} reviews)</span>
                                            </div>
                                        </div>
                                        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-4">
                                            {service.providersCount && (
                                                <div className="mb-3 flex items-center gap-2">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-200 ring-2 ring-white"></div>
                                                        <div className="w-6 h-6 rounded-full bg-slate-300 ring-2 ring-white"></div>
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-medium text-slate-500 ring-2 ring-white">+{service.providersCount}</div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">Verified Pros</span>
                                                </div>
                                            )}
                                            {service.agency && (
                                                <div className="mb-3">
                                                    <span className="text-xs text-slate-500">Offered by <span className="font-bold text-slate-900 dark:text-white">{service.agency}</span></span>
                                                </div>
                                            )}
                                            <Link
                                                to={`/services/${service.id}`}
                                                className="w-full block text-center rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-600"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All Services List */}
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">All Services</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span>Sort by:</span>
                                    <select className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-none">
                                        <option>Recommended</option>
                                        <option>Highest Rated</option>
                                        <option>Newest</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {allServices.map((service) => (
                                    <div key={service.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:shadow-md sm:flex-row sm:items-center">
                                        <div className={`flex shrink-0 items-center justify-center rounded-lg ${service.iconBg} p-3 ${service.iconColor} sm:h-16 sm:w-16`}>
                                            <span className="material-symbols-outlined text-3xl">{service.icon}</span>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.title}</h3>
                                                {service.badge && (
                                                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">{service.badge}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 line-clamp-2">{service.description}</p>
                                            <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500">
                                                {service.availability && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                                        {service.availability}
                                                    </span>
                                                )}
                                                {service.languages && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">translate</span>
                                                        {service.languages}
                                                    </span>
                                                )}
                                                {service.turnaround && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">bolt</span>
                                                        {service.turnaround}
                                                    </span>
                                                )}
                                                {service.agencies && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">group</span>
                                                        {service.agencies} Agencies
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-3 sm:w-40 sm:items-end">
                                            <div className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{service.rating}</span>
                                            </div>
                                            <Link
                                                to={`/services/${service.id}`}
                                                className="w-full rounded-lg bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 text-center"
                                            >
                                                See Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More */}
                            <div className="mt-4 flex justify-center">
                                <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700">
                                    Show More Services
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
