import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import StarRating from '../../components/ui/StarRating'
import { supabase } from '../../lib/supabase'

const COLOR_MAP = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
}
const SERVICE_COLORS = ['blue', 'green', 'purple', 'amber']
const SERVICE_ICONS = ['work', 'gavel', 'description', 'family_restroom', 'school', 'translate']

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
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AgencyProfilePage() {
    const { id } = useParams() // agency id (UUID from agencies table)
    const navigate = useNavigate()

    const [agency, setAgency] = useState(null)
    const [owner, setOwner] = useState(null)
    const [members, setMembers] = useState([])
    const [services, setServices] = useState([])
    const [reviews, setReviews] = useState([])
    const [availability, setAvailability] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const today = new Date().toISOString().split('T')[0]
    const [selectedConsultant, setSelectedConsultant] = useState('')
    const [selectedDate, setSelectedDate] = useState(today)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [meetingType, setMeetingType] = useState('video')

    useEffect(() => {
        if (!id) return
        fetchAll()
    }, [id])

    useEffect(() => {
        if (!selectedConsultant) return
        supabase
            .from('consultant_availability')
            .select('*')
            .eq('consultant_id', selectedConsultant)
            .eq('is_active', true)
            .then(({ data }) => {
                setAvailability(data || [])
                setSelectedSlot(null)
            })
    }, [selectedConsultant])

    async function fetchAll() {
        setLoading(true)
        const { data: agencyData } = await supabase
            .from('agencies')
            .select('*')
            .eq('id', id)
            .single()

        if (!agencyData) {
            setNotFound(true)
            setLoading(false)
            return
        }
        setAgency(agencyData)

        const [ownerRes, membersRes] = await Promise.all([
            supabase.from('profiles').select('id, full_name, avatar_url, bio, languages, specializations, years_experience').eq('id', agencyData.owner_id).single(),
            supabase.from('agency_members').select(`
                id, role, status,
                profile:profiles!agency_members_profile_id_fkey(id, full_name, avatar_url, specializations, years_experience)
            `).eq('agency_id', id).eq('status', 'active'),
        ])

        setOwner(ownerRes.data)
        const memberList = membersRes.data || []
        setMembers(memberList)

        // All consultant IDs (owner + members)
        const consultantIds = [agencyData.owner_id, ...memberList.map(m => m.profile.id)]

        const [servicesRes, reviewsRes, availRes] = await Promise.all([
            supabase.from('services').select('*').eq('provider_id', agencyData.owner_id).eq('is_active', true).order('price'),
            supabase.from('reviews').select(`
                id, rating, comment, created_at, is_anonymous, consultant_id,
                reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, avatar_url)
            `).in('consultant_id', consultantIds).order('created_at', { ascending: false }).limit(5),
            supabase.from('consultant_availability').select('*').eq('consultant_id', agencyData.owner_id).eq('is_active', true),
        ])

        setServices(servicesRes.data || [])
        setReviews(reviewsRes.data || [])
        setAvailability(availRes.data || [])
        setLoading(false)
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null

    function getWeekdayIndex(dateStr) {
        const d = new Date(dateStr)
        const jsDay = d.getDay()
        return jsDay === 0 ? 6 : jsDay - 1
    }

    const weekdayIdx = getWeekdayIndex(selectedDate)
    const todayAvail = availability.filter(a => a.weekday === weekdayIdx)
    const timeSlots = todayAvail.flatMap(a => generateSlots(a.start_time, a.end_time))

    // All team languages
    const allLanguages = [...new Set([
        ...(owner?.languages || []),
        ...members.flatMap(m => m.profile?.languages || []),
    ])]

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

    if (notFound || !agency) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark">
                <PublicHeader />
                <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                    <span className="material-symbols-outlined text-[64px]">domain_disabled</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">Agency not found</p>
                    <Link to="/find-professionals"><Button>Browse Professionals</Button></Link>
                </div>
                <Footer />
            </div>
        )
    }

    const agencyName = agency.name || owner?.full_name || 'Agency'
    const totalConsultants = members.length + 1 // members + owner

    async function handleShare() {
        const url = window.location.href
        if (navigator.share) {
            await navigator.share({ title: agencyName, url })
        } else {
            await navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard')
        }
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
                        <span className="text-slate-900 dark:text-white font-medium">{agencyName}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Agency Header */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 flex gap-3">
                                    <button onClick={handleShare} className="size-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" title="Share">
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                                    <div className="relative shrink-0">
                                        <div className="size-32 md:size-40 rounded-xl bg-slate-100 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden">
                                            <span className="material-symbols-outlined text-6xl text-slate-400">apartment</span>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-slate-600">
                                            <span className="material-symbols-outlined text-primary text-[24px]" title="Verified Agency">verified</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{agencyName}</h1>
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Agency</span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-[18px]">groups</span>
                                                {totalConsultants} Consultant{totalConsultants !== 1 ? 's' : ''}
                                            </div>
                                            {avgRating && (
                                                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 font-medium">
                                                    <StarRating rating={avgRating} size="text-[18px]" />
                                                    ({reviews.length} Reviews)
                                                </div>
                                            )}
                                            {agency.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                    {agency.location}
                                                </div>
                                            )}
                                        </div>

                                        {agency.website_url && (
                                            <a href={agency.website_url} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">language</span>
                                                Agency Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About The Agency</h3>
                                {agency.description ? (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{agency.description}</p>
                                ) : owner?.bio ? (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{owner.bio}</p>
                                ) : (
                                    <p className="text-slate-400 italic">No description provided.</p>
                                )}
                                {allLanguages.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Languages Supported</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {allLanguages.map(lang => (
                                                <span key={lang} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">{lang}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Team Members */}
                            {(members.length > 0 || owner) && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Our Consultants</h3>
                                        <span className="text-sm text-slate-500">{totalConsultants} total</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Owner */}
                                        {owner && (
                                            <div className="flex gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10">
                                                <Avatar src={owner.avatar_url} alt={owner.full_name} size="lg" />
                                                <div className="flex-col flex flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white truncate">{owner.full_name}</h4>
                                                            <p className="text-xs text-primary font-medium">Agency Owner</p>
                                                        </div>
                                                    </div>
                                                    {owner.specializations?.length > 0 && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{owner.specializations.slice(0, 2).join(', ')}</p>
                                                    )}
                                                    <Link to={`/consultant/${owner.id}`}
                                                        className="mt-3 w-full py-1.5 rounded bg-primary text-white text-xs font-bold text-center hover:bg-blue-600 transition-colors"
                                                    >
                                                        Book Consultation
                                                    </Link>
                                                </div>
                                            </div>
                                        )}

                                        {/* Members */}
                                        {members.map(m => (
                                            <div key={m.id} className="flex gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                                                <Avatar src={m.profile.avatar_url} alt={m.profile.full_name} size="lg" />
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white truncate">{m.profile.full_name}</h4>
                                                            <p className="text-xs text-primary font-medium capitalize">{m.role || 'Consultant'}</p>
                                                        </div>
                                                    </div>
                                                    {m.profile.specializations?.length > 0 && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{m.profile.specializations.slice(0, 2).join(', ')}</p>
                                                    )}
                                                    <Link to={`/consultant/${m.profile.id}`}
                                                        className="mt-3 w-full py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-primary hover:border-primary transition-colors text-center"
                                                    >
                                                        Book Consultation
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services */}
                            {services.length > 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Agency Services</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                        {svc.price && <p className="text-xs font-bold text-primary mt-1">${svc.price}/hr</p>}
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
                                        <div className="flex items-center gap-6 mb-8 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                                            <div className="text-center px-4 border-r border-slate-200 dark:border-slate-700">
                                                <div className="text-3xl font-black text-slate-900 dark:text-white">{avgRating}</div>
                                                <StarRating rating={avgRating} size="text-[16px]" />
                                                <div className="text-xs text-slate-500">Agency Rating</div>
                                            </div>
                                            <div className="flex-1">
                                                {[5, 4, 3, 2, 1].map(star => {
                                                    const count = reviews.filter(r => Math.round(r.rating) === star).length
                                                    const pct = (count / reviews.length) * 100
                                                    return (
                                                        <div key={star} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                                                            <span className="w-6 text-right">{star}★</span>
                                                            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <span className="w-4">{count}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {reviews.map(review => {
                                                const consultant = review.consultant_id === owner?.id ? owner : members.find(m => m.profile.id === review.consultant_id)?.profile
                                                return (
                                                    <div key={review.id} className="border-b border-slate-100 dark:border-slate-700 pb-6">
                                                        <div className="flex items-start justify-between mb-2">
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
                                                                    {consultant && (
                                                                        <p className="text-xs text-slate-500">with <span className="text-primary">{consultant.full_name}</span></p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-xs text-slate-400">{timeAgo(review.created_at)}</div>
                                                        </div>
                                                        <StarRating rating={review.rating} size="text-[14px]" className="text-xs mb-2" />
                                                        {review.comment && (
                                                            <p className="text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-24 flex flex-col gap-6">
                                {/* Booking Card */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                                    <div className="bg-primary p-4 text-center">
                                        <h3 className="text-white font-bold text-lg">Book with {agencyName.split(' ')[0]}</h3>
                                        <p className="text-white/80 text-sm">First 15 mins free for new clients</p>
                                    </div>
                                    <div className="p-6">
                                        {/* Consultant Selection */}
                                        {(members.length > 0 || owner) && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Select Consultant</label>
                                                <select
                                                    value={selectedConsultant}
                                                    onChange={e => setSelectedConsultant(e.target.value)}
                                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm p-2.5 focus:ring-primary focus:border-primary dark:text-white"
                                                >
                                                    <option value="">Any Available (Earliest)</option>
                                                    {owner && <option value={owner.id}>{owner.full_name} (Owner)</option>}
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.profile.id}>{m.profile.full_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

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
                                                <p className="text-xs text-slate-400 italic">No availability set for this day.</p>
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
                                                    { value: 'inperson', icon: 'storefront', label: 'In-Person (HQ)' },
                                                ].map(type => (
                                                    <label key={type.value}
                                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${meetingType === type.value
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                        }`}
                                                    >
                                                        <input type="radio" name="meeting_type" value={type.value} checked={meetingType === type.value}
                                                            onChange={e => setMeetingType(e.target.value)} className="text-primary focus:ring-primary" />
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
                                            onClick={() => navigate('/register', {
                                                state: {
                                                    bookingIntent: {
                                                        agencyId: id,
                                                        consultantId: selectedConsultant || agency?.owner_id,
                                                        slot: selectedSlot,
                                                        mode: meetingType,
                                                    }
                                                }
                                            })}
                                        >
                                            {selectedSlot ? `Book ${selectedSlot}` : 'Confirm Booking'}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
                                            <span className="material-symbols-outlined text-[14px]">lock</span>
                                            Payments secured by Stripe
                                        </div>
                                    </div>
                                </div>

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

                {/* CTA */}
                <div className="w-full bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 px-4">
                    <div className="max-w-[800px] mx-auto text-center flex flex-col items-center gap-6">
                        <span className="material-symbols-outlined text-primary text-[32px]">contact_support</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Have questions about the agency?</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                            Not sure which consultant to choose? Send a general inquiry and our intake team will match you with the best expert.
                        </p>
                        <Link to="/help"><Button variant="outline" size="lg">Contact Agency</Button></Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
