import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const countries = {
    origin: [
        { code: 'MX', name: 'Mexico' },
        { code: 'IN', name: 'India' },
        { code: 'CN', name: 'China' },
        { code: 'PH', name: 'Philippines' },
        { code: 'BR', name: 'Brazil' },
        { code: 'NG', name: 'Nigeria' },
        { code: 'Other', name: 'Other' },
    ],
    destination: [
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'UK', name: 'United Kingdom' },
        { code: 'AU', name: 'Australia' },
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
    ]
}

const services = [
    { id: 'visa', icon: 'badge', title: 'Visa Application', description: 'Student, Work, or Tourist visas' },
    { id: 'citizenship', icon: 'flag', title: 'Citizenship', description: 'Naturalization and dual citizenship' },
    { id: 'asylum', icon: 'gavel', title: 'Asylum & Refugee', description: 'Protection and status adjustment' },
    { id: 'family', icon: 'family_restroom', title: 'Family Reunification', description: 'Bringing family members together' },
    { id: 'legal', icon: 'chat', title: 'General Consultation', description: 'Speak to a lawyer about options' },
    { id: 'translation', icon: 'translate', title: 'Document Translation', description: 'Certified translations for filings' },
]

export default function ProfileSetupPage() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState({
        originCountry: '',
        destinationCountry: '',
        selectedServices: [],
    })

    const progress = Math.round((currentStep / 3) * 100)

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            selectedServices: prev.selectedServices.includes(serviceId)
                ? prev.selectedServices.filter(id => id !== serviceId)
                : [...prev.selectedServices, serviceId]
        }))
    }

    const handleContinue = () => {
        if (currentStep < 3) {
            setCurrentStep(prev => prev + 1)
        } else {
            // Save to localStorage and redirect to dashboard
            localStorage.setItem('immi_profile_setup', JSON.stringify(formData))
            localStorage.setItem('immi_is_new_user', 'true')
            navigate('/client')
        }
    }

    const handleSkip = () => {
        navigate('/client')
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-10 py-3 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-primary">
                        <span className="material-symbols-outlined material-filled text-3xl">flight_takeoff</span>
                    </div>
                    <h2 className="text-lg font-black leading-tight tracking-tight">Immizy</h2>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <button
                        onClick={handleSkip}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold leading-normal transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                        <span className="truncate">Skip Setup</span>
                    </button>
                </div>
            </header>

            <div className="px-5 md:px-40 flex flex-1 justify-center py-5">
                <div className="flex flex-col max-w-[960px] flex-1">
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-3 p-4">
                        <div className="flex gap-6 justify-between">
                            <p className="text-slate-900 dark:text-white text-base font-medium leading-normal">
                                Step {currentStep} of 3
                            </p>
                            <span className="text-sm font-medium text-primary">{progress}% Completed</span>
                        </div>
                        <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 overflow-hidden">
                            <div
                                className="h-2 rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                            {currentStep === 1 && 'Profile Setup'}
                            {currentStep === 2 && 'Service Preferences'}
                            {currentStep === 3 && 'Review & Confirm'}
                        </p>
                    </div>

                    {/* Headline & Subtitle */}
                    <div className="text-center px-4 pt-6 pb-8">
                        <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight pb-3">
                            {currentStep === 1 && 'Tell us about your journey'}
                            {currentStep === 2 && 'What support do you need?'}
                            {currentStep === 3 && 'Review your preferences'}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal max-w-[600px] mx-auto">
                            {currentStep === 1 && "Help us customize your dashboard by answering a few quick questions. We'll match you with the right experts based on your needs."}
                            {currentStep === 2 && 'Select all the services that apply to your immigration needs.'}
                            {currentStep === 3 && "Review your selections below. You can always update these later in your profile settings."}
                        </p>
                    </div>

                    {/* Main Form Area */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">

                        {/* Step 1: Country Selectors */}
                        {currentStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* Origin Country */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal pb-2">
                                        Country of Origin
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.originCountry}
                                            onChange={(e) => setFormData(prev => ({ ...prev, originCountry: e.target.value }))}
                                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary h-14 p-[15px] pr-10 text-base font-normal leading-normal appearance-none transition-colors"
                                        >
                                            <option value="">Select country...</option>
                                            {countries.origin.map((country) => (
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Destination Country */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal pb-2">
                                        Target Destination
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.destinationCountry}
                                            onChange={(e) => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
                                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary h-14 p-[15px] pr-10 text-base font-normal leading-normal appearance-none transition-colors"
                                        >
                                            <option value="">Select country...</option>
                                            {countries.destination.map((country) => (
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Service Selection */}
                        {currentStep === 2 && (
                            <div className="mb-10">
                                <label className="text-slate-900 dark:text-slate-200 text-base font-medium leading-normal block pb-4">
                                    Select all that apply
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {services.map((service) => (
                                        <label key={service.id} className="cursor-pointer group relative">
                                            <input
                                                type="checkbox"
                                                className="peer sr-only"
                                                checked={formData.selectedServices.includes(service.id)}
                                                onChange={() => handleServiceToggle(service.id)}
                                            />
                                            <div className="flex flex-col h-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-700 p-4 transition-all hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-600 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:dark:bg-primary/20 peer-checked:ring-1 peer-checked:ring-primary">
                                                <div className="mb-3 text-primary bg-primary/10 w-fit p-2 rounded-lg">
                                                    <span className="material-symbols-outlined">{service.icon}</span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{service.title}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{service.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Your Journey</h3>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        From <strong>{countries.origin.find(c => c.code === formData.originCountry)?.name || 'Not selected'}</strong> to{' '}
                                        <strong>{countries.destination.find(c => c.code === formData.destinationCountry)?.name || 'Not selected'}</strong>
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Services Needed</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.selectedServices.length > 0 ? (
                                            formData.selectedServices.map(serviceId => {
                                                const service = services.find(s => s.id === serviceId)
                                                return (
                                                    <span
                                                        key={serviceId}
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">{service?.icon}</span>
                                                        {service?.title}
                                                    </span>
                                                )
                                            })
                                        ) : (
                                            <span className="text-slate-500 dark:text-slate-400">No services selected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={handleSkip}
                                className="text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                I'll do this later
                            </button>
                            <button
                                onClick={handleContinue}
                                className="w-full md:w-auto flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-primary text-white text-base font-bold leading-normal transition-transform hover:scale-[1.02] shadow-sm hover:shadow-md"
                            >
                                <span className="truncate">
                                    {currentStep === 3 ? 'Complete Setup' : 'Continue'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Trust Footer */}
                    <div className="flex items-center justify-center gap-2 mt-8 text-slate-400 dark:text-slate-500">
                        <span className="material-symbols-outlined text-lg">lock</span>
                        <p className="text-xs font-medium">Your information is securely encrypted and private.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
