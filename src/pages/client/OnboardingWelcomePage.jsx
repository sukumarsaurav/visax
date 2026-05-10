import { Link } from 'react-router-dom'

const valueProps = [
    {
        icon: 'verified',
        title: 'Verified Professionals',
        description: 'Every expert is vetted for credentials and experience.'
    },
    {
        icon: 'lock',
        title: 'Secure Document Handling',
        description: 'Your sensitive data is protected with bank-level encryption.'
    },
    {
        icon: 'translate',
        title: 'Multilingual Support',
        description: 'Get help in the language you are most comfortable with.'
    }
]

const userAvatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
]

export default function OnboardingWelcomePage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 lg:px-10">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                    <div className="flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
                    </div>
                    <h2 className="text-lg font-black leading-tight tracking-tight">VisaX</h2>
                </div>
                <Link
                    to="/login"
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal transition-colors"
                >
                    <span className="truncate">Log In</span>
                </Link>
            </header>

            {/* Main Content Area */}
            <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 lg:px-20 lg:py-12">
                <div className="flex flex-col max-w-[1200px] w-full flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                        {/* Left Column: Content */}
                        <div className="flex flex-col gap-8 lg:pr-8 order-2 lg:order-1">
                            <div className="flex flex-col gap-4">
                                <span className="text-primary font-bold tracking-wide uppercase text-sm">
                                    Welcome to VisaX
                                </span>
                                <h1 className="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                                    Your Journey <br />Starts Here
                                </h1>
                                <h2 className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-[500px]">
                                    Connect with trusted immigration lawyers and consultants who understand your story and can guide you every step of the way.
                                </h2>
                            </div>

                            {/* Value Props List */}
                            <div className="flex flex-col gap-5">
                                {valueProps.map((prop) => (
                                    <div key={prop.icon} className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <span className="material-symbols-outlined text-[20px]">{prop.icon}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-slate-900 dark:text-white text-base font-bold leading-tight">
                                                {prop.title}
                                            </h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                                                {prop.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Area */}
                            <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:items-center">
                                <Link
                                    to="/client/profile-setup"
                                    className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-wide transition-colors shadow-lg shadow-primary/20"
                                >
                                    <span className="truncate">Get Started</span>
                                </Link>
                                <Link
                                    to="/login"
                                    className="text-slate-500 hover:text-primary text-sm font-semibold leading-normal underline px-4 transition-colors text-center sm:text-left"
                                >
                                    Already have an account? Log in
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Hero Visual */}
                        <div className="relative order-1 lg:order-2 w-full h-full min-h-[300px] lg:min-h-[600px] flex flex-col justify-center">
                            {/* Decorative backgrounds */}
                            <div className="absolute -right-10 -top-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                            <div className="absolute -left-10 bottom-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10" />

                            {/* Main Image */}
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-cover rounded-2xl shadow-2xl shadow-slate-200 dark:shadow-slate-900 overflow-hidden relative aspect-[4/3] lg:aspect-auto lg:h-[600px]"
                                style={{
                                    backgroundImage: `url('https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1469&auto=format&fit=crop')`
                                }}
                            >
                                {/* Trust Badge Overlay */}
                                <div className="absolute bottom-6 left-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
                                    <div className="flex items-center gap-3">
                                        {/* Stacked Avatars */}
                                        <div className="flex -space-x-2">
                                            {userAvatars.map((avatar, index) => (
                                                <div
                                                    key={index}
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 bg-cover"
                                                    style={{ backgroundImage: `url('${avatar}')` }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                Trusted by 10,000+ families
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className="material-symbols-outlined text-yellow-400 text-[14px]">star</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
