import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'

const professionals = [
    // Individual Consultant (Independent Professional)
    {
        id: 1,
        name: 'Elena Rodriguez',
        title: 'Immigration Attorney',
        type: 'individual',
        typeLabel: 'Individual Consultant',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsCW7sU5ce60gnVGSiVRrXnO3-lrWT1DRHOOxUwpHNxj7xjofBe6xF9tBVEDStMTlfgAXanBQFmBY-Y09_2qQ04wF4yW-vMWmdUYJfujrllg7zIuMAyUsWgOnFok2DNAOA_Fi82VV09i05CY3TlRobx2Ju9t5-xIkgwEPhrgvRVOWSHg-vsIZcna4GhzIqqARBLtXVCjy4YUaeb13Sr2pLsZKde9jBtOq15gtcW2jRR0MbyQEf3N2MiG4j8X5DRQMM-8GMUgCFW00',
        rating: 4.9,
        reviews: 120,
        verified: true,
        specialties: ['Green Card', 'H1B', 'Citizenship'],
        languages: ['English', 'Spanish'],
        rate: 150,
        rateType: '/hr',
        link: '/consultant/1'
    },
    // Agency (Full Immigration Firm)
    {
        id: 2,
        name: 'Global Horizon Immigration',
        title: 'Full-Service Immigration Firm',
        type: 'agency',
        typeLabel: 'Agency',
        isAgency: true,
        rating: 4.8,
        reviews: 2124,
        verified: true,
        specialties: ['Family Visa', 'Employment', 'Citizenship'],
        languages: ['English', 'Spanish', 'Chinese'],
        rate: 150,
        rateType: '/hr',
        consultantCount: 15,
        link: '/agency/1'
    },
    // Agency Member (Consultant working for an agency)
    {
        id: 3,
        name: 'Michael Chen',
        title: 'Visa Consultant',
        type: 'agency_member',
        typeLabel: 'Agency Member',
        agencyName: 'Global Horizon Immigration',
        agencyId: 1,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkmXbz8U_hsJSpVpLWiX7Z2kbsfSVO8Z7CRtBA29QxSsuFwM8e4oLXFJyTkAoc21Y0_LdoVmdyg6DHBIhJtCex0CWN5rWpn4osP-xYBTLXID9nfMpmw3mU3drrdslK_mJDsjQrHtq4DuXlcvr-oixo6uMKNCecC7KuLaxNdRVOGNQtkEOtczcXKcLSbNfvJiEKzu5U02xYiSIV3gjy-00uZCUQ-hLMYN0mxEXx0k5TdR_Zbc9Qpfv2PU4iYTLtse_6dSUM5CN8AZY',
        rating: 4.8,
        reviews: 85,
        verified: true,
        specialties: ['Student Visa', 'Work Permit'],
        languages: ['English', 'Mandarin'],
        rate: 80,
        rateType: '/hr',
        link: '/consultant/3'
    },
    // Another Individual Consultant
    {
        id: 4,
        name: 'Sarah Okafor',
        title: 'Legal Translator',
        type: 'individual',
        typeLabel: 'Individual Consultant',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlWPE_9cLdHz-KySc-DvP_rARbo5dJ7n-Jguql2m588Hjy7w1Z_xn79OMd5iLaidpop056KfxFCWA_0HsNC8BS2X1QjHqj3zpiJiRj_prEI15dRYgJNL2usQl05cnqtS2GRcb6qRB4yVjjoYK5BAu9YIlHIOKJvn0XPcV3ptMc-oNisZuO7m1r-Ptr-MLJOsU9ruZVxpUa5vaj6T3q-2_Es44Akj7WV_p4u4TMcIvfXSCwTewQdVejY6GFw8xFQCARoWI0ihSBWVo',
        rating: 5.0,
        reviews: 42,
        verified: true,
        specialties: ['Legal Docs', 'Notary'],
        languages: ['English', 'French', 'Igbo'],
        rate: 45,
        rateType: '/pg',
        link: '/consultant/4'
    },
    // Agency with Instant Book Feature
    {
        id: 5,
        name: 'Beacon Immigration Group',
        title: 'Family & Employment Specialists',
        type: 'agency',
        typeLabel: 'Agency',
        isAgency: true,
        rating: 4.9,
        reviews: 856,
        verified: true,
        specialties: ['Family Visa', 'H1B', 'Green Card'],
        languages: ['English', 'Spanish', 'Portuguese'],
        rate: 175,
        rateType: '/hr',
        consultantCount: 8,
        link: '/agency/2',
        instantBook: true
    },
    // Another Agency Member
    {
        id: 6,
        name: 'David Kim',
        title: 'Asylum Expert',
        type: 'agency_member',
        typeLabel: 'Agency Member',
        agencyName: 'Beacon Immigration Group',
        agencyId: 2,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY8vX0d9SSan82WMTK-66vNk0tids0bKQO_WCP1GzCrV96_3X3rs9I0jEw-tCKuKsoDKTnB8i8o_wNwBavQf6Hj-7WhGBOkayrDNt95sI_rsc4B_djEjVMWXl7z2r8NCMPAKlp4wB-aZCEyUrvI7VCUdC-Pwhfhgnfs5J1gv7KSo3whHjiQxqRVYhVLEOyMHInVMXzkbosYWpsotJ2D2vWvAfkwLsHVlCL-pKArkArSrmgrbd6ClK7bfH1XAlvojy8aWYsX1LSwf0',
        rating: 4.7,
        reviews: 63,
        verified: true,
        specialties: ['Asylum', 'Refugee Status'],
        languages: ['English', 'Korean'],
        rate: 200,
        rateType: '/hr',
        link: '/consultant/6'
    }
]

const expertiseFilters = ['Immigration Lawyers', 'Visa Consultants', 'Translators', 'Notaries', 'Asylum Specialists']
const quickFilters = [
    { icon: 'gavel', label: 'Lawyers' },
    { icon: 'translate', label: 'Translators' },
    { icon: 'school', label: 'Student Visa' }
]

export default function FindProfessionalsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('Visa Consultants')
    const [availableToday, setAvailableToday] = useState(false)
    const [nextThreeDays, setNextThreeDays] = useState(false)
    const [selectedLanguages, setSelectedLanguages] = useState(['English'])

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <PublicHeader />

            {/* Hero Section */}
            <section
                className="relative flex min-h-[500px] flex-col gap-6 items-center justify-center p-8 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtTz8FJSVsCQFIIl9WQfq1woWZK5pDXdiW8FM46V7pQTQNlKsEuUXsQKGvx2oh6os52Dw06XyJuBaGlMSr_6vH71vVLfzlxy_b0GmmdSU9IDDa17ultn1-2FcA7PBc7ZdAsRGhdN1t4LJZD40tV74mVdI3wUW_Q7XTrNgtdEkARFnxlnsPN8E27hzueP0CCpEZbYhAGa4svp0d_atf3aLjHRDfdflVSusZOhXEzuxOpdGWaBPEKq01Gsa5vloRhNvBsxKoi1FXXws')`
                }}
            >
                <div className="flex flex-col gap-4 text-center max-w-[800px] z-10">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl lg:text-6xl drop-shadow-sm">
                        Navigate Your Journey with Trusted Experts
                    </h1>
                    <p className="text-slate-200 text-base font-normal leading-normal sm:text-lg max-w-[600px] mx-auto">
                        Connect with verified immigration lawyers, consultants, and translators who speak your language and understand your story.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-[640px] z-10 mt-4">
                    <label className="flex flex-col w-full h-14 md:h-16 relative shadow-xl">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden bg-white dark:bg-slate-800">
                            <div className="text-slate-400 flex items-center justify-center pl-4 bg-transparent">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-0 bg-transparent h-full placeholder:text-slate-400 px-4 text-sm font-medium leading-normal md:text-base"
                                placeholder="Try 'H1B Visa Lawyer' or 'Spanish Translator'..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="flex items-center justify-center pr-2 bg-transparent">
                                <Button className="md:h-12">Search</Button>
                            </div>
                        </div>
                    </label>
                </div>

                {/* Quick Filter Chips */}
                <div className="flex gap-2 flex-wrap justify-center z-10 mt-2">
                    {quickFilters.map((filter) => (
                        <button
                            key={filter.label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-medium transition-colors border border-white/20"
                        >
                            <span className="material-symbols-outlined text-[18px]">{filter.icon}</span>
                            {filter.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-10">
                {/* Expertise Filters */}
                <div className="mb-10">
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-4">
                        Filter by Expertise
                    </h3>
                    <div className="flex gap-3 flex-wrap">
                        {expertiseFilters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer transition-all ${selectedFilter === filter
                                    ? 'bg-primary text-white border border-primary shadow-md shadow-primary/20'
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/30'
                                    }`}
                            >
                                <span className={`text-sm font-medium ${selectedFilter === filter ? '' : 'text-slate-900 dark:text-slate-200 group-hover:text-primary'}`}>
                                    {filter}
                                </span>
                                {selectedFilter === filter && (
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
                        {/* Availability */}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Availability</h4>
                            <label className="flex items-center gap-3 py-1 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={availableToday}
                                    onChange={(e) => setAvailableToday(e.target.checked)}
                                    className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                                    Available Today
                                </span>
                            </label>
                            <label className="flex items-center gap-3 py-1 cursor-pointer group mt-2">
                                <input
                                    type="checkbox"
                                    checked={nextThreeDays}
                                    onChange={(e) => setNextThreeDays(e.target.checked)}
                                    className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                                    Next 3 Days
                                </span>
                            </label>
                        </div>

                        {/* Languages */}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Languages</h4>
                            <div className="flex flex-col gap-2">
                                {['English', 'Spanish', 'Mandarin'].map((lang) => (
                                    <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedLanguages.includes(lang)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLanguages([...selectedLanguages, lang])
                                                } else {
                                                    setSelectedLanguages(selectedLanguages.filter(l => l !== lang))
                                                }
                                            }}
                                            className="size-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                            {lang}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Price Range</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                                />
                                <span className="text-slate-400">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-2 py-1.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none dark:text-white"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                                Top Rated Professionals
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
                                <select className="text-sm font-medium bg-transparent border-none text-primary cursor-pointer focus:ring-0 py-0 pl-0 pr-6">
                                    <option>Highest Rated</option>
                                    <option>Lowest Price</option>
                                    <option>Most Reviews</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {professionals.map((pro) => (
                                <Link
                                    key={pro.id}
                                    to={pro.link}
                                    className={`group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow duration-300 ${pro.instantBook
                                        ? 'border-primary ring-2 ring-primary/20 shadow-xl relative z-10'
                                        : 'border-slate-200 dark:border-slate-700'
                                        }`}
                                >
                                    {/* Type Badge + Instant Book Badge */}
                                    <div className={`px-5 py-2 flex items-center justify-between ${pro.type === 'individual' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                            pro.type === 'agency' ? 'bg-indigo-50 dark:bg-indigo-900/20' :
                                                'bg-purple-50 dark:bg-purple-900/20'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`material-symbols-outlined text-sm ${pro.type === 'individual' ? 'text-emerald-600' :
                                                    pro.type === 'agency' ? 'text-indigo-600' :
                                                        'text-purple-600'
                                                }`}>
                                                {pro.type === 'individual' ? 'person' : pro.type === 'agency' ? 'apartment' : 'badge'}
                                            </span>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${pro.type === 'individual' ? 'text-emerald-600' :
                                                    pro.type === 'agency' ? 'text-indigo-600' :
                                                        'text-purple-600'
                                                }`}>
                                                {pro.typeLabel}
                                            </span>
                                        </div>
                                        {pro.instantBook && (
                                            <div className="flex items-center gap-1 text-primary text-xs font-bold">
                                                <span className="material-symbols-outlined text-sm">schedule</span>
                                                Instant
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div className="relative">
                                                    {pro.isAgency ? (
                                                        <div className="size-14 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                                            <span className="material-symbols-outlined text-2xl text-slate-400">apartment</span>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            className="size-14 rounded-full object-cover border border-slate-100 dark:border-slate-600"
                                                            src={pro.avatar}
                                                            alt={pro.name}
                                                        />
                                                    )}
                                                    {pro.verified && (
                                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5">
                                                            <span className="material-symbols-outlined text-primary text-[18px]" title="Verified">verified</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{pro.name}</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{pro.title}</p>
                                                    {/* Agency Member - Show parent agency */}
                                                    {pro.type === 'agency_member' && (
                                                        <p className="text-xs text-primary font-medium mt-0.5">@ {pro.agencyName}</p>
                                                    )}
                                                    {/* Agency - Show consultant count */}
                                                    {pro.isAgency && (
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            <span className="material-symbols-outlined text-[12px] mr-1 align-text-top">groups</span>
                                                            {pro.consultantCount} Consultants
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400">
                                                <span className="material-symbols-outlined text-[16px]">star</span>
                                                <span className="text-xs font-bold">{pro.rating}</span>
                                                <span className="text-[10px] text-amber-600/70 dark:text-amber-500/70">({pro.reviews.toLocaleString()})</span>
                                            </div>
                                        </div>

                                        {!pro.instantBook && (
                                            <>
                                                <div className="flex flex-wrap gap-2">
                                                    {pro.specialties.map((spec) => (
                                                        <span key={spec} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    <span className="material-symbols-outlined text-[18px]">translate</span>
                                                    <span>{pro.languages.join(', ')}</span>
                                                </div>
                                            </>
                                        )}

                                        {pro.instantBook ? (
                                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Select Availability for Tomorrow</p>
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    <button className="px-1 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-primary hover:text-primary transition-colors">9:00 AM</button>
                                                    <button className="px-1 py-1.5 rounded border border-primary bg-primary/5 text-primary text-xs font-medium transition-colors">2:30 PM</button>
                                                    <button className="px-1 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium hover:border-primary hover:text-primary transition-colors">4:00 PM</button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                                        <span className="material-symbols-outlined text-[14px]">videocam</span> Video
                                                    </button>
                                                    <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded bg-primary text-white border border-primary">
                                                        <span className="material-symbols-outlined text-[14px]">check</span> Confirm
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {pro.isAgency ? 'Starting from' : 'Consultation'}
                                                    </p>
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        ${pro.rate}<span className="text-xs font-normal text-slate-500">{pro.rateType}</span>
                                                    </p>
                                                </div>
                                                <Button size="sm">
                                                    {pro.isAgency ? 'View Agency' : 'Book Now'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="mt-10 flex justify-center">
                            <button className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-900 dark:text-white">
                                Show More Professionals
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trust Section */}
                <div className="mt-20 py-12 px-6 bg-primary/5 dark:bg-slate-800/50 rounded-2xl flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-primary">star</span>
                            ))}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                            "Found a lawyer who spoke my dialect and helped me get my Green Card in record time."
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <div className="size-10 rounded-full bg-slate-300 overflow-hidden">
                                <img
                                    className="w-full h-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJyXBigb7pPhF6ifIgZqDPLXKpdEVXJe-mmYUXFuACqT14P12dxELDOVlL0j3yu1-PD1w00W_Z1SJTURRnBAKZ-M4ZAY_Cve777dQ3QUXQBxtKfKopUbtiuj9PMOlPjQg_QtFbyfrhfm_9jpP-tOKc42wmvmpfC0EFdj7OisHxWY24us4hxmQxU8k1lzwuZ_QgyCb36GWzuJRX1uh1dG1ODZGV9z2G_zcGmbr5i3E64R9E2jdgUNCROQhfoePVlG3SfFUyGwcir58"
                                    alt="Carlos M."
                                />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Carlos M.</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Verified User</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 max-w-sm">
                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-primary">
                                <span className="material-symbols-outlined">verified_user</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Vetted Professionals</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    We strictly verify licenses and credentials for every lawyer and consultant.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-600">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Secure Booking</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Your data is encrypted and payments are held in escrow until consultation.
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
