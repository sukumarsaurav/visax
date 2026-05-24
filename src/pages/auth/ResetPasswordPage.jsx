import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { checkPassword } from '../../lib/validators'
import { friendlyError } from '../../lib/errors'

/**
 * Reset-password landing page.
 *
 * Supabase appends #access_token=...&type=recovery to the redirectTo URL.
 * Its client library fires onAuthStateChange with event=PASSWORD_RECOVERY
 * before this component has a chance to render, establishing a temporary
 * recovery session. We just need to:
 *   1. Detect that session / event.
 *   2. Let the user set a new password.
 *   3. Call supabase.auth.updateUser({ password }) — the recovery session
 *      authorises the password change without needing the old password.
 *   4. Sign out + redirect to /login so the user starts fresh.
 *
 * If someone lands here without a valid recovery token (no hash, expired
 * token, already used) the page shows an error and links back to
 * /forgot-password.
 */
export default function ResetPasswordPage() {
    const [status, setStatus] = useState('loading') // loading | form | saving | done | invalid
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        // Supabase fires PASSWORD_RECOVERY when it detects type=recovery in the
        // URL hash and successfully exchanges the token for a session.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setStatus('form')
            }
        })

        // Also handle the case where the component mounts after the event
        // already fired (e.g. hot-reload / StrictMode double-mount).
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // We have a session — it may be a recovery session or a normal
                // session. Only show the form if the URL still has the hash.
                const hash = window.location.hash
                if (hash.includes('type=recovery') || hash.includes('access_token')) {
                    setStatus('form')
                } else {
                    // Normal session, no recovery token — not the right place.
                    setStatus('invalid')
                }
            } else {
                // No session and no event yet — keep loading briefly, then
                // show invalid if nothing arrives within a reasonable window.
                const timeout = setTimeout(() => {
                    setStatus(prev => prev === 'loading' ? 'invalid' : prev)
                }, 3000)
                return () => clearTimeout(timeout)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        const check = checkPassword(password)
        if (!check.ok) { setError(check.error); return }
        if (password !== confirm) { setError('Passwords do not match.'); return }

        setStatus('saving')
        const { error: updateErr } = await supabase.auth.updateUser({ password })
        if (updateErr) {
            setError(friendlyError(updateErr, 'Could not update password. The link may have expired.'))
            setStatus('form')
            return
        }

        // Sign out the recovery session so the user logs in fresh with the new password.
        await supabase.auth.signOut()
        setStatus('done')
    }

    // ── Shared two-panel shell (mirrors AuthLayout without its auth redirect) ──

    function Shell({ children }) {
        return (
            <div className="flex min-h-screen w-full bg-background-light dark:bg-background-dark">
                <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-900" />
                    <div className="relative z-10 p-12 max-w-lg text-white">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                                <span className="material-symbols-outlined material-filled text-2xl">flight_takeoff</span>
                            </div>
                            <span className="text-2xl font-black tracking-tight">Immizy</span>
                        </div>
                        <h2 className="text-4xl font-black leading-tight mb-4">Almost there.</h2>
                        <p className="text-lg text-white/85 leading-relaxed">
                            Set a strong new password and you'll be back on track.
                        </p>
                    </div>
                </div>
                <div className="flex w-full flex-col lg:w-1/2">
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-2 lg:invisible">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined text-lg">flight_takeoff</span>
                            </div>
                            <span className="font-black text-slate-900 dark:text-white">Immizy</span>
                        </div>
                        <Link to="/" className="text-sm font-semibold text-slate-500 transition-colors hover:text-primary dark:text-slate-400">
                            ← Back to Home
                        </Link>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 sm:px-12">
                        {children}
                    </div>
                </div>
            </div>
        )
    }

    // ── Render states ────────────────────────────────────────────────────────

    if (status === 'loading') {
        return (
            <Shell>
                <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                    <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-slate-500">Verifying your reset link…</p>
                </div>
            </Shell>
        )
    }

    if (status === 'invalid') {
        return (
            <Shell>
                <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <span className="material-symbols-outlined text-[32px] text-red-500">link_off</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">Link invalid or expired</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            This password reset link has expired or was already used. Request a new one.
                        </p>
                    </div>
                    <Link
                        to="/forgot-password"
                        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                    >
                        Request new link
                    </Link>
                </div>
            </Shell>
        )
    }

    if (status === 'done') {
        return (
            <Shell>
                <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
                    <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <span className="material-symbols-outlined material-filled text-[32px] text-green-600">check_circle</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white">Password updated</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Your password has been changed. Sign in with your new password.
                        </p>
                    </div>
                    <Link
                        to="/login"
                        className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Sign in
                    </Link>
                </div>
            </Shell>
        )
    }

    // ── Form ─────────────────────────────────────────────────────────────────

    return (
        <Shell>
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Set new password</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Choose a strong password — at least 10 characters with mixed types.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    {/* New password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="rp-password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            New password
                        </label>
                        <div className="relative">
                            <input
                                id="rp-password"
                                type={showPw ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError('') }}
                                placeholder="Min 10 chars, mixed types"
                                required
                                aria-invalid={!!error}
                                aria-describedby={error ? 'rp-error' : undefined}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                                aria-label={showPw ? 'Hide password' : 'Show password'}
                            >
                                <span className="material-symbols-outlined text-[18px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="rp-confirm" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Confirm new password
                        </label>
                        <input
                            id="rp-confirm"
                            type={showPw ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={confirm}
                            onChange={e => { setConfirm(e.target.value); setError('') }}
                            placeholder="Re-enter password"
                            required
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                        />
                    </div>

                    {error && (
                        <p id="rp-error" role="alert" className="text-xs text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={status === 'saving'}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                    >
                        {status === 'saving' ? (
                            <><span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving…</>
                        ) : 'Set new password'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    Remember it now?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                </p>
            </div>
        </Shell>
    )
}
