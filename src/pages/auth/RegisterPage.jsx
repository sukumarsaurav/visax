import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { signUp } = useAuth()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    function validate() {
        const errs = {}
        if (!form.fullName.trim()) errs.fullName = 'Full name is required'
        if (!form.email.trim()) errs.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
        if (!form.password) errs.password = 'Password is required'
        else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
        return errs
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setLoading(true)
        const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName, role: 'client' })
        setLoading(false)

        if (error) {
            toast.error(error.message)
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
                <p className="mt-1 text-sm text-slate-500">Start your immigration journey with VisaX</p>
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
                        <input type={type} value={form[field]} onChange={set(field)} placeholder={placeholder} className={inputClass(field)} />
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
