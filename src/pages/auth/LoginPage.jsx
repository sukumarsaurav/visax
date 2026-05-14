import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { signIn, getDashboardPath } = useAuth()

    const [form, setForm] = useState({ email: '', password: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    function validate() {
        const errs = {}
        if (!form.email.trim()) errs.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
        if (!form.password) errs.password = 'Password is required'
        return errs
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setLoading(true)
        const { error } = await signIn({ email: form.email, password: form.password })
        setLoading(false)

        if (error) {
            toast.error(error.message || 'Invalid email or password')
            setErrors({ password: 'Invalid credentials' })
        } else {
            toast.success('Welcome back!')
            const from = location.state?.from?.pathname
            navigate(from && from !== '/login' ? from : getDashboardPath(), { replace: true })
        }
    }

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
        setErrors(errs => ({ ...errs, [field]: undefined }))
    }

    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome back</h1>
                <p className="mt-1 text-sm text-slate-500">Sign in to your VisaX account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@example.com"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${errors.email ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={set('password')}
                            placeholder="••••••••"
                            className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${errors.password ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in…</>
                    ) : 'Sign In'}
                </button>
            </form>

            <div className="flex flex-col gap-2 text-center text-sm text-slate-500">
                <p>Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create account</Link></p>
                <p>Are you a professional? <Link to="/professional-register" className="font-semibold text-primary hover:underline">Join as a consultant</Link></p>
            </div>
        </div>
    )
}
