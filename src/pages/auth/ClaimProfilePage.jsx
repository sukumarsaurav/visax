import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { friendlyError } from '../../lib/errors'
import { useSEO } from '../../hooks/useSEO'
import toast from 'react-hot-toast'
import * as unclaimedProfilesRepo from '../../data/unclaimedProfilesRepo'

// Steps: 'lookup' → 'preview' → 'signup' → 'set_password' → 'done'

export default function ClaimProfilePage() {
    useSEO({
        title: 'Claim Your Immizy Profile | Free for Immigration Consultants',
        description: 'Claim your pre-created Immizy profile to start receiving leads, managing cases, and getting your verified badge.',
    })

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const tokenFromUrl = searchParams.get('token')

    const [step, setStep] = useState('lookup')      // lookup | preview | signup | set_password | done
    const [token, setToken] = useState(tokenFromUrl || '')
    const [profile, setProfile] = useState(null)    // data from get_unclaimed_profile_by_token
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Signup form
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPw, setShowPw] = useState(false)

    // New password form (for set_password step — after magic link)
    const [newPw, setNewPw] = useState('')
    const [confirmNewPw, setConfirmNewPw] = useState('')

    // On mount: if authenticated + token in URL → jump straight to claiming
    useEffect(() => {
        async function detectSession() {
            const { data: { session } } = await supabase.auth.getSession()
            if (session && tokenFromUrl) {
                // User came back via magic link and has a token — go claim
                setStep('set_password')
            } else if (tokenFromUrl) {
                lookupToken(tokenFromUrl)
            }
        }
        detectSession()
    }, [tokenFromUrl])

    async function lookupToken(t = token) {
        if (!t.trim()) { setError('Please enter a claim token.'); return }
        setLoading(true)
        setError('')
        const { data, error: rpcErr } = await unclaimedProfilesRepo.getByToken(t.trim())
        setLoading(false)
        if (rpcErr || data?.error) {
            setError(data?.error || 'Invalid or expired claim link. Please ask for a new one.')
            return
        }
        setProfile(data)
        setStep('preview')
    }

    async function handleSignup(e) {
        e.preventDefault()
        if (password !== confirmPassword) { setError('Passwords do not match.'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
        setError('')
        setLoading(true)

        // Sign up with the email from the unclaimed profile
        const { data: signupData, error: signupErr } = await supabase.auth.signUp({
            email: profile.email,
            password,
            options: {
                data: { role: profile.role, full_name: profile.full_name },
            },
        })

        if (signupErr) {
            setError(friendlyError(signupErr))
            setLoading(false)
            return
        }

        // If email confirmation is required, the session won't exist yet.
        // If auto-confirm is on (common in dev), we can claim immediately.
        const session = signupData?.session
        if (session) {
            await runClaim()
        } else {
            // Email confirmation needed — show instructions
            setStep('confirm_email')
        }
        setLoading(false)
    }

    async function runClaim() {
        setLoading(true)
        const { data, error: claimErr } = await unclaimedProfilesRepo.claim(token || tokenFromUrl)
        if (claimErr || data?.error) {
            setError(data?.error || 'Claim failed. Please try again or contact support.')
            setLoading(false)
            return
        }
        setLoading(false)
        setStep('done')
    }

    async function handleSetPassword(e) {
        e.preventDefault()
        if (newPw !== confirmNewPw) { setError('Passwords do not match.'); return }
        if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return }
        setError('')
        setLoading(true)

        const { error: pwErr } = await supabase.auth.updateUser({ password: newPw })
        if (pwErr) { setError(friendlyError(pwErr)); setLoading(false); return }

        await runClaim()
    }

    const initials = profile?.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
            {/* Left panel — brand */}
            <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between py-12 px-10 bg-gradient-to-br from-primary via-blue-600 to-blue-800 text-white">
                <Link to="/" className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 text-white">
                        <span className="material-symbols-outlined material-filled text-xl">flight_takeoff</span>
                    </div>
                    <span className="text-xl font-black tracking-tight">Immizy</span>
                </Link>
                <div>
                    <h2 className="text-3xl font-black leading-tight mb-4">
                        Your profile is waiting for you.
                    </h2>
                    <p className="text-blue-100 text-sm leading-relaxed mb-8">
                        Claim it in 2 minutes and start receiving leads, managing cases, and building your verified reputation on Immizy.
                    </p>
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: 'trending_up', text: 'Get inbound leads from ready-to-hire clients' },
                            { icon: 'verified_user', text: 'Earn your Verified badge after approval' },
                            { icon: 'folder_shared', text: 'Manage cases, invoices & docs in one place' },
                        ].map(f => (
                            <div key={f.icon} className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-blue-200 text-[20px] shrink-0 mt-0.5">{f.icon}</span>
                                <p className="text-sm text-blue-100">{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-xs text-blue-200">© 2026 Immizy Inc.</p>
            </div>

            {/* Right panel — form */}
            <div className="flex flex-1 flex-col">
                {/* Mobile top bar */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 lg:hidden">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined material-filled text-lg">flight_takeoff</span>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">Immizy</span>
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center p-8">
                    <div className="w-full max-w-md">

                        {/* ── Step: Lookup ── */}
                        {step === 'lookup' && (
                            <div>
                                <span className="material-symbols-outlined text-primary text-[36px]">lock_open</span>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 mb-1">Claim your profile</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Enter the claim token from the email we sent you.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <input
                                        type="text"
                                        value={token}
                                        onChange={e => setToken(e.target.value)}
                                        placeholder="Paste your claim token here"
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                                    />
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                    <button
                                        onClick={() => lookupToken()}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        {loading
                                            ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                            : <span className="material-symbols-outlined text-[18px]">search</span>}
                                        {loading ? 'Looking up…' : 'Find My Profile'}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-6 text-center">
                                    Don't have a token?{' '}
                                    <Link to="/professional-register" className="text-primary hover:underline font-semibold">Register from scratch</Link>
                                </p>
                            </div>
                        )}

                        {/* ── Step: Preview ── */}
                        {step === 'preview' && profile && (
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Is this you?</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Confirm your details and set a password to activate your account.
                                </p>

                                {/* Profile preview card */}
                                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                                    <div className="size-14 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                                        {profile.avatar_url
                                            ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-xl" />
                                            : initials}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white">{profile.full_name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {profile.role === 'agency_admin' ? 'Agency' : 'Consultant'}
                                            {profile.city ? ` · ${profile.city}` : ''}
                                        </p>
                                        <p className="text-sm text-primary font-mono mt-0.5">{profile.email}</p>
                                    </div>
                                </div>

                                {profile.specializations?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {profile.specializations.slice(0, 4).map(s => (
                                            <span key={s} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{s}</span>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep('signup')}
                                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all mb-3"
                                >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                    Yes, this is me — Set my password
                                </button>
                                <button
                                    onClick={() => { setStep('lookup'); setProfile(null) }}
                                    className="w-full text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-2"
                                >
                                    ← That's not me
                                </button>
                            </div>
                        )}

                        {/* ── Step: Signup / Set Password ── */}
                        {(step === 'signup' || step === 'set_password') && (
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                    {step === 'set_password' ? 'Set your password' : 'Create your account'}
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    {step === 'set_password'
                                        ? "You're authenticated via magic link. Set a password to log in with next time."
                                        : `Your account will use email: ${profile?.email}`}
                                </p>

                                <form onSubmit={step === 'set_password' ? handleSetPassword : handleSignup} className="flex flex-col gap-4">
                                    {step === 'signup' && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Email (locked)</label>
                                            <input
                                                type="email"
                                                value={profile?.email || ''}
                                                disabled
                                                className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                                            {step === 'set_password' ? 'New password' : 'Password'} *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPw ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={step === 'set_password' ? newPw : password}
                                                onChange={e => step === 'set_password' ? setNewPw(e.target.value) : setPassword(e.target.value)}
                                                placeholder="Min 8 characters"
                                                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 pr-11 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <span className="material-symbols-outlined text-[18px]">{showPw ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Confirm password *</label>
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            required
                                            value={step === 'set_password' ? confirmNewPw : confirmPassword}
                                            onChange={e => step === 'set_password' ? setConfirmNewPw(e.target.value) : setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter password"
                                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    {error && <p className="text-sm text-red-500">{error}</p>}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all"
                                    >
                                        {loading
                                            ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                            : <span className="material-symbols-outlined text-[18px]">lock_open</span>}
                                        {loading ? 'Claiming…' : 'Activate My Profile'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ── Step: Confirm email ── */}
                        {step === 'confirm_email' && (
                            <div className="text-center">
                                <span className="material-symbols-outlined text-primary text-[48px]">mark_email_read</span>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3 mb-2">Check your email</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    We sent a confirmation link to <strong className="text-slate-700 dark:text-slate-200">{profile?.email}</strong>.
                                    Click it to activate your account, then come back here to complete your profile claim.
                                </p>
                                <p className="text-xs text-slate-400">Didn't receive it? Check your spam folder.</p>
                            </div>
                        )}

                        {/* ── Step: Done ── */}
                        {step === 'done' && (
                            <div className="text-center">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30 mx-auto">
                                    <span className="material-symbols-outlined text-green-600 text-[36px]">verified_user</span>
                                </div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-4 mb-2">Profile claimed!</h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Your profile is now live and under review. We'll notify you when you're approved and verified.
                                </p>
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-all"
                                >
                                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                    Go to Dashboard
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
