import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth()
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!email.trim()) { setError('Email is required'); return }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }

        setLoading(true)
        const { error: err } = await resetPassword(email)
        setLoading(false)

        if (err) toast.error(err.message)
        else setSent(true)
    }

    if (sent) {
        return (
            <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <span className="material-symbols-outlined text-[32px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                </div>
                <div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white">Check your email</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        We sent a password reset link to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        placeholder="you@example.com"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-slate-800 dark:text-white ${error ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 bg-white dark:border-slate-700'}`}
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
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
