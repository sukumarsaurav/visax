import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

const tags = [
    'Professional', 'Knowledgeable', 'Helpful', 'Patient',
    'Clear Communication', 'Thorough', 'On Time', 'Friendly'
]

// Mock appointment data
const appointmentData = {
    id: '1',
    professional: {
        name: 'Sarah Jenkins, Esq.',
        title: 'Immigration Attorney',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    },
    date: 'October 24, 2024',
    service: 'Immigration Law Consultation',
}

export default function FeedbackPage() {
    const { appointmentId } = useParams()
    const navigate = useNavigate()
    const appointment = appointmentData // In real app, fetch based on appointmentId

    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [review, setReview] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleTagToggle = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSubmitting(false)
        setIsSubmitted(true)
    }

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-4xl">
                            sentiment_satisfied
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        Thank you for your feedback!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Your review helps other clients find the right professional and helps us improve our platform.
                    </p>
                    <Link to="/client">
                        <Button icon="home">Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">
                        How was your experience?
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Your feedback helps us maintain high-quality professionals.
                    </p>
                </div>

                {/* Appointment Summary */}
                <Card className="mb-6">
                    <div className="flex items-center gap-4">
                        <Avatar src={appointment.professional.avatar} alt={appointment.professional.name} size="lg" />
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {appointment.professional.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {appointment.service}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {appointment.date}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Rating */}
                <Card className="mb-6">
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Rate your experience</h3>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="text-4xl transition-transform hover:scale-110"
                                >
                                    <span className={`material-symbols-outlined ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-slate-300 dark:text-slate-600'
                                        }`} style={{ fontVariationSettings: star <= (hoveredRating || rating) ? "'FILL' 1" : "'FILL' 0" }}>
                                        star
                                    </span>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500">
                            {rating === 0 && 'Click to rate'}
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </p>
                    </div>
                </Card>

                {/* Tags */}
                <Card className="mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                        What did you like? <span className="font-normal text-slate-500">(optional)</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagToggle(tag)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {tag}
                            </button>
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
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Share your experience to help others make informed decisions..."
                        className="w-full h-32 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                Post anonymously
                            </span>
                        </label>
                        <span className="text-xs text-slate-400">
                            {review.length}/500 characters
                        </span>
                    </div>
                </Card>

                {/* Submit Button */}
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
