import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { friendlyError } from '../../lib/errors'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { isEmail, checkPassword, passwordStrength } from '../../lib/validators'

export default function RegisterPage() {
    useSEO(SEO.register)
    const navigate = useNavigate()
    const { signUp } = useAuth()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ password: false, confirm: false })

    function validate() {
        const errs = {}
        if (!form.fullName.trim()) errs.fullName = 'Full name is required'
        if (form.fullName.trim().length > 100) errs.fullName = 'Name is too long'
        if (!form.email.trim()) errs.email = 'Email is required'
        else if (!isEmail(form.email.trim())) errs.email = 'Enter a valid email'
        if (!form.password) errs.password = 'Password is required'
        else {
            const pw = checkPassword(form.password, { email: form.email })
            if (!pw.ok) errs.password = pw.error
        }
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
        return errs
    }

    const pwStrength = passwordStrength(form.password)

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setLoading(true)
        const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName, role: 'client' })
        setLoading(false)

        if (error) {
            toast.error(friendlyError(error))
        } else {
            toast.success('Account created! Please check your email to verify.')
            navigate('/client/onboarding')
        }
    }

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
        setErrors(errs => ({ ...errs, [field]: undefined }))
    }

    const inputClass = (field) =>
        `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${errors[field] ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`

    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create your account</h1>
                <p className="mt-1 text-sm text-slate-500">Start your immigration journey with Immizy</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                {[
                    { field: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                    { field: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                    { field: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                    { field: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
                ].map(({ field, label, type, placeholder }) => (
                    <div key={field} className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
                        {type === 'password' ? (
                            <div className="relative">
                                <input
                                    type={showPasswords[field] ? 'text' : 'password'}
                                    value={form[field]}
                                    onChange={set(field)}
                                    placeholder={placeholder}
                                    className={`${inputClass(field)} pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(p => ({ ...p, [field]: !p[field] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    aria-label={showPasswords[field] ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{showPasswords[field] ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        ) : (
                            <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder} className={inputClass(field)}
                                autoComplete={field === 'email' ? 'email' : field === 'fullName' ? 'name' : undefined}
                                maxLength={field === 'fullName' ? 100 : field === 'email' ? 254 : undefined} />
                        )}
                        {/* Inline password strength meter */}
                        {field === 'password' && form.password && (
                            <div className="flex items-center gap-1.5 mt-1">
                                {[0, 1, 2, 3].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                        i < pwStrength
                                            ? pwStrength <= 1 ? 'bg-red-400'
                                            : pwStrength === 2 ? 'bg-amber-400'
                                            : pwStrength === 3 ? 'bg-blue-400'
                                            : 'bg-green-500'
                                            : 'bg-slate-200 dark:bg-slate-700'
                                    }`} />
                                ))}
                                <span className="text-[10px] font-semibold text-slate-500 ml-1 w-12 text-right">
                                    {pwStrength <= 1 ? 'Weak' : pwStrength === 2 ? 'Fair' : pwStrength === 3 ? 'Good' : 'Strong'}
                                </span>
                            </div>
                        )}
                        {errors[field] && <p className="text-xs text-red-500">{errors[field]}</p>}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Creating account…</>
                    ) : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
        </div>
    )
}
