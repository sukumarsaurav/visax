import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import PublicHeader from '../../components/layout/PublicHeader'
import Footer from '../../components/layout/Footer'
import { supabase } from '../../lib/supabase'
import * as unclaimedProfilesRepo from '../../data/unclaimedProfilesRepo'
import { useSEO } from '../../hooks/useSEO'
import toast from 'react-hot-toast'

const VISA_TYPES = [
    'Canada PR / Express Entry', 'Australia PR', 'UK Skilled Worker',
    'Germany Job Seeker', 'USA H-1B / L1', 'Student Visa', 'Portugal D7', 'Other',
]

export default function UnclaimedProfilePage() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // Enquiry form state
    const [form, setForm] = useState({ name: '', email: '', visaType: '', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    useSEO(profile ? {
        title: `${profile.full_name} — Immigration Consultant${profile.city ? ` in ${profile.city}` : ''}`,
        description: profile.bio
            ? profile.bio.slice(0, 155)
            : `Connect with ${profile.full_name}, an immigration consultant on Immizy. Specialises in ${profile.specializations?.slice(0, 2).join(', ') || 'immigration services'}.`,
    } : { title: 'Immigration Consultant Profile | Immizy' })

    useEffect(() => {
        fetchProfile()
    }, [id])

    async function fetchProfile() {
        const { data, error } = await unclaimedProfilesRepo.getPublic(id)
        if (error || !data) { setNotFound(true) }
        else { setProfile(data) }
        setLoading(false)
    }

    async function handleEnquiry(e) {
        e.preventDefault()
        if (!form.name || !form.email) return
        setSubmitting(true)

        const { error } = await unclaimedProfilesRepo.createEnquiry({
            unclaimedId: id,
            enquirerName: form.name,
            enquirerEmail: form.email,
            visaType: form.visaType,
            message: form.message,
        })

        if (error) {
            toast.error('Failed to send. Please try again.')
            setSubmitting(false)
            return
        }

        // Send magic-link claim notification to consultant via Supabase Auth
        await supabase.auth.signInWithOtp({
            email: profile.email,  // not exposed in UI — fetched via admin path
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/claim-profile`,
                data: { enquirer_name: form.name },
            },
        })

        setSubmitted(true)
        setSubmitting(false)
    }

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#101822]">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-white animate-pulse">
                <span className="material-symbols-outlined material-filled text-2xl">flight_takeoff</span>
            </div>
        </div>
    )

    if (notFound) return <Navigate to="/find-professionals" replace />

    const initials = profile.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-[#101822]">
            <PublicHeader />

            {/* Unclaimed banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0">info</span>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>This profile hasn't been claimed yet.</strong>{' '}
                        Are you {profile.full_name}?{' '}
                        <Link to={`/claim-profile`} className="font-bold underline hover:text-amber-900">
                            Claim your free profile →
                        </Link>
                    </p>
                </div>
            </div>

            <main id="main-content" className="flex-1">
                <div className="max-w-5xl mx-auto px-4 py-10 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* ── Left: Profile info ── */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {/* Header card */}
                            <div className="flex items-start gap-5 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="size-20 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-2xl font-black shrink-0 overflow-hidden">
                                    {profile.avatar_url
                                        ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                                        : initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">{profile.full_name}</h1>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-2 py-0.5 rounded-full">
                                            <span className="material-symbols-outlined text-[12px]">pending</span>
                                            Unclaimed Profile
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                                        {profile.role === 'agency_admin' ? 'Immigration Agency' : 'Immigration Consultant'}
                                        {profile.city ? ` · ${profile.city}` : ''}
                                        {profile.years_experience > 0 ? ` · ${profile.years_experience}+ years experience` : ''}
                                    </p>
                                    {profile.languages?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                            {profile.languages.map(l => (
                                                <span key={l} className="text-xs px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300">
                                                    {l}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div className="p-6 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">About</h2>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{profile.bio}</p>
                                </div>
                            )}

                            {/* Specializations */}
                            {profile.specializations?.length > 0 && (
                                <div className="p-6 bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Specialisations</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specializations.map(s => (
                                            <span key={s} className="text-sm px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Claim CTA */}
                            <div className="p-6 bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/10 rounded-2xl border border-primary/20">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary text-[28px] shrink-0">verified_user</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Is this your profile?</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 mb-4">
                                            Claim it for free to get leads, respond to enquiries, manage cases, and get your verified badge.
                                        </p>
                                        <Link
                                            to="/claim-profile"
                                            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">lock_open</span>
                                            Claim This Profile
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Enquiry form ── */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                {submitted ? (
                                    <div className="text-center py-6">
                                        <span className="material-symbols-outlined text-primary text-[48px]">mark_email_read</span>
                                        <h3 className="font-black text-slate-900 dark:text-white mt-3 mb-2">Enquiry sent!</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            We've notified {profile.full_name} about your enquiry. They'll be in touch soon.
                                        </p>
                                        <p className="text-xs text-slate-400 mt-3">
                                            Want to track this?{' '}
                                            <Link to="/register" className="text-primary font-semibold hover:underline">Create a free account</Link>
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="font-black text-slate-900 dark:text-white text-lg mb-1">Send an enquiry</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                                            We'll notify {profile.full_name} and connect you when they respond.
                                        </p>
                                        <form onSubmit={handleEnquiry} className="flex flex-col gap-3">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Your name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={form.name}
                                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="Raj Sharma"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Your email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={form.email}
                                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                                    placeholder="you@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Visa type</label>
                                                <select
                                                    value={form.visaType}
                                                    onChange={e => setForm(f => ({ ...f, visaType: e.target.value }))}
                                                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">Select visa type…</option>
                                                    {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Message</label>
                                                <textarea
                                                    rows={3}
                                                    value={form.message}
                                                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                                    placeholder="Briefly describe your situation…"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all mt-1"
                                            >
                                                {submitting
                                                    ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                                    : <span className="material-symbols-outlined text-[18px]">send</span>}
                                                {submitting ? 'Sending…' : 'Send Enquiry'}
                                            </button>
                                            <p className="text-[11px] text-slate-400 text-center">
                                                By submitting you agree to our{' '}
                                                <Link to="/privacy" className="underline">Privacy Policy</Link>.
                                            </p>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
