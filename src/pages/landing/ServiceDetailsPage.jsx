import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'

const serviceData = {
    'h1b-visa': {
        title: 'H-1B Visa Application Assistance',
        category: 'Employment Visa',
        description: 'Expert guidance for specialty occupation workers. Secure your future with verified immigration attorneys and agencies who specialize in H-1B petitions.',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
        successCount: 500,
        priceRange: '$2,500 - $5,000'
    }
}

const inclusions = [
    { icon: 'assignment_turned_in', title: 'Eligibility Assessment', description: 'Detailed review of your background and job offer to ensure H-1B compliance.' },
    { icon: 'description', title: 'LCA Filing', description: 'Preparation and filing of the Labor Condition Application with the DOL.' },
    { icon: 'gavel', title: 'Petition Drafting', description: 'Complete preparation of Form I-129 and all supporting legal briefs.' },
    { icon: 'support_agent', title: 'RFE Support', description: 'Response strategy and drafting if a Request for Evidence is issued.' }
]

const processSteps = [
    { step: 1, title: 'Select a Provider', description: 'Choose a verified attorney or agency from our list.', active: true },
    { step: 2, title: 'Upload Documents', description: 'Securely upload employment & education records.', active: true },
    { step: 3, title: 'Review & File', description: 'Professional prepares forms; you review before filing.', active: false },
    { step: 4, title: 'Track Status', description: 'Receive updates on the lottery and adjudication.', active: false }
]

const professionals = [
    {
        id: 1,
        name: 'Sarah Jenkins, Esq.',
        title: 'Senior Immigration Attorney',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        rating: 4.9,
        experience: '15+ Years Exp',
        languages: 'English, Spanish',
        price: 3000
    },
    {
        id: 2,
        name: 'Global Mobility Partners',
        title: 'VisaX Agency',
        image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150',
        rating: 4.7,
        tags: ['Fast Track Available', 'Corporate Focus'],
        price: 2800
    }
]

const faqs = [
    { question: 'Do I need a sponsor for an H-1B visa?', answer: 'Yes, the H-1B visa requires a U.S. employer to sponsor you. You cannot self-petition for this specific visa category. The employer must file the petition on your behalf.' },
    { question: 'How long does the process take?', answer: 'Regular processing can take 2-6 months depending on the service center. Premium processing is available for an additional fee, which guarantees a response within 15 calendar days.' },
    { question: 'What happens if I get an RFE?', answer: 'A Request for Evidence (RFE) means USCIS needs more information. Your attorney will review the RFE and help you gather the necessary documentation to respond within the deadline.' }
]

export default function ServiceDetailsPage() {
    const { serviceId } = useParams()
    const [activeTab, setActiveTab] = useState('overview')
    const [openFaq, setOpenFaq] = useState(null)

    const service = serviceData['h1b-visa'] // Default fallback

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'inclusions', label: 'Inclusions & Benefits' },
        { id: 'process', label: 'Process' },
        { id: 'professionals', label: 'Professionals' },
        { id: 'faq', label: 'FAQ' }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            <PublicHeader />

            <main className="flex-1">
                <div className="mx-auto max-w-5xl px-4 md:px-10 py-5">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 py-2 mb-4">
                        <Link to="/" className="text-slate-500 hover:text-primary text-sm font-medium">Home</Link>
                        <span className="text-slate-400 text-sm">/</span>
                        <Link to="/services" className="text-slate-500 hover:text-primary text-sm font-medium">Services</Link>
                        <span className="text-slate-400 text-sm">/</span>
                        <span className="text-slate-500 text-sm font-medium">Employment Visas</span>
                        <span className="text-slate-400 text-sm">/</span>
                        <span className="text-slate-900 dark:text-white text-sm font-medium">H-1B Application</span>
                    </div>

                    {/* Hero Section */}
                    <div className="flex flex-col gap-6 py-8 md:flex-row">
                        <div
                            className="w-full aspect-video md:w-1/2 bg-cover bg-center rounded-xl shadow-lg"
                            style={{ backgroundImage: `url("${service.image}")` }}
                        ></div>
                        <div className="flex flex-col gap-6 md:w-1/2 md:justify-center">
                            <div className="flex flex-col gap-3">
                                <div className="inline-flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded">{service.category}</span>
                                    <span className="flex items-center text-xs text-green-600 font-medium">
                                        <span className="material-symbols-outlined text-[16px] mr-1">verified</span>
                                        Verified Providers
                                    </span>
                                </div>
                                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                                    {service.title}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                                    {service.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex -space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white"></div>
                                        <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white"></div>
                                        <div className="w-8 h-8 rounded-full bg-slate-500 border-2 border-white"></div>
                                        <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-slate-700 border-2 border-white rounded-full">+99</div>
                                    </div>
                                    <span className="text-sm text-slate-500 font-medium">Over {service.successCount} successful cases</span>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-2">
                                <button className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold hover:bg-blue-600 transition-all shadow-md">
                                    Find a Professional
                                </button>
                                <button className="flex items-center justify-center rounded-lg h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                                    How it works
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="sticky top-16 z-40 bg-slate-50 dark:bg-slate-950 pt-2 pb-1">
                        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700 gap-8">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-col items-center justify-center pb-3 pt-4 min-w-fit border-b-[3px] transition-colors ${activeTab === tab.id
                                            ? 'border-b-primary text-slate-900 dark:text-white'
                                            : 'border-b-transparent text-slate-500 hover:text-primary'
                                        }`}
                                >
                                    <span className="text-sm font-bold">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-12 py-8">
                        {/* Inclusions Section */}
                        <section id="inclusions">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">What's Included</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {inclusions.map((item, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                                        <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">{item.icon}</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{item.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Process Section */}
                        <section id="process">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">Process Overview</h2>
                            <div className="relative bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="hidden md:block absolute top-[80px] left-12 right-12 h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                                    {processSteps.map((step) => (
                                        <div key={step.step} className="flex flex-col md:items-center md:text-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-4 shadow-md ${step.active
                                                    ? step.step === 1
                                                        ? 'bg-primary text-white border-white dark:border-slate-900'
                                                        : 'bg-white dark:bg-slate-800 border-primary text-primary'
                                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500'
                                                }`}>
                                                {step.step}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-base mb-1 text-slate-900 dark:text-white">{step.title}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Pricing Section */}
                        <section id="pricing">
                            <div className="bg-blue-50 dark:bg-slate-800/50 rounded-xl p-6 border border-blue-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Estimated Cost</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                                        Professional fees typically range from <span className="font-bold text-primary">{service.priceRange}</span> for this service, excluding government filing fees.
                                    </p>
                                </div>
                                <button className="shrink-0 text-primary font-bold text-sm bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    View Fee Breakdown
                                </button>
                            </div>
                        </section>

                        {/* Professionals Section */}
                        <section id="professionals">
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-slate-900 dark:text-white text-xl font-bold">Available Professionals</h2>
                                <Link to="/find-professionals" className="text-primary font-bold text-sm hover:underline">View All (12)</Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {professionals.map((pro) => (
                                    <div key={pro.id} className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex gap-4">
                                            <div
                                                className="w-16 h-16 rounded-full bg-cover bg-center shrink-0"
                                                style={{ backgroundImage: `url("${pro.image}")` }}
                                            ></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pro.name}</h3>
                                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{pro.title}</p>
                                                    </div>
                                                    <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                                        <span className="material-symbols-outlined text-[14px] mr-1">star</span>
                                                        {pro.rating}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex gap-2 flex-wrap">
                                                    {pro.experience && (
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{pro.experience}</span>
                                                    )}
                                                    {pro.languages && (
                                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{pro.languages}</span>
                                                    )}
                                                    {pro.tags && pro.tags.map((tag, idx) => (
                                                        <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-4 border-slate-100 dark:border-slate-800" />
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Starting At</p>
                                                <p className="text-slate-900 dark:text-white font-bold">${pro.price.toLocaleString()}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Link to={`/consultant/${pro.id}`} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Profile</Link>
                                                <button className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-blue-600 shadow-sm">Book Consult</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQ Section */}
                        <section id="faq">
                            <h2 className="text-slate-900 dark:text-white text-xl font-bold mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <div
                                        key={idx}
                                        className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${openFaq === idx ? 'ring-2 ring-primary/20' : ''}`}
                                    >
                                        <button
                                            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                            className="flex justify-between items-center w-full font-medium cursor-pointer p-5 text-slate-900 dark:text-white text-left"
                                        >
                                            <span>{faq.question}</span>
                                            <span className={`material-symbols-outlined transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}>
                                                expand_more
                                            </span>
                                        </button>
                                        {openFaq === idx && (
                                            <div className="text-slate-600 dark:text-slate-400 px-5 pb-5 text-sm leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="mt-8 mb-12">
                            <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                                <div className="relative z-10 max-w-2xl mx-auto">
                                    <h2 className="text-3xl font-bold mb-4">Ready to start your H-1B journey?</h2>
                                    <p className="text-blue-100 mb-8 text-lg">Connect with a verified professional today and get your application process moving.</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link to="/find-professionals" className="bg-white text-primary hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition-colors shadow-lg">
                                            Find a Professional
                                        </Link>
                                        <Link to="/help" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg transition-colors">
                                            Contact Support
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
