import { useFTUE } from './FTUEProvider'

const positions = {
    bottom: 'top-full mt-4',
    top: 'bottom-full mb-4',
    left: 'right-full mr-4',
    right: 'left-full ml-4',
}

const arrows = {
    bottom: 'absolute -top-2 left-8 w-4 h-4 bg-white dark:bg-slate-800 border-t border-l border-slate-100 dark:border-slate-700 transform rotate-45',
    top: 'absolute -bottom-2 left-8 w-4 h-4 bg-white dark:bg-slate-800 border-b border-r border-slate-100 dark:border-slate-700 transform rotate-45',
    left: 'absolute top-8 -right-2 w-4 h-4 bg-white dark:bg-slate-800 border-t border-r border-slate-100 dark:border-slate-700 transform rotate-45',
    right: 'absolute top-8 -left-2 w-4 h-4 bg-white dark:bg-slate-800 border-b border-l border-slate-100 dark:border-slate-700 transform rotate-45',
}

export default function TourTooltip({
    title,
    description,
    position = 'bottom',
    className = '',
    showOnStep,
}) {
    const { currentStep, totalSteps, nextStep, previousStep, skipTour, isActive } = useFTUE()

    if (!isActive || currentStep !== showOnStep) return null

    const isFirstStep = currentStep === 1
    const isLastStep = currentStep === totalSteps

    return (
        <div className={`absolute ${positions[position]} w-full max-w-sm z-[60] ${className}`}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Arrow */}
                <div className={arrows[position]} />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Step {currentStep} of {totalSteps}
                    </span>
                    <button
                        onClick={skipTour}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xs font-medium"
                    >
                        Skip Tour
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={previousStep}
                        disabled={isFirstStep}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isFirstStep
                                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : 'text-slate-600 hover:text-primary hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
                            }`}
                    >
                        Previous
                    </button>
                    <button
                        onClick={nextStep}
                        className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        {isLastStep ? 'Finish Tour' : 'Next'}
                        <span className="material-symbols-outlined text-[16px]">
                            {isLastStep ? 'check' : 'arrow_forward'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
