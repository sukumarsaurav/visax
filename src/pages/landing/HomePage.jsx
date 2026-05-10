import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Footer from '../../components/layout/Footer'
// Featured consultant placeholders (real data loads from /find-professionals)
const consultants = [
    { id: 1, name: 'Elena Rodriguez', title: 'Immigration Attorney', rating: 4.9, reviews: 120 },
    { id: 2, name: 'James Wilson', title: 'Visa Specialist', rating: 4.8, reviews: 95 },
]

const features = [
    { icon: 'search', title: 'Find Experts', description: 'Browse verified immigration consultants and attorneys' },
    { icon: 'calendar_month', title: 'Book Consultations', description: 'Schedule appointments that fit your timeline' },
    { icon: 'folder_shared', title: 'Track Progress', description: 'Monitor your case status in real-time' },
    { icon: 'verified_user', title: 'Verified Pros', description: 'All professionals are vetted and certified' }
]

const steps = [
    { number: 1, title: 'Create Your Profile', description: 'Sign up and tell us about your immigration needs' },
    { number: 2, title: 'Find a Professional', description: 'Browse and compare verified consultants' },
    { number: 3, title: 'Book a Consultation', description: 'Schedule a video call or in-person meeting' },
    { number: 4, title: 'Get Expert Guidance', description: 'Receive personalized advice for your journey' }
]

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101822]/90 backdrop-blur-md px-6 md:px-10 py-3">
                <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                    </div>
                    <h2 className="text-lg font-black tracking-tight">VisaX</h2>
                </Link>
                <div className="flex flex-1 justify-end gap-8">
                    <nav className="hidden md:flex items-center gap-9">
                        <Link to="/services" className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors">Services</Link>
                        <a className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#features">Features</a>
                        <a className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors" href="#how-it-works">How it Works</a>
                        <Link to="/professional-register" className="text-slate-700 dark:text-slate-200 text-sm font-medium hover:text-primary transition-colors">For Professionals</Link>
                    </nav>
                    <div className="flex gap-2">
                        <Link to="/login">
                            <Button variant="secondary">Log In</Button>
                        </Link>
                        <Link to="/register" className="hidden sm:block">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-white to-blue-50 dark:from-slate-900 dark:via-background-dark dark:to-slate-800 py-20 md:py-32">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold w-fit">
                                <span className="material-symbols-outlined text-[18px]">verified</span>
                                Trusted by 10,000+ immigrants worldwide
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                Your Immigration Journey, <span className="text-primary">Simplified</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
                                Connect with verified immigration professionals, track your applications, and navigate the process with confidence.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                <Link to="/find-professionals">
                                    <Button size="lg" icon="arrow_forward" iconPosition="right">
                                        Find a Professional
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="lg" variant="outline">
                                        Join as a Consultant
                                    </Button>
                                </Link>
                            </div>
                            {/* Trust indicators */}
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="size-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700"></div>
                                    ))}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex text-amber-500 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-[16px]">star</span>
                                        ))}
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-white">4.9/5</span> from 2,000+ reviews
                                </div>
                            </div>
                        </div>
                        <div className="relative hidden lg:block">
                            <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl"></div>
                            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar src={consultants[0].avatar} size="lg" />
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{consultants[0].name}</h3>
                                        <p className="text-sm text-slate-500">{consultants[0].title}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary ml-auto">verified</span>
                                </div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-amber-500 text-[18px]">star</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{consultants[0].rating}</span>
                                    <span className="text-slate-500 text-sm">({consultants[0].reviews} reviews)</span>
                                </div>
                                <Button className="w-full" icon="calendar_month">Book Consultation</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                            Everything You Need for Your Immigration Journey
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            We provide all the tools and resources to make your immigration process seamless and stress-free.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800 hover:shadow-lg transition-shadow">
                                <div className="size-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-background-dark">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Get started in just a few simple steps.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step) => (
                            <div key={step.number} className="relative">
                                <div className="flex flex-col items-center text-center">
                                    <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-primary/30">
                                        {step.number}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                                </div>
                                {step.number < 4 && (
                                    <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/register">
                            <Button size="lg" icon="arrow_forward" iconPosition="right">
                                Get Started Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                        Join thousands of satisfied clients who have successfully navigated their immigration process with our platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-slate-100">
                                Create Free Account
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    )
}
