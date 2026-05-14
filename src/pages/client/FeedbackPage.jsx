import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const TAGS = [
    'Professional', 'Knowledgeable', 'Helpful', 'Patient',
    'Clear Communication', 'Thorough', 'On Time', 'Friendly'
]

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' }

export default function FeedbackPage() {
    const { appointmentId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [appointment, setAppointment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [alreadyReviewed, setAlreadyReviewed] = useState(false)

    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [review, setReview] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    useEffect(() => {
        if (!user) return
        fetchAppointment()
    }, [user, appointmentId])

    async function fetchAppointment() {
        setLoading(true)
        if (appointmentId) {
            const { data } = await supabase
                .from('appointments')
                .select(`
                    id, title, scheduled_at, duration_minutes,
                    consultant:profiles!appointments_consultant_id_fkey(id, full_name, avatar_url)
                `)
                .eq('id', appointmentId)
                .eq('client_id', user.id)
                .single()
            setAppointment(data)

            // Check if already reviewed
            if (data?.consultant?.id) {
                const { data: existing } = await supabase
                    .from('reviews')
                    .select('id')
                    .eq('reviewer_id', user.id)
                    .eq('appointment_id', appointmentId)
                    .maybeSingle()
                if (existing) setAlreadyReviewed(true)
            }
        } else {
            // No appointmentId — find latest completed appointment without a review
            const { data: appts } = await supabase
                .from('appointments')
                .select(`
                    id, title, scheduled_at,
                    consultant:profiles!appointments_consultant_id_fkey(id, full_name, avatar_url)
                `)
                .eq('client_id', user.id)
                .eq('status', 'completed')
                .order('scheduled_at', { ascending: false })
                .limit(1)
            setAppointment(appts?.[0] || null)
        }
        setLoading(false)
    }

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const handleSubmit = async () => {
        if (rating === 0 || !appointment) return
        setIsSubmitting(true)
        const payload = {
            reviewer_id: isAnonymous ? null : user.id,
            consultant_id: appointment.consultant?.id,
            appointment_id: appointment.id,
            rating,
            comment: review.trim() || null,
        }
        const { error } = await supabase.from('reviews').insert(payload)
        if (!error) {
            setIsSubmitted(true)
        }
        setIsSubmitting(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center px-4 py-8">
                <div className="w-full max-w-2xl space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
                </div>
            </div>
        )
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
                <div className="w-full max-w-md text-center">
                    <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">sentiment_satisfied</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Thank you for your feedback!</h1>
                    <p className="text-slate-500 mb-8">Your review helps other clients find the right professional.</p>
                    <Link to="/client">
                        <Button icon="home">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (alreadyReviewed) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
                <div className="w-full max-w-md text-center">
                    <div className="size-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-blue-600 text-4xl">rate_review</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Already Reviewed</h1>
                    <p className="text-slate-500 mb-8">You have already submitted a review for this appointment.</p>
                    <Link to="/client"><Button>Back to Dashboard</Button></Link>
                </div>
            </div>
        )
    }

    if (!appointment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
                <div className="w-full max-w-md text-center">
                    <span className="material-symbols-outlined text-[64px] text-slate-400 block mb-4">event_busy</span>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No appointment found</h1>
                    <p className="text-slate-500 mb-6">Complete an appointment first to leave a review.</p>
                    <Link to="/client"><Button>Back to Dashboard</Button></Link>
                </div>
            </div>
        )
    }

    const displayRating = hoveredRating || rating

    return (
        <div className="flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">How was your experience?</h1>
                    <p className="text-slate-500">Your feedback helps us maintain high-quality professionals.</p>
                </div>

                {/* Appointment Summary */}
                <Card className="mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar src={appointment.consultant?.avatar_url} alt={appointment.consultant?.full_name} size="lg" />
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">{appointment.consultant?.full_name}</h3>
                            <p className="text-sm text-slate-500">{appointment.title}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {new Date(appointment.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Star Rating */}
                <Card className="mb-6">
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Rate your experience</h3>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="text-4xl transition-transform hover:scale-110"
                                >
                                    <span
                                        className={`material-symbols-outlined ${star <= displayRating ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                        style={{ fontVariationSettings: star <= displayRating ? "'FILL' 1" : "'FILL' 0" }}
                                    >star</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 h-5">
                            {displayRating > 0 ? RATING_LABELS[displayRating] : 'Click to rate'}
                        </p>
                    </div>
                </Card>

                {/* Tags */}
                <Card className="mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                        What did you like? <span className="font-normal text-slate-500">(optional)</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >{tag}</button>
                        ))}
                    </div>
                </Card>

                {/* Review Text */}
                <Card className="mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                        Write a review <span className="font-normal text-slate-500">(optional)</span>
                    </h3>
                    <textarea
                        value={review}
                        onChange={e => setReview(e.target.value.slice(0, 500))}
                        placeholder="Share your experience to help others make informed decisions..."
                        className="w-full h-32 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none text-sm"
                    />
                    <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={e => setIsAnonymous(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">Post anonymously</span>
                        </label>
                        <span className="text-xs text-slate-400">{review.length}/500</span>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="flex-1"
                        icon={isSubmitting ? 'sync' : 'send'}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                    <Link to="/client" className="flex-1">
                        <Button variant="outline" className="w-full">Skip for Now</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
