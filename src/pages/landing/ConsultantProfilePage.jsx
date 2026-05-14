import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import StarRating from '../../components/ui/StarRating'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'

const COLOR_MAP = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
}
const SERVICE_COLORS = ['blue', 'green', 'purple', 'amber']
const SERVICE_ICONS = ['work', 'gavel', 'description', 'family_restroom', 'school', 'translate']

// Generate hour slots between start_time and end_time (HH:MM strings)
function generateSlots(startTime, endTime) {
    if (!startTime || !endTime) return []
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh] = endTime.split(':').map(Number)
    const slots = []
    for (let h = sh; h < eh; h++) {
        const ampm = h < 12 ? 'AM' : 'PM'
        const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
        slots.push(`${displayH}:${sm === 0 ? '00' : sm} ${ampm}`)
    }
    return slots
}

function timeAgo(d) {
    if (!d) return ''
    const diff = Date.now() - new Date(d).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 1) return 'Today'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
    return formatDate(d)
}

export default function ConsultantProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    // Use profile passed via router state (from FindProfessionals list) to skip the first fetch
    const [profile, setProfile] = useState(location.state?.profile ?? null)
    const [services, setServices] = useState([])
    const [reviews, setReviews] = useState([])
    const [availability, setAvailability] = useState([])
    const [agencyInfo, setAgencyInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    const [selectedDate, setSelectedDate] = useState(today)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [meetingType, setMeetingType] = useState('video')
    const [showConfirmation, setShowConfirmation] = useState(false)

    useEffect(() => {
        if (!id) return
        fetchAll()
    }, [id])

    async function fetchAll() {
        setLoading(true)
        // If profile was passed via router state, skip re-fetching it and run 3 queries instead of 4
        const queries = [
            profile ? Promise.resolve({ data: profile }) : supabase.from('profiles').select('*').eq('id', id).single(),
            supabase.from('services').select('*').eq('provider_id', id).eq('is_active', true).order('price'),
            supabase.from('reviews').select(`
                id, rating, comment, created_at, is_anonymous,
                reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)
            `).eq('consultant_id', id).order('created_at', { ascending: false }).limit(5),
            supabase.from('consultant_availability').select('*').eq('consultant_id', id).eq('is_active', true),
        ]
        const [profileRes, servicesRes, reviewsRes, availRes] = await Promise.all(queries)

        if (!profileRes.data) {
            setNotFound(true)
            setLoading(false)
            return
        }

        setProfile(profileRes.data)
        setServices(servicesRes.data || [])
        setReviews(reviewsRes.data || [])
        setAvailability(availRes.data || [])

        // If this person is an agency member, find their agency
        if (profileRes.data.role === 'agency_member') {
            const { data: memberRow } = await supabase
                .from('agency_members')
                .select('agency:agencies(id, name, owner_id)')
                .eq('profile_id', id)
                .eq('status', 'active')
                .maybeSingle()
            if (memberRow?.agency) setAgencyInfo(memberRow.agency)
        }

        setLoading(false)
    }

    // Compute avg rating
    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null

    // Generate time slots for the selected date's weekday
    // weekday: JS getDay() gives 0=Sun...6=Sat; DB stores 0=Mon...6=Sun
    function getWeekdayIndex(dateStr) {
        const d = new Date(dateStr)
        const jsDay = d.getDay() // 0=Sun
        return jsDay === 0 ? 6 : jsDay - 1 // convert to Mon=0...Sun=6
    }

    const weekdayIdx = getWeekdayIndex(selectedDate)
    const todayAvail = availability.filter(a => a.weekday === weekdayIdx)
    const timeSlots = todayAvail.flatMap(a => generateSlots(a.start_time, a.end_time))

    const minPrice = services.length > 0 ? Math.min(...services.map(s => s.price || 0)) : null

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <PublicHeader />
                <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}
                    </div>
                    <div className="lg:col-span-4">
                        <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (notFound || !profile) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <PublicHeader />
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                    <span className="material-symbols-outlined text-[64px]">person_off</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">Consultant not found</p>
                    <Link to="/find-professionals"><Button>Browse Professionals</Button></Link>
                </div>
                <Footer />
            </div>
        )
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
                        {agencyInfo && (
                            <>
                                <span className="mx-2">/</span>
                                <Link to={`/agency/${agencyInfo.id}`} className="hover:text-primary transition-colors font-medium text-slate-700 dark:text-slate-300">
                                    {agencyInfo.name}
                                </Link>
                            </>
                        )}
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 dark:text-white font-medium">{profile.full_name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Profile Header */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex gap-3">
                                    <button className="size-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Share">
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                    <div className="relative shrink-0">
                                        <img
                                            className="size-32 md:size-40 rounded-xl object-cover border-4 border-slate-50 dark:border-slate-700 shadow-md"
                                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&size=160&background=random`}
                                            alt={profile.full_name}
                                        />
                                        {profile.application_status === 'approved' && (
                                            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-slate-600">
                                                <span className="material-symbols-outlined text-primary text-[24px]" title="Verified">verified</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{profile.full_name}</h1>

                                        {agencyInfo && (
                                            <Link to={`/agency/${agencyInfo.id}`}
                                                className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors group w-fit"
                                            >
                                                <span className="material-symbols-outlined text-[14px] text-primary">apartment</span>
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{agencyInfo.name}</span>
                                                <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary transition-colors ml-1">arrow_forward</span>
                                            </Link>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-5">
                                            {profile.years_experience && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[18px]">work_history</span>
                                                    {profile.years_experience} Years Experience
                                                </div>
                                            )}
                                            {avgRating && (
                                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-medium">
                                                    <StarRating rating={avgRating} size="text-[18px]" />
                                                    ({reviews.length} Reviews)
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5 capitalize">
                                                <span className="material-symbols-outlined text-[18px]">badge</span>
                                                {profile.role === 'individual' ? 'Independent Consultant' : profile.role === 'agency_admin' ? 'Agency Owner' : 'Agency Consultant'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About Me</h3>
                                {profile.bio ? (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                                ) : (
                                    <p className="text-slate-400 italic">No bio provided.</p>
                                )}
                                {profile.languages?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Languages</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {profile.languages.map(lang => (
                                                <span key={lang} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">{lang}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Services */}
                            {services.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Services & Expertise</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {services.map((svc, idx) => {
                                            const colorKey = SERVICE_COLORS[idx % SERVICE_COLORS.length]
                                            const iconKey = SERVICE_ICONS[idx % SERVICE_ICONS.length]
                                            return (
                                                <div key={svc.id} className="flex gap-4">
                                                    <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR_MAP[colorKey]}`}>
                                                        <span className="material-symbols-outlined">{iconKey}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{svc.title}</h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{svc.description}</p>
                                                        {svc.price && (
                                                            <p className="text-xs font-bold text-primary mt-1">${svc.price}/hr</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Client Reviews</h3>
                                    {reviews.length > 0 && <span className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>}
                                </div>

                                {reviews.length === 0 ? (
                                    <p className="text-slate-400 text-sm italic">No reviews yet.</p>
                                ) : (
                                    <>
                                        {/* Rating summary */}
                                        <div className="flex items-center gap-6 mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                                            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                                                <div className="text-3xl font-black text-slate-900 dark:text-white">{avgRating}</div>
                                                <StarRating rating={avgRating} size="text-[16px]" />
                                                <div className="text-xs text-slate-500">Overall</div>
                                            </div>
                                            <div className="flex-1">
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = reviews.filter(r => Math.round(r.rating) === star).length
                                                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                                                    return (
                                                        <div key={star} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                            <span className="w-6 text-right">{star}★</span>
                                                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="w-6">{count}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {reviews.map(review => (
                                                <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-6">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            {review.is_anonymous || !review.reviewer ? (
                                                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                                                    <span className="material-symbols-outlined text-[20px]">person</span>
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
                                                        <div className="text-xs text-slate-400">{timeAgo(review.created_at)}</div>
                                                    </div>
                                                    <StarRating rating={review.rating} size="text-[14px]" className="text-xs mb-2" />
                                                    {review.comment && (
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-24 flex flex-col gap-6">
                                {agencyInfo && (
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 shrink-0">
                                                <span className="material-symbols-outlined text-[24px]">apartment</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{agencyInfo.name}</h4>
                                                <p className="text-xs text-slate-500">Agency</p>
                                            </div>
                                        </div>
                                        <Link to={`/agency/${agencyInfo.id}`}>
                                            <Button variant="outline" className="w-full">Visit Agency Page</Button>
                                        </Link>
                                    </div>
                                )}

                                {/* Booking Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                                    <div className="bg-primary p-4 text-center">
                                        <h3 className="text-white font-bold text-lg">Book a Consultation</h3>
                                        {minPrice != null && (
                                            <p className="text-white/80 text-sm">From ${minPrice}/hr</p>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Select Date</label>
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                min={today}
                                                onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null) }}
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Available Slots</label>
                                            {timeSlots.length === 0 ? (
                                                <p className="text-xs text-slate-400 italic">No availability on this day.</p>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {timeSlots.map(slot => (
                                                        <button
                                                            key={slot}
                                                            onClick={() => setSelectedSlot(slot)}
                                                            className={`px-2 py-2 rounded-lg border text-xs transition-colors ${selectedSlot === slot
                                                                ? 'border-primary bg-primary/10 text-primary font-bold'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                            }`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Meeting Type</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { value: 'video', icon: 'videocam', label: 'Video Call (Zoom)' },
                                                    { value: 'phone', icon: 'call', label: 'Phone Call' },
                                                    { value: 'inperson', icon: 'storefront', label: 'In-Person' },
                                                ].map(type => (
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
                                                            onChange={e => setMeetingType(e.target.value)}
                                                            className="text-primary focus:ring-primary"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <span className={`material-symbols-outlined text-[20px] ${meetingType === type.value ? 'text-primary' : 'text-slate-500'}`}>{type.icon}</span>
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{type.label}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full shadow-lg shadow-primary/30"
                                            disabled={timeSlots.length > 0 && !selectedSlot}
                                            onClick={() => setShowConfirmation(true)}
                                        >
                                            {selectedSlot ? `Book ${selectedSlot}` : 'Book Consultation'}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                            Payments secured by Stripe
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Confirmation Modal */}
                                <Modal
                                    open={showConfirmation}
                                    onClose={() => setShowConfirmation(false)}
                                    title="Confirm Your Booking"
                                    maxWidth="max-w-sm"
                                >
                                    <div className="flex flex-col gap-5">
                                        {/* Consultant Summary */}
                                        <div className="flex items-center gap-3">
                                            <Avatar src={profile?.avatar_url} alt={profile?.full_name} size="md" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{profile?.full_name}</p>
                                                <p className="text-xs text-slate-500">{profile?.specialization || 'Immigration Consultant'}</p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                            <div className="flex justify-between items-center px-4 py-3">
                                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">calendar_today</span>
                                                    Date
                                                </span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(selectedDate)}</span>
                                            </div>
                                            {selectedSlot && (
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <span className="text-sm text-slate-500 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">schedule</span>
                                                        Time
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedSlot}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center px-4 py-3">
                                                <span className="text-sm text-slate-500 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                                                        {meetingType === 'video' ? 'videocam' : meetingType === 'phone' ? 'call' : 'storefront'}
                                                    </span>
                                                    Type
                                                </span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{meetingType === 'inperson' ? 'In-Person' : meetingType}</span>
                                            </div>
                                            {minPrice != null && (
                                                <div className="flex justify-between items-center px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
                                                    <span className="text-sm text-slate-500 flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">payments</span>
                                                        From
                                                    </span>
                                                    <span className="text-sm font-bold text-primary">${minPrice}/hr</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                className="w-full"
                                                onClick={() => {
                                                    const params = new URLSearchParams({
                                                        consultant_id: id,
                                                        date: selectedDate,
                                                        ...(selectedSlot && { slot: selectedSlot }),
                                                        type: meetingType,
                                                    })
                                                    navigate(`/register?booking=${params.toString()}`)
                                                }}
                                            >
                                                Confirm & Continue
                                            </Button>
                                            <button
                                                onClick={() => setShowConfirmation(false)}
                                                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1.5 transition-colors"
                                            >
                                                Go Back
                                            </button>
                                        </div>
                                    </div>
                                </Modal>

                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">bolt</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Fast Responder</h4>
                                            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">
                                                {profile.full_name.split(' ')[0]} typically responds within 2 hours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 px-4">
                    <div className="max-w-[800px] mx-auto text-center flex flex-col items-center gap-6">
                        <span className="material-symbols-outlined text-primary text-[32px]">contact_support</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Still have questions?</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                            If you're unsure if {profile.full_name.split(' ')[0]} is the right fit, send a quick inquiry before booking.
                        </p>
                        <Link to="/help"><Button variant="outline" size="lg">Get Support</Button></Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
