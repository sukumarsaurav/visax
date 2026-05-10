import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'

const issueCategories = [
    { value: 'technical', label: 'Technical Bug' },
    { value: 'billing', label: 'Billing Problem' },
    { value: 'content', label: 'Content Error' },
    { value: 'security', label: 'Security Concern' },
    { value: 'account', label: 'Account Issue' },
    { value: 'other', label: 'Other' }
]

const faqItems = [
    {
        question: 'How do I reset my password?',
        answer: 'Go to the login page and click "Forgot Password". Enter your email address and we\'ll send you a reset link.'
    },
    {
        question: 'How long does it take to get verified?',
        answer: 'Professional verification typically takes 1-3 business days. You\'ll receive an email once your account has been reviewed.'
    },
    {
        question: 'How do I cancel my subscription?',
        answer: 'Go to Settings > Billing & Payments and click "Cancel Subscription". Your access will remain until the end of your billing period.'
    },
    {
        question: 'Can I change my consultation type?',
        answer: 'Yes, you can switch between video and in-person consultations. Go to Settings > Availability to update your preferences.'
    }
]

export default function SupportPage() {
    const [category, setCategory] = useState('')
    const [urgency, setUrgency] = useState('medium')
    const [description, setDescription] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [expandedFaq, setExpandedFaq] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        // Handle form submission
        alert('Support request submitted! We\'ll get back to you shortly.')
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

                {/* Page Heading */}
                <div className="mb-10 text-center">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight mb-3">
                        How can we help?
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-normal leading-normal max-w-2xl mx-auto">
                        Find answers to common questions or submit a support request and our team will get back to you shortly.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Documentation</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Browse our guides and tutorials to get started quickly.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="size-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                            <span className="material-symbols-outlined">forum</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Community Forum</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Connect with other users and share experiences.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="size-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                            <span className="material-symbols-outlined">videocam</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-2">Video Tutorials</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Watch step-by-step video guides for common tasks.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* FAQ Section */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            {faqItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <span className="font-medium text-slate-900 dark:text-white text-sm">{item.question}</span>
                                        <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </button>
                                    {expandedFaq === idx && (
                                        <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Report Issue Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Report an Issue</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Please provide details about the issue you're encountering so our support team can assist you effectively.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Category & Urgency */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="block">
                                        <span className="text-slate-900 dark:text-slate-200 text-sm font-bold mb-2 block">Issue Category</span>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:border-primary focus:ring-primary"
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
                                            {['low', 'medium', 'critical'].map((level) => (
                                                <button
                                                    key={level}
                                                    type="button"
                                                    onClick={() => setUrgency(level)}
                                                    className={`flex-1 h-full flex items-center justify-center rounded-md text-sm font-bold transition-all ${urgency === level
                                                            ? `bg-white dark:bg-slate-700 shadow-sm ${level === 'critical' ? 'text-red-600' : 'text-primary'}`
                                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                                        }`}
                                                >
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <label className="block">
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-bold mb-2 block">Description</span>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Please describe the issue in detail. If applicable, include steps to reproduce the problem..."
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white min-h-[140px] p-4 focus:border-primary focus:ring-primary placeholder:text-slate-400"
                                        maxLength={2000}
                                    />
                                    <span className="text-right text-xs text-slate-400 block mt-1">{description.length}/2000 characters</span>
                                </label>

                                {/* Attachments */}
                                <div>
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-bold mb-2 block">Attachments (Optional)</span>
                                    <div className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary transition-all cursor-pointer">
                                        <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2 group-hover:text-primary transition-colors">cloud_upload</span>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            <span className="font-bold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF (MAX. 5MB)</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Your Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2 block">Full Name</span>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:border-primary focus:ring-primary"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-2 block">Email Address</span>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 px-4 focus:border-primary focus:ring-primary"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-4 pt-4">
                                    <Link to="/" className="px-6 py-3 rounded-lg text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
                                    >
                                        <span className="material-symbols-outlined text-lg">send</span>
                                        <span>Submit Report</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Contact Info Cards */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl p-6 border border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">mail</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email Support</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Our team typically responds within 24 hours.</p>
                                <a href="mailto:support@immigralink.com" className="text-primary font-medium text-sm hover:underline">
                                    support@immigralink.com
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
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                                <p className="text-emerald-600 font-medium text-sm">
                                    Live chat available during business hours
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
