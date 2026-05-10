import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'

const consultant = {
    id: 1,
    name: 'Elena Rodriguez',
    title: 'Senior Immigration Attorney',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsCW7sU5ce60gnVGSiVRrXnO3-lrWT1DRHOOxUwpHNxj7xjofBe6xF9tBVEDStMTlfgAXanBQFmBY-Y09_2qQ04wF4yW-vMWmdUYJfujrllg7zIuMAyUsWgOnFok2DNAOA_Fi82VV09i05CY3TlRobx2Ju9t5-xIkgwEPhrgvRVOWSHg-vsIZcna4GhzIqqARBLtXVCjy4YUaeb13Sr2pLsZKde9jBtOq15gtcW2jRR0MbyQEf3N2MiG4j8X5DRQMM-8GMUgCFW00',
    verified: true,
    premium: true,
    location: 'New York, NY (Available Remote)',
    experience: '12 Years Experience',
    rating: 4.9,
    reviews: 124,
    hourlyRate: 150,
    agency: {
        id: 1,
        name: 'Beacon Immigration Group',
        rating: 4.8,
        totalReviews: 2100
    },
    bio: `I am a dedicated immigration attorney and partner at <strong>Beacon Immigration Group</strong>, with over a decade of experience helping individuals and families navigate the complex US immigration system. My practice focuses on family-based petitions, employment visas (H-1B, O-1, L-1), and citizenship applications.

As an immigrant myself, I understand the anxiety and uncertainty that comes with the process. My goal is to provide compassionate, clear, and effective legal representation to turn your American dream into reality. I have successfully handled over 500 cases with a 98% approval rate.`,
    languages: [
        { flag: '🇺🇸', name: 'English', level: 'Native' },
        { flag: '🇪🇸', name: 'Spanish', level: 'Fluent' },
        { flag: '🇧🇷', name: 'Portuguese', level: 'Conversational' }
    ],
    services: [
        { icon: 'family_restroom', title: 'Family Immigration', description: 'Spouse visas, fiancé visas (K-1), and family reunification petitions.', color: 'blue' },
        { icon: 'work', title: 'Employment Visas', description: 'Expert guidance on H-1B, L-1 transfers, and EB-1/EB-2 exceptional ability visas.', color: 'green' },
        { icon: 'school', title: 'Student & Intern', description: 'F-1 student visas, OPT applications, and J-1 exchange visitor programs.', color: 'purple' },
        { icon: 'gavel', title: 'Citizenship & Naturalization', description: 'Assistance with N-400 forms, interview prep, and civics test coaching.', color: 'amber' }
    ],
    ratings: {
        overall: 4.9,
        quality: 5.0,
        service: 4.8,
        value: 4.9
    },
    reviewsList: [
        {
            id: 1,
            name: 'Carlos M.',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJyXBigb7pPhF6ifIgZqDPLXKpdEVXJe-mmYUXFuACqT14P12dxELDOVlL0j3yu1-PD1w00W_Z1SJTURRnBAKZ-M4ZAY_Cve777dQ3QUXQBxtKfKopUbtiuj9PMOlPjQg_QtFbyfrhfm_9jpP-tOKc42wmvmpfC0EFdj7OisHxWY24us4hxmQxU8k1lzwuZ_QgyCb36GWzuJRX1uh1dG1ODZGV9z2G_zcGmbr5i3E64R9E2jdgUNCROQhfoePVlG3SfFUyGwcir58',
            service: 'Family Visa Consultation',
            date: '2 weeks ago',
            rating: 5,
            text: '"Elena was incredibly helpful. She explained the entire process in Spanish, which made my parents feel very comfortable. Highly recommend her for anyone needing family visa help!"'
        },
        {
            id: 2,
            name: 'Sarah Jenkins',
            initials: 'SJ',
            service: 'H-1B Visa Support',
            date: '1 month ago',
            rating: 4.5,
            text: '"Professional and direct. She spotted an issue in my initial application that could have caused a denial. Worth every penny for the peace of mind."'
        }
    ],
    availableSlots: ['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM', '4:00 PM', '5:00 PM'],
    disabledSlots: ['4:00 PM']
}

export default function ConsultantProfilePage() {
    const { id } = useParams()
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

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <PublicHeader />

            <main className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[1280px] px-4 md:px-8 py-8 md:py-12">
                    {/* Breadcrumb */}
                    <nav className="flex mb-8 text-sm text-slate-500 dark:text-slate-400 flex-wrap gap-y-2">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to="/find-professionals" className="hover:text-primary transition-colors">Find a Pro</Link>
                        <span className="mx-2">/</span>
                        <Link to="/agencies" className="hover:text-primary transition-colors">Agencies</Link>
                        <span className="mx-2">/</span>
                        <Link to={`/agency/${consultant.agency.id}`} className="hover:text-primary transition-colors font-medium text-slate-700 dark:text-slate-300">
                            {consultant.agency.name}
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white font-medium">{consultant.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Profile Header Card */}
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
                                        <img
                                            className="size-32 md:size-40 rounded-xl object-cover border-4 border-slate-50 dark:border-slate-700 shadow-md"
                                            src={consultant.avatar}
                                            alt={consultant.name}
                                        />
                                        {consultant.verified && (
                                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-slate-600">
                                                <span className="material-symbols-outlined text-primary text-[24px]" title="Verified Professional">verified</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{consultant.name}</h1>
                                            {consultant.premium && (
                                                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Premium</span>
                                            )}
                                        </div>

                                        {/* Agency Link */}
                                        <Link
                                            to={`/agency/${consultant.agency.id}`}
                                            className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors group w-fit"
                                        >
                                            <div className="size-5 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-[14px]">apartment</span>
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                                                {consultant.agency.name}
                                            </span>
                                            <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary transition-colors ml-1">arrow_forward</span>
                                        </Link>

                                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium mb-3">{consultant.title}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                {consultant.location}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px]">work_history</span>
                                                {consultant.experience}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-medium">
                                                <span className="material-symbols-outlined text-[18px]">star</span>
                                                {consultant.rating} ({consultant.reviews} Reviews)
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">language</span>
                                                Website
                                            </a>
                                            <a href="#" className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077b5] hover:bg-[#006097] rounded-lg text-sm font-medium text-white transition-colors">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                </svg>
                                                LinkedIn
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About Me</h3>
                                <div
                                    className="text-slate-600 dark:text-slate-300 leading-relaxed space-y-4"
                                    dangerouslySetInnerHTML={{ __html: consultant.bio.split('\n\n').map(p => `<p>${p}</p>`).join('') }}
                                />
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Languages Spoken</h4>
                                    <div className="flex gap-3 flex-wrap">
                                        {consultant.languages.map((lang) => (
                                            <span key={lang.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {lang.flag} {lang.name} ({lang.level})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Services & Expertise</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {consultant.services.map((service) => (
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
                                    <a href="#" className="text-primary font-medium text-sm hover:underline">View all {consultant.reviews} reviews</a>
                                </div>

                                {/* Rating Summary */}
                                <div className="flex items-center gap-6 mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                                    <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                                        <div className="text-3xl font-black text-slate-900 dark:text-white">{consultant.ratings.overall}</div>
                                        <div className="flex text-amber-500 text-sm my-1 justify-center">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[16px]">
                                                    {i < Math.floor(consultant.ratings.overall) ? 'star' : i < consultant.ratings.overall ? 'star_half' : 'star_border'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-xs text-slate-500">Overall Rating</div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {Object.entries(consultant.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
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
                                    {consultant.reviewsList.map((review) => (
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
                                                        <p className="text-xs text-slate-500">{review.service}</p>
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
                                {/* Agency Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 order-last md:order-first">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="size-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-800/30">
                                            <span className="material-symbols-outlined text-[24px]">apartment</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{consultant.agency.name}</h4>
                                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                                <span className="material-symbols-outlined text-[14px] text-amber-500 mr-1">star</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">{consultant.agency.rating}</span>
                                                ({(consultant.agency.totalReviews / 1000).toFixed(1)}k Reviews)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                        <p className="mb-2"><span className="font-bold">Part of an Agency?</span> Yes. {consultant.name.split(' ')[0]} is a senior partner at {consultant.agency.name.split(' ')[0]}.</p>
                                        <Link to={`/agency/${consultant.agency.id}`} className="text-primary hover:underline text-xs font-semibold">
                                            View Agency Profile & Staff →
                                        </Link>
                                    </div>
                                    <Link to={`/agency/${consultant.agency.id}`}>
                                        <Button variant="outline" className="w-full">Visit Agency Page</Button>
                                    </Link>
                                </div>

                                {/* Booking Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                                    <div className="bg-primary p-4 text-center">
                                        <h3 className="text-white font-bold text-lg">Book a Consultation</h3>
                                        <p className="text-white/80 text-sm">First 15 mins free for new clients</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-end gap-2 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">${consultant.hourlyRate}</span>
                                            <span className="text-slate-500 dark:text-slate-400 mb-1.5">/ hour</span>
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
                                                {consultant.availableSlots.map((slot) => {
                                                    const isDisabled = consultant.disabledSlots.includes(slot)
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
                                                    { value: 'inperson', icon: 'storefront', label: 'In-Person (NY Office)' }
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

                                        <div className="mb-4 text-center">
                                            <Link to={`/agency/${consultant.agency.id}`} className="text-xs text-slate-500 hover:text-primary transition-colors underline decoration-slate-300 hover:decoration-primary">
                                                Prefer to book through the Agency?
                                            </Link>
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

                                {/* Fast Responder Badge */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">bolt</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Fast Responder</h4>
                                            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">
                                                {consultant.name.split(' ')[0]} usually responds within 2 hours during business days.
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
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Still have questions?</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                            If you are unsure if {consultant.name.split(' ')[0]} is the right fit for your case, you can send a quick inquiry message before booking.
                        </p>
                        <Button variant="outline" size="lg">Send Message</Button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
