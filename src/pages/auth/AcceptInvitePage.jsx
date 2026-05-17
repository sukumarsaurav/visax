import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

function Spinner() {
    return (
        <div className="flex flex-col items-center gap-4 py-16">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined material-filled text-white text-2xl">flight_takeoff</span>
            </div>
            <p className="text-slate-500 text-sm">Checking your invitation…</p>
        </div>
    )
}

export default function AcceptInvitePage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const { user, signIn, signUp, getDashboardPath, loading: authLoading } = useAuth()

    const token = params.get('token')

    const [step, setStep] = useState('loading') // loading | invalid | auth | accepting | done
    const [invitation, setInvitation] = useState(null)
    const [consultant, setConsultant] = useState(null)
    const [tab, setTab] = useState('signup') // signup | signin
    const [error, setError] = useState('')
    const [working, setWorking] = useState(false)

    // Sign up form
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)

    // Sign in form
    const [siEmail, setSiEmail] = useState('')
    const [siPassword, setSiPassword] = useState('')
    const [showSiPass, setShowSiPass] = useState(false)

    // 1. Fetch invitation
    useEffect(() => {
        if (!token) { setStep('invalid'); return }
        fetchInvitation()
    }, [token])

    // 2. If user is already logged in after auth change, accept and redirect
    useEffect(() => {
        if (!authLoading && user && invitation && step === 'auth') {
            acceptAndRedirect(user.id)
        }
    }, [user, authLoading, invitation, step])

    async function fetchInvitation() {
        const { data: inv, error } = await supabase
            .from('client_invitations')
            .select('*, consultant:profiles!client_invitations_consultant_id_fkey(id, full_name, avatar_url)')
            .eq('token', token)
            .single()

        if (error || !inv) { setStep('invalid'); return }
        if (inv.status === 'accepted') { setStep('already_accepted'); return }
        if (inv.status === 'cancelled') { setStep('cancelled'); return }
        if (new Date(inv.expires_at) < new Date()) { setStep('expired'); return }

        setInvitation(inv)
        setConsultant(inv.consultant)

        // Pre-fill email into sign-in field
        setSiEmail(inv.client_email)

        // If already logged in, accept immediately
        if (!authLoading && user) {
            acceptAndRedirect(user.id)
        } else {
            setStep('auth')
        }
    }

    async function acceptAndRedirect(userId) {
        setStep('accepting')
        await supabase
            .from('client_invitations')
            .update({ status: 'accepted', client_id: userId })
            .eq('token', token)
        navigate('/client', { replace: true })
    }

    async function handleSignUp(e) {
        e.preventDefault()
        setError('')
        setWorking(true)

        const { data, error: signUpErr } = await signUp({
            email: invitation.client_email,
            password,
            fullName: name,
            role: 'client',
        })

        if (signUpErr) { setError(signUpErr.message); setWorking(false); return }

        // Accept the invitation immediately with the new user id
        if (data?.user) {
            await acceptAndRedirect(data.user.id)
        } else {
            // Email confirmation required — mark invitation as pending acceptance
            setStep('confirm_email')
        }
        setWorking(false)
    }

    async function handleSignIn(e) {
        e.preventDefault()
        setError('')
        setWorking(true)

        const { data, error: signInErr } = await signIn({ email: siEmail, password: siPassword })
        if (signInErr) { setError(signInErr.message); setWorking(false); return }

        if (data?.user) {
            await acceptAndRedirect(data.user.id)
        }
        setWorking(false)
    }

    // ── Render states ──────────────────────────────────────────────────────

    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <Spinner />
            </div>
        )
    }

    if (step === 'accepting') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 py-16">
                    <div className="size-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined material-filled text-white text-2xl">check_circle</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 font-semibold">Setting up your portal…</p>
                </div>
            </div>
        )
    }

    if (step === 'confirm_email') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Check your email</h2>
                    <p className="text-slate-500 text-sm mb-6">
                        We sent a confirmation link to <strong className="text-slate-700 dark:text-slate-300">{invitation?.client_email}</strong>. Click it to verify your account, then come back to this page.
                    </p>
                    <Link to="/login" className="text-sm text-primary font-semibold hover:underline">Go to login →</Link>
                </div>
            </div>
        )
    }

    if (['invalid', 'expired', 'cancelled', 'already_accepted'].includes(step)) {
        const configs = {
            invalid: { icon: 'link_off', color: 'red', title: 'Invalid invitation', msg: "This invitation link is invalid or doesn't exist." },
            expired: { icon: 'timer_off', color: 'amber', title: 'Invitation expired', msg: 'This invitation has expired. Ask your consultant to send a new one.' },
            cancelled: { icon: 'cancel', color: 'slate', title: 'Invitation cancelled', msg: 'This invitation has been cancelled by your consultant.' },
            already_accepted: { icon: 'check_circle', color: 'emerald', title: 'Already accepted', msg: 'This invitation has already been used. Sign in to access your portal.' },
        }
        const cfg = configs[step]
        const colorMap = { red: 'bg-red-50 text-red-500 dark:bg-red-900/20', amber: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20', slate: 'bg-slate-100 text-slate-400 dark:bg-slate-800', emerald: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20' }

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center">
                    <div className={`size-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${colorMap[cfg.color]}`}>
                        <span className="material-symbols-outlined text-3xl">{cfg.icon}</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">{cfg.title}</h2>
                    <p className="text-slate-500 text-sm mb-6">{cfg.msg}</p>
                    <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">login</span>
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    // ── Main auth screen ───────────────────────────────────────────────────

    const initials = consultant?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined material-filled text-white !text-xl">flight_takeoff</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Immizy</span>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    {/* Invitation banner */}
                    <div className="bg-gradient-to-r from-primary to-indigo-500 px-6 py-5">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30 overflow-hidden">
                                {consultant?.avatar_url
                                    ? <img src={consultant.avatar_url} alt={consultant.full_name} className="w-full h-full object-cover" />
                                    : <span className="text-white font-black text-sm">{initials}</span>
                                }
                            </div>
                            <div className="min-w-0">
                                <p className="text-white/80 text-xs font-medium">Invited by</p>
                                <p className="text-white font-bold text-base leading-tight truncate">{consultant?.full_name}</p>
                            </div>
                            <div className="ml-auto flex-shrink-0">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                    Verified
                                </span>
                            </div>
                        </div>
                        {invitation?.message && (
                            <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                                <p className="text-white/90 text-sm leading-relaxed italic">"{invitation.message}"</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                            {tab === 'signup' ? 'Create your account' : 'Sign in to your account'}
                        </h2>
                        <p className="text-slate-500 text-sm mb-5">
                            {tab === 'signup'
                                ? `Set up your Immizy portal to work with ${consultant?.full_name?.split(' ')[0] || 'your consultant'}.`
                                : 'Use your existing Immizy account to access the portal.'}
                        </p>

                        {/* Tab switcher */}
                        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5">
                            {[{ id: 'signup', label: 'Create Account' }, { id: 'signin', label: 'Sign In' }].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => { setTab(t.id); setError('') }}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <span className="material-symbols-outlined text-red-500 text-[16px] mt-0.5">error</span>
                                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Sign Up Form */}
                        {tab === 'signup' && (
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Your Full Name</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">person</span>
                                        <input
                                            required
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="John Smith"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">mail</span>
                                        <input
                                            type="email"
                                            value={invitation.client_email}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
                                        />
                                        <span className="absolute right-3 top-2.5 material-symbols-outlined text-emerald-500 text-[18px]">lock</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Email is set by your invitation</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Password</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">lock</span>
                                        <input
                                            required
                                            type={showPass ? 'text' : 'password'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Create a strong password"
                                            minLength={8}
                                            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                        <button type="button" onClick={() => setShowPass(v => !v)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                            <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={working}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                                >
                                    {working
                                        ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Creating account…</>
                                        : <><span className="material-symbols-outlined text-[16px]">check_circle</span> Create Account & Accept Invite</>
                                    }
                                </button>
                            </form>
                        )}

                        {/* Sign In Form */}
                        {tab === 'signin' && (
                            <form onSubmit={handleSignIn} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">Email</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">mail</span>
                                        <input
                                            required
                                            type="email"
                                            value={siEmail}
                                            onChange={e => setSiEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                                    </div>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">lock</span>
                                        <input
                                            required
                                            type={showSiPass ? 'text' : 'password'}
                                            value={siPassword}
                                            onChange={e => setSiPassword(e.target.value)}
                                            placeholder="Your password"
                                            className="w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                                        />
                                        <button type="button" onClick={() => setShowSiPass(v => !v)}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                            <span className="material-symbols-outlined text-[18px]">{showSiPass ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={working}
                                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
                                >
                                    {working
                                        ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Signing in…</>
                                        : <><span className="material-symbols-outlined text-[16px]">login</span> Sign In & Accept Invite</>
                                    }
                                </button>
                            </form>
                        )}

                        {/* Portal features */}
                        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">What you'll get access to</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: 'folder_open', label: 'Case tracking' },
                                    { icon: 'upload_file', label: 'Document upload' },
                                    { icon: 'chat', label: 'Secure messaging' },
                                    { icon: 'calendar_month', label: 'Appointments' },
                                ].map(f => (
                                    <div key={f.label} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-[14px] text-primary">{f.icon}</span>
                                        {f.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    By creating an account you agree to our{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    )
}
