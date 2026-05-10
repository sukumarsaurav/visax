import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const expertiseAreas = [
    'Skilled Worker Visa',
    'Family Sponsorship',
    'Study Permits',
    'Asylum & Refugee Protection',
    'Express Entry',
    'Business Immigration',
    'Citizenship Applications',
    'Work Permits'
]

const serviceOfferings = [
    { id: 'consultation', label: 'Consultation' },
    { id: 'document-review', label: 'Document Review' },
    { id: 'application-prep', label: 'Application Preparation' },
    { id: 'full-representation', label: 'Full Representation' }
]

const agencyPlans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 199,
        description: 'Perfect for small firms just getting started.',
        features: ['Up to 3 Team Members', '50 Cases/month', 'Basic Analytics']
    },
    {
        id: 'growth',
        name: 'Growth',
        price: 399,
        description: 'For expanding agencies with active caseloads.',
        features: ['Up to 15 Team Members', '250 Cases/month', 'Advanced Reporting', 'Priority Support'],
        recommended: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 899,
        description: 'Full-scale for large multinational firms.',
        features: ['Unlimited Members', 'Unlimited Cases', 'Dedicated Account Manager', 'API Access']
    }
]

const stepConfig = [
    { number: 1, label: 'Account & Basics', icon: 'badge' },
    { number: 2, label: 'Professional Details', icon: 'work_history' },
    { number: 3, label: 'Business & Plan', icon: 'domain' },
]

// Left panel – shown only when agency reaches step 3, otherwise 2 steps for individuals
function LeftPanel({ step, totalSteps, accountType }) {
    const perks = [
        { icon: 'verified_user', text: 'Verified profile badge' },
        { icon: 'people', text: 'Access 10,000+ active clients' },
        { icon: 'folder_shared', text: 'Full case management suite' },
        { icon: 'payments', text: 'Integrated invoicing' },
        { icon: 'support_agent', text: '24/7 dedicated support' },
    ]

    const visibleSteps = accountType === 'agency' ? stepConfig : stepConfig.slice(0, 2)

    return (
        <div className="hidden lg:flex flex-col justify-between h-full py-10 px-10 bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white">
            {/* Logo */}
            <div>
                <Link to="/" className="flex items-center gap-2.5 mb-12">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                    </div>
                    <span className="text-xl font-black tracking-tight">VisaX</span>
                </Link>

                <div className="flex flex-col gap-2 mb-10">
                    <h2 className="text-3xl font-black leading-tight">Join Our Network<br />of Experts</h2>
                    <p className="text-blue-100 text-sm leading-relaxed">Register to start helping immigrants navigate their journey with confidence.</p>
                </div>

                {/* Step progress */}
                <div className="flex flex-col gap-3 mb-10">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">Registration Progress</p>
                    {visibleSteps.map((s) => {
                        const isDone = step > s.number
                        const isCurrent = step === s.number
                        return (
                            <div key={s.number} className="flex items-center gap-3">
                                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black transition-all ${
                                    isDone
                                        ? 'bg-white text-primary'
                                        : isCurrent
                                            ? 'bg-white/30 text-white ring-2 ring-white'
                                            : 'bg-white/10 text-blue-300'
                                }`}>
                                    {isDone
                                        ? <span className="material-symbols-outlined text-[16px]">check</span>
                                        : s.number
                                    }
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-blue-100' : 'text-blue-300'}`}>
                                        {s.label}
                                    </p>
                                </div>
                                {isCurrent && (
                                    <span className="ml-auto text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Perks */}
            <div className="flex flex-col gap-3 mt-auto">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">What you unlock</p>
                {perks.map((p) => (
                    <div key={p.icon} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-blue-200">{p.icon}</span>
                        <span className="text-sm text-blue-100">{p.text}</span>
                    </div>
                ))}

                <div className="mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-yellow-300 text-[16px]">star</span>
                        <span className="text-sm font-bold">4.9/5 from 500+ professionals</span>
                    </div>
                    <p className="text-xs text-blue-200 leading-relaxed">"VisaX helped me triple my client base in 6 months." — Maria G., Immigration Attorney</p>
                </div>
            </div>
        </div>
    )
}

export default function ProfessionalRegisterPage() {
    const navigate = useNavigate()
    const { signUp } = useAuth()
    const [step, setStep] = useState(1)
    const [accountType, setAccountType] = useState('individual')
    const [submitting, setSubmitting] = useState(false)
    const [errors, setErrors] = useState({})
    const [uploadedFiles, setUploadedFiles] = useState([])
    const fileInputRef = useRef(null)

    // Step 1 - Basic Info
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [phone, setPhone] = useState('')
    const [phoneCode, setPhoneCode] = useState('+1')

    // Step 2 - Professional Details
    const [title, setTitle] = useState('')
    const [experience, setExperience] = useState('')
    const [languages, setLanguages] = useState(['English'])
    const [expertise, setExpertise] = useState([])
    const [services, setServices] = useState([])
    const [bio, setBio] = useState('')

    // Step 3 - Agency Details
    const [agencyName, setAgencyName] = useState('')
    const [registrationNumber, setRegistrationNumber] = useState('')
    const [teamSize, setTeamSize] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [stateName, setStateName] = useState('')
    const [postalCode, setPostalCode] = useState('')
    const [selectedPlan, setSelectedPlan] = useState('growth')

    const totalSteps = accountType === 'agency' ? 3 : 2

    const validateStep1 = () => {
        const e = {}
        if (!firstName.trim()) e.firstName = 'Required'
        if (!lastName.trim()) e.lastName = 'Required'
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Valid email required'
        if (password.length < 8) e.password = 'Minimum 8 characters'
        if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return
        if (step < totalSteps) {
            setStep(step + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            handleSubmit()
        }
    }

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const role = accountType === 'agency' ? 'agency_admin' : 'individual'
            const { error } = await signUp({
                email,
                password,
                fullName: `${firstName} ${lastName}`.trim(),
                role,
            })
            if (error) {
                toast.error(error.message)
            } else {
                navigate('/professional-submitted')
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleExpertise = (area) =>
        setExpertise(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])

    const toggleService = (id) =>
        setServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

    const removeLanguage = (lang) =>
        setLanguages(prev => prev.filter(l => l !== lang))

    const inputCls = (field) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-all
         ${errors[field]
            ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-400 bg-red-50 dark:bg-red-900/10 dark:border-red-700'
            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary'
        }`

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* ── LEFT PANEL ── */}
            <div className="w-[400px] shrink-0 sticky top-0 h-screen overflow-hidden">
                <LeftPanel step={step} totalSteps={totalSteps} accountType={accountType} />
            </div>

            {/* ── RIGHT PANEL (scrollable form) ── */}
            <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-white">
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
                        </div>
                        <span className="font-black">VisaX</span>
                    </Link>
                    <span className="text-xs font-semibold text-slate-500">Step {step} of {totalSteps}</span>
                </div>

                <div className="flex-1 flex flex-col justify-center px-6 py-10 lg:px-12 max-w-[640px] mx-auto w-full">

                    {/* Step heading */}
                    <div className="mb-8">
                        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                            Step {step} of {totalSteps}
                        </p>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                            {step === 1 && 'Account & Basic Details'}
                            {step === 2 && 'Professional Details'}
                            {step === 3 && 'Business Information & Plan'}
                        </h2>
                        {/* Progress bar */}
                        <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* ─── STEP 1 ─── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-7">
                            {/* Account Type */}
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">I'm joining as…</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="account_type"
                                            value="individual"
                                            checked={accountType === 'individual'}
                                            onChange={(e) => setAccountType(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all">
                                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary shrink-0">
                                                <span className="material-symbols-outlined text-xl">person</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Individual Consultant</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Independent lawyers, RCICs, or consultants.</p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 absolute top-4 right-4 text-[18px] transition-opacity">check_circle</span>
                                        </div>
                                    </label>
                                    <label className="relative cursor-pointer">
                                        <input
                                            type="radio"
                                            name="account_type"
                                            value="agency"
                                            checked={accountType === 'agency'}
                                            onChange={(e) => setAccountType(e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all">
                                            <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0">
                                                <span className="material-symbols-outlined text-xl">apartment</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Immigration Agency</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">Firms managing a team of consultants.</p>
                                            </div>
                                            <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100 absolute top-4 right-4 text-[18px] transition-opacity">check_circle</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: ''})) }}
                                            placeholder="Sarah"
                                            className={inputCls('firstName')}
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => { setLastName(e.target.value); setErrors(p => ({...p, lastName: ''})) }}
                                            placeholder="Jenkins"
                                            className={inputCls('lastName')}
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Work Email</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})) }}
                                            placeholder="sarah@immiconsult.com"
                                            className={`${inputCls('email')} pl-9`}
                                        />
                                    </div>
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})) }}
                                            placeholder="Min. 8 characters"
                                            className={inputCls('password')}
                                        />
                                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})) }}
                                            placeholder="Re-enter password"
                                            className={inputCls('confirmPassword')}
                                        />
                                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                                    <div className="flex">
                                        <select
                                            value={phoneCode}
                                            onChange={(e) => setPhoneCode(e.target.value)}
                                            className="rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none"
                                        >
                                            <option value="+1">🇺🇸 +1</option>
                                            <option value="+1-CA">🇨🇦 +1</option>
                                            <option value="+44">🇬🇧 +44</option>
                                            <option value="+91">🇮🇳 +91</option>
                                            <option value="+61">🇦🇺 +61</option>
                                        </select>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="(555) 000-0000"
                                            className="flex-1 rounded-r-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 2 ─── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Immigration Lawyer, RCIC"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Years of Experience</label>
                                    <select
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    >
                                        <option value="">Select experience</option>
                                        <option value="0-2">0–2 Years</option>
                                        <option value="3-5">3–5 Years</option>
                                        <option value="6-10">6–10 Years</option>
                                        <option value="10+">10+ Years</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Languages Spoken</label>
                                <div className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-2 text-sm min-h-[46px] flex items-center gap-2 flex-wrap focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                    {languages.map((lang, idx) => (
                                        <span key={idx} className="bg-blue-50 dark:bg-blue-900/30 text-primary px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                            {lang}
                                            <button type="button" onClick={() => removeLanguage(lang)} className="hover:text-blue-800">
                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Type & press Enter…"
                                        className="flex-1 bg-transparent border-none p-0 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 min-w-[120px] text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                e.preventDefault()
                                                setLanguages(prev => [...prev, e.target.value.trim()])
                                                e.target.value = ''
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Areas of Expertise</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {expertiseAreas.map((area) => (
                                        <label key={area} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer hover:border-primary/50 transition-all ${
                                            expertise.includes(area)
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={expertise.includes(area)}
                                                onChange={() => toggleExpertise(area)}
                                                className="rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{area}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Service Offerings</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {serviceOfferings.map((service) => (
                                        <label key={service.id} className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer hover:border-primary/50 transition-all ${
                                            services.includes(service.id)
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                        }`}>
                                            <input
                                                type="checkbox"
                                                checked={services.includes(service.id)}
                                                onChange={() => toggleService(service.id)}
                                                className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{service.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Credentials & Licences</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files)
                                        setUploadedFiles(prev => {
                                            const existing = prev.map(f => f.name)
                                            const newFiles = files.filter(f => !existing.includes(f.name))
                                            return [...prev, ...newFiles]
                                        })
                                    }}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault()
                                        const files = Array.from(e.dataTransfer.files)
                                        setUploadedFiles(prev => {
                                            const existing = prev.map(f => f.name)
                                            const newFiles = files.filter(f => !existing.includes(f.name))
                                            return [...prev, ...newFiles]
                                        })
                                    }}
                                    className="w-full rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/30 p-6 flex flex-col items-center justify-center gap-2 text-center hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-primary/40 transition-colors cursor-pointer group"
                                >
                                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload or drag & drop</p>
                                    <p className="text-xs text-slate-500">PDF, JPG or PNG (max. 10MB each)</p>
                                </div>
                                {uploadedFiles.length > 0 && (
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        {uploadedFiles.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-primary text-[18px]">
                                                    {file.name.endsWith('.pdf') ? 'picture_as_pdf' : 'image'}
                                                </span>
                                                <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                                <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Professional Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Write a short introduction about yourself…"
                                    rows={4}
                                    maxLength={500}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                />
                                <p className="text-xs text-right text-slate-400">{bio.length}/500</p>
                            </div>
                        </div>
                    )}

                    {/* ─── STEP 3 (Agency only) ─── */}
                    {step === 3 && accountType === 'agency' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Agency Legal Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={agencyName}
                                        onChange={(e) => setAgencyName(e.target.value)}
                                        placeholder="e.g. Global Migration Partners LLC"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Registration Number</label>
                                        <input
                                            type="text"
                                            value={registrationNumber}
                                            onChange={(e) => setRegistrationNumber(e.target.value)}
                                            placeholder="REG-2023-8899"
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Team Size</label>
                                        <select
                                            value={teamSize}
                                            onChange={(e) => setTeamSize(e.target.value)}
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-5">1–5 Employees</option>
                                            <option value="6-20">6–20 Employees</option>
                                            <option value="21-50">21–50 Employees</option>
                                            <option value="50+">50+ Employees</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Business Address</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Street Address"
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all mb-2"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="col-span-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                        <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State/Province" className="col-span-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                        <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal Code" className="col-span-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                    </div>
                                </div>
                            </div>

                            {/* Plan Selection */}
                            <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Choose Your Plan</p>
                                <div className="flex flex-col gap-3">
                                    {agencyPlans.map((plan) => (
                                        <label key={plan.id} className="relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="plan"
                                                value={plan.id}
                                                checked={selectedPlan === plan.id}
                                                onChange={(e) => setSelectedPlan(e.target.value)}
                                                className="peer sr-only"
                                            />
                                            <div className={`flex items-center justify-between p-4 rounded-xl border-2 bg-white dark:bg-slate-800 hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/10 transition-all relative ${
                                                plan.recommended ? 'border-primary shadow-md shadow-primary/10' : 'border-slate-200 dark:border-slate-700'
                                            }`}>
                                                {plan.recommended && (
                                                    <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Recommended</span>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                        selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                        {selectedPlan === plan.id && <span className="size-2 bg-white rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{plan.name}</p>
                                                        <p className="text-xs text-slate-500">{plan.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-4">
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">${plan.price}</p>
                                                    <p className="text-xs text-slate-500">/month</p>
                                                </div>
                                            </div>
                                            {selectedPlan === plan.id && (
                                                <div className="mt-2 px-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {plan.features.map((f, i) => (
                                                            <span key={i} className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                                                                <span className="material-symbols-outlined text-[12px]">check</span>{f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── NAV BUTTONS ─── */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div>
                            {step === 1 ? (
                                <Link to="/professional-register" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Back
                                </Link>
                            ) : (
                                <button onClick={handlePrevious} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Previous
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={submitting}
                            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-primary hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all"
                        >
                            {submitting ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                                    Submitting…
                                </>
                            ) : step === totalSteps ? (
                                <>
                                    Submit Application
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                </>
                            ) : (
                                <>
                                    Continue
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Already have account */}
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">Log in here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
