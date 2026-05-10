import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: 'rocket_launch', count: 12 },
    { id: 'appointments', name: 'Appointments', icon: 'calendar_month', count: 8 },
    { id: 'payments', name: 'Payments & Billing', icon: 'payments', count: 15 },
    { id: 'documents', name: 'Documents', icon: 'description', count: 10 },
    { id: 'cases', name: 'Case Management', icon: 'folder', count: 7 },
    { id: 'account', name: 'Account & Settings', icon: 'settings', count: 9 },
]

const faqs = [
    {
        id: 1,
        question: 'How do I book a consultation with an immigration professional?',
        answer: 'To book a consultation, browse our directory of verified professionals, select one that matches your needs, view their availability calendar, and choose a time slot. You can book video calls, phone consultations, or in-person meetings depending on the professional\'s offerings.',
        category: 'getting-started',
    },
    {
        id: 2,
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely with bank-level encryption. You can also save payment methods for faster checkout.',
        category: 'payments',
    },
    {
        id: 3,
        question: 'How can I reschedule or cancel an appointment?',
        answer: 'You can reschedule or cancel appointments from your dashboard. Go to "Appointments", find the appointment you want to modify, and click "Reschedule" or "Cancel". Please note that cancellation policies vary by professional and may incur fees if done less than 24 hours before the appointment.',
        category: 'appointments',
    },
    {
        id: 4,
        question: 'How do I upload documents securely?',
        answer: 'Navigate to the "Documents" section in your dashboard. Click "Upload Document" and select files from your device. All documents are encrypted end-to-end and stored securely. You can also share documents directly with your assigned professionals.',
        category: 'documents',
    },
    {
        id: 5,
        question: 'What happens after I start a case?',
        answer: 'Once a case is initiated, you\'ll receive updates through your dashboard and email notifications. Your assigned professional will guide you through each step, request necessary documents, and keep you informed about the progress. You can track everything in the "My Cases" section.',
        category: 'cases',
    },
]

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [expandedFaq, setExpandedFaq] = useState(null)

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || faq.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                    How can we help you?
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Search our knowledge base or browse categories below.
                </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto w-full">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <span className="material-symbols-outlined">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all hover:shadow-md ${selectedCategory === category.id
                                ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/50'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedCategory === category.id
                                ? 'bg-primary text-white'
                                : 'bg-primary/10 text-primary'
                            }`}>
                            <span className="material-symbols-outlined">{category.icon}</span>
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-bold ${selectedCategory === category.id ? 'text-primary' : 'text-slate-900 dark:text-white'
                                }`}>
                                {category.name}
                            </p>
                            <p className="text-xs text-slate-500">{category.count} articles</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FAQ List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {selectedCategory
                                    ? `${categories.find(c => c.id === selectedCategory)?.name} FAQs`
                                    : 'Frequently Asked Questions'
                                }
                            </CardTitle>
                            {selectedCategory && (
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="text-sm text-primary hover:underline"
                                >
                                    View All
                                </button>
                            )}
                        </CardHeader>

                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq) => (
                                    <div key={faq.id} className="py-4">
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                            className="w-full flex items-start justify-between gap-4 text-left"
                                        >
                                            <h3 className="font-bold text-slate-900 dark:text-white">
                                                {faq.question}
                                            </h3>
                                            <span className={`material-symbols-outlined text-slate-400 transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''
                                                }`}>
                                                expand_more
                                            </span>
                                        </button>
                                        {expandedFaq === faq.id && (
                                            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                                                {faq.answer}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">search_off</span>
                                    <p className="text-slate-500">No results found. Try a different search term.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Contact Support Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <div className="flex flex-col items-center text-center gap-4 p-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                                    Need more help?
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Our support team is available 24/7 to assist you.
                                </p>
                            </div>
                            <div className="w-full space-y-3">
                                <Button className="w-full" icon="chat">Start Live Chat</Button>
                                <Button variant="outline" className="w-full" icon="mail">
                                    Send Email
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400">
                                Average response time: &lt; 2 hours
                            </p>
                        </div>
                    </Card>

                    {/* Quick Links */}
                    <Card className="mt-6">
                        <CardTitle className="mb-4">Quick Links</CardTitle>
                        <div className="space-y-2">
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <span className="material-symbols-outlined text-slate-400">video_library</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Video Tutorials</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <span className="material-symbols-outlined text-slate-400">menu_book</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">User Guide</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <span className="material-symbols-outlined text-slate-400">forum</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Community Forum</span>
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
