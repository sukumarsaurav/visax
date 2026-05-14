import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { supabase } from '../../lib/supabase'

const issueCategories = [
    { value: 'technical', label: 'Technical Bug' },
    { value: 'billing', label: 'Billing Problem' },
    { value: 'content', label: 'Content Error' },
    { value: 'security', label: 'Security Concern' },
    { value: 'account', label: 'Account Issue' },
    { value: 'other', label: 'Other' },
]

const faqItems = [
    {
        question: 'How do I reset my password?',
        answer: 'Go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a reset link within a few minutes.',
    },
    {
        question: 'How long does professional verification take?',
        answer: 'Professional verification typically takes 1–3 business days. You\'ll receive an email once your account has been reviewed and approved.',
    },
    {
        question: 'How do I cancel my subscription?',
        answer: 'Go to Settings → Billing & Payments and click "Cancel Subscription". Your access will continue until the end of your billing period.',
    },
    {
        question: 'Can I change my consultation type after booking?',
        answer: 'Yes — contact your consultant directly through Messages to request a change. Most consultants accommodate switches between video and phone consultations.',
    },
]

export default function SupportPage() {
    const [category, setCategory] = useState('')
    const [urgency, setUrgency] = useState('medium')
    const [description, setDescription] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [expandedFaq, setExpandedFaq] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!category || !description.trim() || !email.trim()) {
            setError('Please fill in category, email, and description.')
            return
        }
        setError('')
        setSubmitting(true)

        const { error: dbError } = await supabase.from('support_tickets').insert({
            name: name.trim() || null,
            email: email.trim(),
            category,
            urgency,
            description: description.trim(),
            status: 'open',
        })

        if (dbError) {
            // Fallback: show error but don't block UX entirely
            console.error('Support ticket error:', dbError)
            setError('Failed to submit. Please email us directly at support@visax.com')
            setSubmitting(false)
            return
        }

        setSubmitted(true)
        setSubmitting(false)
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center gap-2 text-slate-500">
                        <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                        <li><span className="material-symbols-outlined text-[16px]">chevron_right</span></li>
                        <li className="text-slate-900 dark:text-white font-medium">Help Center</li>
                    </ol>
                </nav>

                {/* Heading */}
                <div className="mb-10 text-center">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight mb-3">
                        How can we help?
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
                        Find answers to common questions or submit a support request and our team will get back to you shortly.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    {[
                        { icon: 'menu_book', color: 'blue', title: 'Documentation', desc: 'Browse our guides and tutorials to get started quickly.' },
                        { icon: 'forum', color: 'emerald', title: 'Community Forum', desc: 'Connect with other users and share experiences.' },
                        { icon: 'videocam', color: 'purple', title: 'Video Tutorials', desc: 'Watch step-by-step video guides for common tasks.' },
                    ].map(item => (
                        <div key={item.title} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                            <div className={`size-12 rounded-full bg-${item.color}-50 dark:bg-${item.color}-900/20 flex items-center justify-center text-${item.color}-600 mb-4`}>
                                <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div id="trust-safety" className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* FAQ */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            {faqItems.map((item, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className="font-medium text-slate-900 dark:text-white text-sm">{item.question}</span>
                                        <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>expand_more</span>
                                    </button>
                                    {expandedFaq === idx && (
                                        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">{item.answer}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                            {submitted ? (
                                <div className="flex flex-col items-center gap-4 py-12 text-center">
                                    <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">check_circle</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Support Request Submitted!</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                        We've received your request and will get back to you at <strong>{email}</strong> within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => { setSubmitted(false); setDescription(''); setCategory(''); setName(''); setEmail('') }}
                                        className="text-primary font-medium hover:underline text-sm"
                                    >
                                        Submit another request
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Report an Issue</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                        Provide details about the issue so our support team can assist you effectively.
                                    </p>

                                    {error && (
                                        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <label className="block">
                                                <span className="text-slate-900 dark:text-slate-200 text-sm font-bold mb-2 block">
                                                    Issue Category <span className="text-red-500">*</span>
                                                </span>
                                                <select
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value)}
                                                    required
                                                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:border-primary focus:ring-primary"
                                                >
                                                    <option value="">Select an issue type</option>
                                                    {issueCategories.map(cat => (
                                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                    ))}
                                                </select>
                                            </label>

                                            <div>
                                                <span className="text-slate-900 dark:text-slate-200 text-sm font-bold mb-2 block">Urgency Level</span>
                                                <div className="flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                                                    {['low', 'medium', 'critical'].map(level => (
                                                        <button
                                                            key={level}
                                                            type="button"
                                                            onClick={() => setUrgency(level)}
                                                            className={`flex-1 h-full flex items-center justify-center rounded-md text-sm font-bold transition-all capitalize ${urgency === level
                                                                ? `bg-white dark:bg-slate-700 shadow-sm ${level === 'critical' ? 'text-red-600' : 'text-primary'}`
                                                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                            }`}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <label className="block">
                                            <span className="text-slate-900 dark:text-slate-200 text-sm font-bold mb-2 block">
                                                Description <span className="text-red-500">*</span>
                                            </span>
                                            <textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value.slice(0, 2000))}
                                                required
                                                placeholder="Please describe the issue in detail..."
                                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[140px] p-4 focus:border-primary focus:ring-primary placeholder:text-slate-400 resize-none"
                                            />
                                            <span className="text-right text-xs text-slate-400 block mt-1">{description.length}/2000</span>
                                        </label>

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Your Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <label className="block">
                                                    <span className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2 block">Full Name</span>
                                                    <input
                                                        type="text"
                                                        value={name}
                                                        onChange={e => setName(e.target.value)}
                                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:border-primary focus:ring-primary"
                                                    />
                                                </label>
                                                <label className="block">
                                                    <span className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2 block">
                                                        Email Address <span className="text-red-500">*</span>
                                                    </span>
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={e => setEmail(e.target.value)}
                                                        required
                                                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:border-primary focus:ring-primary"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-4 pt-2">
                                            <Link to="/" className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                Cancel
                                            </Link>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                                            >
                                                <span className="material-symbols-outlined text-lg">{submitting ? 'sync' : 'send'}</span>
                                                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div id="contact" className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6 border border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email Support</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Our team typically responds within 24 hours.</p>
                                <a href="mailto:support@visax.com" className="text-primary font-medium text-sm hover:underline">
                                    support@visax.com
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/20 rounded-xl p-6 border border-emerald-500/20">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                                <span className="material-symbols-outlined">schedule</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Business Hours</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Monday – Friday, 9:00 AM – 6:00 PM EST</p>
                                <p className="text-emerald-600 font-medium text-sm">Live chat available during business hours</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
