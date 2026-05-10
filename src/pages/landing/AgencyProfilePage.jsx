import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'

const agency = {
    id: 1,
    name: 'Global Horizon Immigration',
    subtitle: 'Full-Service Immigration Firm',
    verified: true,
    badge: 'Top Rated Agency',
    location: 'New York, NY (HQ)',
    consultantCount: 15,
    rating: 4.8,
    reviews: 2124,
    about: `Global Horizon Immigration is a premier consultancy firm dedicated to helping individuals, families, and businesses navigate the complex global immigration landscape. Founded in 2010, we have grown into a team of dedicated specialists covering every aspect of immigration law.

Our collective expertise spans family-based petitions, corporate relocation, investment visas, and asylum cases. With a 98% success rate across thousands of applications, we pride ourselves on transparency, efficiency, and a personalized approach for every client, regardless of which consultant you work with.`,
    languages: ['🇺🇸 English', '🇪🇸 Spanish', '🇧🇷 Portuguese', '🇨🇳 Chinese', '🇫🇷 French'],
    consultants: [
        {
            id: 1,
            name: 'Elena Rodriguez',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsCW7sU5ce60gnVGSiVRrXnO3-lrWT1DRHOOxUwpHNxj7xjofBe6xF9tBVEDStMTlfgAXanBQFmBY-Y09_2qQ04wF4yW-vMWmdUYJfujrllg7zIuMAyUsWgOnFok2DNAOA_Fi82VV09i05CY3TlRobx2Ju9t5-xIkgwEPhrgvRVOWSHg-vsIZcna4GhzIqqARBLtXVCjy4YUaeb13Sr2pLsZKde9jBtOq15gtcW2jRR0MbyQEf3N2MiG4j8X5DRQMM-8GMUgCFW00',
            role: 'Senior Partner',
            specialty: 'Family & Marriage Visas',
            rating: 4.9
        },
        {
            id: 2,
            name: 'David Chen',
            initials: 'DC',
            initialsColor: 'blue',
            role: 'Corporate Lead',
            specialty: 'H-1B & Employment Visas',
            rating: 4.8
        },
        {
            id: 3,
            name: 'Sarah Miller',
            initials: 'SM',
            initialsColor: 'purple',
            role: 'Consultant',
            specialty: 'Student & Exchange Visas',
            rating: 4.7
        },
        {
            id: 4,
            name: 'Rajesh Jain',
            initials: 'RJ',
            initialsColor: 'green',
            role: 'Attorney',
            specialty: 'Investment & Startup Visas',
            rating: 5.0
        }
    ],
    services: [
        { icon: 'family_restroom', title: 'Family Immigration', description: 'Spouse visas, fiancé visas (K-1), and family reunification petitions.', color: 'blue' },
        { icon: 'work', title: 'Employment Visas', description: 'Expert guidance on H-1B, L-1 transfers, and EB-1/EB-2 exceptional ability visas.', color: 'green' },
        { icon: 'school', title: 'Student & Intern', description: 'F-1 student visas, OPT applications, and J-1 exchange visitor programs.', color: 'purple' },
        { icon: 'gavel', title: 'Citizenship & Naturalization', description: 'Assistance with N-400 forms, interview prep, and civics test coaching.', color: 'amber' }
    ],
    ratings: {
        overall: 4.8,
        quality: 4.9,
        speed: 4.7,
        value: 4.8
    },
    reviewsList: [
        {
            id: 1,
            name: 'Carlos M.',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJyXBigb7pPhF6ifIgZqDPLXKpdEVXJe-mmYUXFuACqT14P12dxELDOVlL0j3yu1-PD1w00W_Z1SJTURRnBAKZ-M4ZAY_Cve777dQ3QUXQBxtKfKopUbtiuj9PMOlPjQg_QtFbyfrhfm_9jpP-tOKc42wmvmpfC0EFdj7OisHxWY24us4hxmQxU8k1lzwuZ_QgyCb36GWzuJRX1uh1dG1ODZGV9z2G_zcGmbr5i3E64R9E2jdgUNCROQhfoePVlG3SfFUyGwcir58',
            service: 'Family Visa Consultation',
            consultant: 'Elena Rodriguez',
            date: '2 weeks ago',
            rating: 5,
            text: '"The agency assigned Elena to my case, and she was incredibly helpful. She explained the entire process in Spanish, which made my parents feel very comfortable."'
        },
        {
            id: 2,
            name: 'Sarah Jenkins',
            initials: 'SJ',
            service: 'H-1B Visa Support',
            consultant: 'David Chen',
            date: '1 month ago',
            rating: 4.5,
            text: '"Professional and direct. The team spotted an issue in my initial application that could have caused a denial. Worth every penny."'
        }
    ],
    hourlyRate: 150,
    availableSlots: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:00 PM', '5:00 PM'],
    disabledSlots: ['4:00 PM']
}

export default function AgencyProfilePage() {
    const { id } = useParams()
    const [selectedConsultant, setSelectedConsultant] = useState('')
    const [selectedDate, setSelectedDate] = useState('2024-01-15')
    const [selectedSlot, setSelectedSlot] = useState('10:30 AM')
    const [meetingType, setMeetingType] = useState('video')

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
            purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
            amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        }
        return colors[color] || colors.blue
    }

    const getInitialsColor = (color) => {
        const colors = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        }
        return colors[color] || colors.blue
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <PublicHeader />

            <main className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[1280px] px-4 md:px-8 py-8 md:py-12">
                    {/* Breadcrumb */}
                    <nav className="flex mb-8 text-sm text-slate-500 dark:text-slate-400">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/find-professionals" className="hover:text-primary transition-colors">Find a Pro</Link>
                        <span className="mx-2">/</span>
                        <Link to="/agencies" className="hover:text-primary transition-colors">Immigration Agencies</Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white font-medium">{agency.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Agency Header Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex gap-3">
                                    <button className="size-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Share Profile">
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                    </button>
                                    <button className="size-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Save to Favorites">
                                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                    <div className="relative shrink-0">
                                        <div className="size-32 md:size-40 rounded-xl bg-slate-100 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                                            <span className="material-symbols-outlined text-6xl text-slate-400">apartment</span>
                                        </div>
                                        {agency.verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-slate-600">
                                                <span className="material-symbols-outlined text-primary text-[24px]" title="Verified Agency">verified</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{agency.name}</h1>
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">{agency.badge}</span>
                                        </div>

                                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-3">{agency.subtitle}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                {agency.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px]">groups</span>
                                                {agency.consultantCount} Consultants
                                            </div>
                                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-medium">
                                                <span className="material-symbols-outlined text-[18px]">star</span>
                                                {agency.rating} ({agency.reviews.toLocaleString()} Reviews)
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">language</span>
                                                Agency Website
                                            </a>
                                            <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">call</span>
                                                Contact Office
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About The Agency</h3>
                                <div className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                                    {agency.about.split('\n\n').map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Languages Supported by Team</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {agency.languages.map((lang) => (
                                            <span key={lang} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Consultants Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Immigration Consultants</h3>
                                    <a href="#" className="text-primary font-medium text-sm hover:underline">View all {agency.consultantCount} consultants</a>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agency.consultants.map((consultant) => (
                                        <div key={consultant.id} className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                                            {consultant.avatar ? (
                                                <img
                                                    className="size-16 rounded-full object-cover border-2 border-white dark:border-slate-600 shadow-sm shrink-0"
                                                    src={consultant.avatar}
                                                    alt={consultant.name}
                                                />
                                            ) : (
                                                <div className={`size-16 rounded-full flex items-center justify-center font-bold text-xl shrink-0 ${getInitialsColor(consultant.initialsColor)}`}>
                                                    {consultant.initials}
                                                </div>
                                            )}
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{consultant.name}</h4>
                                                        <p className="text-xs text-primary font-medium mb-0.5">{consultant.role}</p>
                                                        <p className="text-xs text-slate-500 truncate">{consultant.specialty}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{consultant.rating}</span>
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/consultant/${consultant.id}`}
                                                    className="mt-3 w-full py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors text-center"
                                                >
                                                    Book Consultation
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Agency Services</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {agency.services.map((service) => (
                                        <div key={service.title} className="flex gap-4">
                                            <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${getColorClasses(service.color)}`}>
                                                <span className="material-symbols-outlined">{service.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{service.title}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{service.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Client Reviews</h3>
                                    <a href="#" className="text-primary font-medium text-sm hover:underline">View all {agency.reviews.toLocaleString()} reviews</a>
                                </div>

                                {/* Rating Summary */}
                                <div className="flex items-center gap-6 mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                                    <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                                        <div className="text-3xl font-black text-slate-900 dark:text-white">{agency.ratings.overall}</div>
                                        <div className="flex text-amber-500 text-sm my-1 justify-center">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[16px]">
                                                    {i < Math.floor(agency.ratings.overall) ? 'star' : i < agency.ratings.overall ? 'star_half' : 'star_border'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-500">Agency Rating</div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {Object.entries(agency.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="w-12 capitalize">{key}</span>
                                                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${(value / 5) * 100}%` }}></div>
                                                </div>
                                                <span className="font-bold">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reviews List */}
                                <div className="space-y-6">
                                    {agency.reviewsList.map((review) => (
                                        <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    {review.avatar ? (
                                                        <img className="size-10 rounded-full object-cover" src={review.avatar} alt={review.name} />
                                                    ) : (
                                                        <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                                            {review.initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">{review.name}</h4>
                                                        <p className="text-xs text-slate-500">
                                                            {review.service} with <span className="text-primary">{review.consultant}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-400">{review.date}</div>
                                            </div>
                                            <div className="flex text-amber-500 text-xs mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="material-symbols-outlined text-[14px]">
                                                        {i < Math.floor(review.rating) ? 'star' : i < review.rating ? 'star_half' : 'star_border'}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-24 flex flex-col gap-6">
                                {/* Booking Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                                    <div className="bg-primary p-4 text-center">
                                        <h3 className="text-white font-bold text-lg">Book with {agency.name.split(' ')[0]}</h3>
                                        <p className="text-white/80 text-sm">First 15 mins free for new clients</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">${agency.hourlyRate}</span>
                                            <span className="text-slate-500 dark:text-slate-400 mb-1.5">/ hour (Standard)</span>
                                        </div>

                                        {/* Consultant Selection */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Select Consultant</label>
                                            <select
                                                value={selectedConsultant}
                                                onChange={(e) => setSelectedConsultant(e.target.value)}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                                            >
                                                <option value="">Any Available (Earliest)</option>
                                                {agency.consultants.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-slate-500 mt-1">Specific consultants may have different rates.</p>
                                        </div>

                                        {/* Date Selection */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Select Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                                            />
                                        </div>

                                        {/* Time Slots */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Available Slots</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {agency.availableSlots.map((slot) => {
                                                    const isDisabled = agency.disabledSlots.includes(slot)
                                                    const isSelected = selectedSlot === slot
                                                    return (
                                                        <button
                                                            key={slot}
                                                            onClick={() => !isDisabled && setSelectedSlot(slot)}
                                                            disabled={isDisabled}
                                                            className={`px-2 py-2 rounded-lg border text-sm transition-colors ${isDisabled
                                                                    ? 'border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400'
                                                                    : isSelected
                                                                        ? 'border-primary bg-primary/10 text-primary font-bold'
                                                                        : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                                }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Meeting Type */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Meeting Type</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { value: 'video', icon: 'videocam', label: 'Video Call (Zoom)' },
                                                    { value: 'phone', icon: 'call', label: 'Phone Call' },
                                                    { value: 'inperson', icon: 'storefront', label: 'In-Person (HQ)' }
                                                ].map((type) => (
                                                    <label
                                                        key={type.value}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${meetingType === type.value
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="meeting_type"
                                                            value={type.value}
                                                            checked={meetingType === type.value}
                                                            onChange={(e) => setMeetingType(e.target.value)}
                                                            className="text-primary focus:ring-primary"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <span className={`material-symbols-outlined text-[20px] ${meetingType === type.value ? 'text-primary' : 'text-slate-500'}`}>
                                                                {type.icon}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{type.label}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <Button className="w-full shadow-lg shadow-primary/30">
                                            Confirm Booking
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                            Payments secured by Stripe
                                        </div>
                                    </div>
                                </div>

                                {/* Fast Response Badge */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">bolt</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Fast Agency Response</h4>
                                            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">
                                                Our front desk usually responds within 1 hour to assign consultants.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 px-4">
                    <div className="max-w-[800px] mx-auto text-center flex flex-col items-center gap-6">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-primary text-[32px]">contact_support</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Have questions about the agency?</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                            Not sure which consultant to choose? Send us a general inquiry and our intake team will match you with the best expert for your case.
                        </p>
                        <Button variant="outline" size="lg">Contact Agency</Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
