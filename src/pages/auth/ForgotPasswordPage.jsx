import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { isEmail } from '../../lib/validators'
import { friendlyError } from '../../lib/errors'
import { useRateLimit } from '../../hooks/useRateLimit'

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        const trimmed = email.trim()
        if (!trimmed) { setError('Email is required'); return }
        if (!isEmail(trimmed)) { setError('Enter a valid email'); return }

        setLoading(true)
        const { error: err } = await resetPassword(trimmed)
        setLoading(false)

        if (err) {
            const msg = err.status === 429
                ? 'Too many attempts. Please wait a moment and try again.'
                : friendlyError(err, 'Could not send reset email. Please try again.')
            toast.error(msg)
        } else {
            setSent(true)
        }
    }

    // F-FP05: client-side rate limit on reset requests
    const limitedSubmit = useRateLimit(handleSubmit, {
        max: 3,
        windowMs: 60_000,
        onLimit: () => toast.error('Too many reset requests. Wait a minute and try again.'),
    })

    if (sent) {
        return (
            <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <span className="material-symbols-outlined material-filled text-[32px] text-green-600">mark_email_read</span>
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white">Check your email</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        If an account exists for <strong className="text-slate-700 dark:text-slate-300">{email}</strong>, a reset link is on its way. Check your inbox and spam folder.
                    </p>
                </div>
                <Link to="/login" className="text-sm font-semibold text-primary hover:underline">Back to sign in</Link>
            </div>
        )
    }

    return (
        <div className="flex w-full max-w-sm flex-col gap-6">
            <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reset password</h1>
                <p className="mt-1 text-sm text-slate-500">Enter your email and we'll send you a reset link</p>
            </div>

            <form onSubmit={limitedSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="forgot-email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        placeholder="you@example.com"
                        aria-invalid={!!error}
                        aria-describedby={error ? 'forgot-email-error' : undefined}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`}
                    />
                    {error && <p id="forgot-email-error" className="text-xs text-red-500">{error}</p>}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                >
                    {loading ? (
                        <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Sending…</>
                    ) : 'Send Reset Link'}
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                Remember your password? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
            </p>
        </div>
    )
}
