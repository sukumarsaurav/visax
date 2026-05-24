import { useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { friendlyError } from '../../lib/errors'
import { useSEO } from '../../hooks/useSEO'
import { SEO } from '../../lib/seo'
import { isEmail } from '../../lib/validators'
import { useRateLimit } from '../../hooks/useRateLimit'

// Allow only in-app paths (no protocol-relative, no absolute URL) for
// post-login redirect — prevents open-redirect via crafted router state.
function safeNext(from) {
    if (typeof from !== 'string') return null
    if (!from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) return null
    try { new URL(from); return null } catch { /* relative — good */ }
    return from === '/login' ? null : from
}

export default function LoginPage() {
    useSEO(SEO.login)
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
        else if (!isEmail(form.email.trim())) errs.email = 'Enter a valid email'
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
            const msg = error.status === 429
                ? 'Too many attempts. Please wait a moment and try again.'
                : friendlyError(error, 'Invalid email or password')
            toast.error(msg)
            // Form-level error (not field-specific) so we don't accidentally
            // confirm which of email/password was wrong.
            setErrors({ form: msg })
        } else {
            toast.success('Welcome back!')
            const next = safeNext(location.state?.from?.pathname)
            navigate(next ?? getDashboardPath(), { replace: true })
        }
    }

    // F-L06: client-side rate limit — UX guard, not a security control
    // (server enforces its own quota; this prevents accidental burst-clicks)
    const limitedSubmit = useRateLimit(handleSubmit, {
        max: 5,
        windowMs: 60_000,
        onLimit: () => toast.error('Too many sign-in attempts. Wait a moment and try again.'),
    })

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }))
        setErrors(errs => ({ ...errs, [field]: undefined }))
    }

    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome back</h1>
                <p className="mt-1 text-sm text-slate-500">Sign in to your Immizy account</p>
            </div>

            <form onSubmit={limitedSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="login-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'login-email-error' : undefined}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${errors.email ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`}
                    />
                    {errors.email && <p id="login-email-error" className="text-xs text-red-500">{errors.email}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="relative">
                        <input
                            id="login-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={form.password}
                            onChange={set('password')}
                            placeholder="••••••••"
                            aria-invalid={!!errors.password}
                            aria-describedby={errors.password ? 'login-password-error' : undefined}
                            className={`w-full rounded-lg border px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${errors.password ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                    </div>
                    {errors.password && <p id="login-password-error" className="text-xs text-red-500">{errors.password}</p>}
                </div>

                {errors.form && (
                    <p role="alert" className="text-xs text-red-500 -mt-1">{errors.form}</p>
                )}

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
