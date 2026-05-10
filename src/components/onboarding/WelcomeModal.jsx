import { useFTUE } from './FTUEProvider'

export default function WelcomeModal({ userName = 'there', onClose }) {
    const { startTour, skipTour } = useFTUE()

    const handleStartTour = () => {
        startTour()
        onClose?.()
    }

    const handleExplore = () => {
        skipTour()
        onClose?.()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            {/* Modal Card */}
            <div className="w-full max-w-[800px] overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex flex-col md:flex-row">
                    {/* Hero Image Side */}
                    <div className="relative w-full md:w-5/12 h-48 md:h-auto bg-slate-100 dark:bg-slate-700">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop')`
                            }}
                        />
                        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                        {/* Decorative Icon */}
                        <div className="absolute top-4 left-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-md">
                            <span className="material-symbols-outlined text-primary text-xl">handshake</span>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="flex flex-1 flex-col justify-center p-6 md:p-10">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                                Verified Account
                            </span>
                        </div>

                        <h1 className="mb-3 text-2xl md:text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                            Welcome, {userName}!
                        </h1>

                        <p className="mb-8 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                            We're glad you're here. Our marketplace connects you with verified legal, housing, and career experts to help you settle in faster. Let's take a quick look around your new dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Primary Action: Start Tour */}
                            <button
                                onClick={handleStartTour}
                                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            >
                                <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                <span>Start 2-Minute Tour</span>
                            </button>

                            {/* Secondary Action: Skip */}
                            <button
                                onClick={handleExplore}
                                className="flex items-center justify-center gap-2 rounded-lg bg-transparent px-6 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-white"
                            >
                                <span>Explore on my own</span>
                            </button>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            <p>You can always restart the tour from your profile settings.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
