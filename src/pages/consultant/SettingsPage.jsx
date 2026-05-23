import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import AvatarUpload from '../../components/ui/AvatarUpload'
import { uploadAvatar } from '../../lib/storage'
import toast from 'react-hot-toast'
import * as profilesRepo from '../../data/profilesRepo'

/* ─── Primitives ─────────────────────────────────────────── */

function Card({ title, description, children, className = '' }) {
    return (
        <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
            {(title || description) && (
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    {title && <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>}
                    {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    )
}

function Field({ label, hint, span2 = false, children }) {
    return (
        <div className={span2 ? 'col-span-2' : ''}>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
        </div>
    )
}

function Input({ icon, readOnly, className = '', ...props }) {
    return (
        <div className="relative">
            {icon && (
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">{icon}</span>
            )}
            <input
                readOnly={readOnly}
                className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 ${icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all ${readOnly ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
                {...props}
            />
        </div>
    )
}

function Toggle({ value, onChange, label, description }) {
    return (
        <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{label}</p>
                {description && <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(!value)}
                className={`relative shrink-0 inline-flex h-5 w-9 items-center rounded-full transition-colors mt-0.5 ${value ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <span className={`inline-block size-3.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
        </div>
    )
}

const ROLE_LABELS = { individual: 'Consultant', agency_admin: 'Agency Admin', agency_member: 'Team Member', client: 'Client', admin: 'Admin' }
const INDIAN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat', 'Lucknow', 'Kochi', 'Chandigarh']

/* ─── Page ───────────────────────────────────────────────── */

export default function SettingsPage() {
    const { user, profile: authProfile, signOut } = useAuth()
    const [loading, setLoading] = useState(true)
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingNotifs, setSavingNotifs] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [savingLocale, setSavingLocale] = useState(false)

    const [profile, setProfile] = useState({
        full_name: '', email: '', phone: '', bio: '',
        city: '', years_experience: '', consultation_fee: '',
        license_number: '', website: '', linkedin_url: '',
        languages: '', specializations: '', avatar_url: '',
        role: '',
    })

    const [notifications, setNotifications] = useState({
        case_updates_email: true, case_updates_push: true,
        messages_email: true, messages_push: false, marketing_email: false,
    })

    const [passwords, setPasswords] = useState({ new: '', confirm: '' })
    const [language, setLanguage] = useState('en-IN')
    const [timezone, setTimezone] = useState('Asia/Kolkata')

    useEffect(() => { if (user) fetchProfile() }, [user])

    async function fetchProfile() {
        setLoading(true)
        const { data } = await profilesRepo.getFullProfile(user.id)
        if (data) {
            setProfile({
                full_name: data.full_name || '',
                email: data.email || user.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                city: data.city || '',
                years_experience: data.years_experience || '',
                consultation_fee: data.consultation_fee || '',
                license_number: data.license_number || '',
                website: data.website || '',
                linkedin_url: data.linkedin_url || '',
                languages: (data.languages || []).join(', '),
                specializations: (data.specializations || []).join(', '),
                avatar_url: data.avatar_url || '',
                role: data.role || '',
            })
            if (data.notification_preferences) {
                setNotifications(p => ({ ...p, ...data.notification_preferences }))
            }
        }
        setLoading(false)
    }

    async function handleAvatarUpload(file) {
        // uploadAvatar() already persists profile.avatar_url; we just sync local state.
        const url = await uploadAvatar(file, user.id)
        setProfile(p => ({ ...p, avatar_url: url }))
        toast.success('Profile photo updated!')
        return url
    }

    async function saveProfile(e) {
        e.preventDefault()
        setSavingProfile(true)
        const { error } = await profilesRepo.updateBare(user.id, {
            full_name: profile.full_name,
            phone: profile.phone || null,
            bio: profile.bio || null,
            city: profile.city || null,
            years_experience: parseInt(profile.years_experience) || null,
            consultation_fee: parseFloat(profile.consultation_fee) || null,
            license_number: profile.license_number || null,
            website: profile.website || null,
            linkedin_url: profile.linkedin_url || null,
            languages: profile.languages.split(',').map(s => s.trim()).filter(Boolean),
            specializations: profile.specializations.split(',').map(s => s.trim()).filter(Boolean),
        })
        setSavingProfile(false)
        if (error) toast.error(error.message)
        else toast.success('Profile saved!')
    }

    async function saveNotifications() {
        setSavingNotifs(true)
        await profilesRepo.updateBare(user.id, { notification_preferences: notifications })
        setSavingNotifs(false)
        toast.success('Notification preferences saved!')
    }

    async function savePassword(e) {
        e.preventDefault()
        if (passwords.new.length < 8) { toast.error('Minimum 8 characters'); return }
        if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return }
        setSavingPassword(true)
        const { error } = await supabase.auth.updateUser({ password: passwords.new })
        setSavingPassword(false)
        if (error) toast.error(error.message)
        else { toast.success('Password updated!'); setPasswords({ new: '', confirm: '' }) }
    }

    async function saveLocale() {
        setSavingLocale(true)
        await profilesRepo.updateBare(user.id, { locale: language, timezone })
        setSavingLocale(false)
        toast.success('Preferences saved!')
    }

    const specs = profile.specializations.split(',').map(s => s.trim()).filter(Boolean)

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3 h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="lg:col-span-2 h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-5">

            {/* ── Profile hero card ─────────────────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Top gradient banner */}
                <div className="h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 relative">
                    <div className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="px-6 pb-5">
                    {/* Avatar overlapping the banner */}
                    <div className="flex items-end gap-5 -mt-10 mb-4">
                        <div className="relative">
                            <div className="ring-4 ring-white dark:ring-slate-900 rounded-full">
                                <AvatarUpload
                                    currentUrl={profile.avatar_url}
                                    name={profile.full_name}
                                    onUpload={handleAvatarUpload}
                                    size="lg"
                                />
                            </div>
                        </div>
                        <div className="pb-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                    {profile.full_name || 'Your Name'}
                                </h1>
                                {profile.role && (
                                    <span className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {ROLE_LABELS[profile.role] || profile.role}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{profile.email}</p>
                        </div>
                    </div>

                    {/* Quick stats row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        {profile.city && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                                {profile.city}
                            </div>
                        )}
                        {profile.years_experience && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[15px] text-slate-400">work_history</span>
                                {profile.years_experience} yrs experience
                            </div>
                        )}
                        {profile.consultation_fee && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[15px] text-slate-400">currency_rupee</span>
                                ₹{Number(profile.consultation_fee).toLocaleString('en-IN')}/session
                            </div>
                        )}
                        {profile.website && (
                            <a href={profile.website} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                <span className="material-symbols-outlined text-[15px]">language</span>
                                Website
                            </a>
                        )}
                        {profile.linkedin_url && (
                            <a href={profile.linkedin_url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                <span className="material-symbols-outlined text-[15px]">link</span>
                                LinkedIn
                            </a>
                        )}
                        {specs.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {specs.slice(0, 3).map(s => (
                                    <span key={s} className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
                                ))}
                                {specs.length > 3 && <span className="text-[11px] text-slate-400">+{specs.length - 3} more</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Two-column grid ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

                {/* LEFT — profile form (3/5) */}
                <form onSubmit={saveProfile} className="lg:col-span-3 space-y-5">
                    <Card title="Basic Information">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Full Name">
                                <Input placeholder="Your full name" value={profile.full_name}
                                    onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} />
                            </Field>
                            <Field label="Email" hint="Contact support to change">
                                <Input icon="mail" type="email" readOnly value={profile.email} />
                            </Field>
                            <Field label="Phone">
                                <Input icon="call" type="tel" placeholder="+91 98765 43210"
                                    value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                            </Field>
                            <Field label="City">
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">location_on</span>
                                    <input list="city-list" placeholder="Mumbai"
                                        value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all" />
                                    <datalist id="city-list">{INDIAN_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                            </Field>
                            <Field label="Years of Experience">
                                <Input type="number" min="0" max="60" placeholder="8"
                                    value={profile.years_experience}
                                    onChange={e => setProfile(p => ({ ...p, years_experience: e.target.value }))} />
                            </Field>
                            <Field label="Consultation Fee (₹)" hint="Per session">
                                <Input icon="currency_rupee" type="number" min="0" placeholder="2000"
                                    value={profile.consultation_fee}
                                    onChange={e => setProfile(p => ({ ...p, consultation_fee: e.target.value }))} />
                            </Field>
                            <Field label="License / ICCRC No." span2>
                                <Input icon="badge" placeholder="R123456"
                                    value={profile.license_number}
                                    onChange={e => setProfile(p => ({ ...p, license_number: e.target.value }))} />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Professional Bio">
                        <textarea rows={4} maxLength={500}
                            placeholder="Tell clients about your expertise and experience…"
                            value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all resize-none" />
                        <p className="text-[11px] text-slate-400 text-right mt-1">{profile.bio.length}/500</p>
                    </Card>

                    <Card title="Online Presence">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Website">
                                <Input icon="language" type="url" placeholder="https://yoursite.in"
                                    value={profile.website}
                                    onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} />
                            </Field>
                            <Field label="LinkedIn">
                                <Input icon="link" type="url" placeholder="linkedin.com/in/…"
                                    value={profile.linkedin_url}
                                    onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))} />
                            </Field>
                        </div>
                    </Card>

                    <Card title="Expertise">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Languages" hint="Comma-separated">
                                <Input placeholder="English, Hindi, Gujarati"
                                    value={profile.languages}
                                    onChange={e => setProfile(p => ({ ...p, languages: e.target.value }))} />
                            </Field>
                            <Field label="Specialisations" hint="Comma-separated">
                                <Input placeholder="Canada PR, Australia PR"
                                    value={profile.specializations}
                                    onChange={e => setProfile(p => ({ ...p, specializations: e.target.value }))} />
                            </Field>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <button type="submit" disabled={savingProfile}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-primary/30">
                            <span className={`material-symbols-outlined text-[16px] ${savingProfile ? 'animate-spin' : ''}`}>
                                {savingProfile ? 'progress_activity' : 'save'}
                            </span>
                            {savingProfile ? 'Saving…' : 'Save Profile'}
                        </button>
                    </div>
                </form>

                {/* RIGHT — side settings (2/5) */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Notifications */}
                    <Card title="Notifications" description="What you want to be notified about">
                        <Toggle value={notifications.case_updates_email} onChange={v => setNotifications(p => ({ ...p, case_updates_email: v }))}
                            label="Case updates via email" description="Status changes, new documents" />
                        <Toggle value={notifications.case_updates_push} onChange={v => setNotifications(p => ({ ...p, case_updates_push: v }))}
                            label="Case updates (push)" description="Browser push notifications" />
                        <Toggle value={notifications.messages_email} onChange={v => setNotifications(p => ({ ...p, messages_email: v }))}
                            label="New messages (email)" />
                        <Toggle value={notifications.messages_push} onChange={v => setNotifications(p => ({ ...p, messages_push: v }))}
                            label="New messages (push)" />
                        <Toggle value={notifications.marketing_email} onChange={v => setNotifications(p => ({ ...p, marketing_email: v }))}
                            label="Product updates & tips" description="Occasional emails from Immizy" />
                        <div className="pt-4">
                            <button onClick={saveNotifications} disabled={savingNotifs}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 dark:bg-white hover:opacity-90 disabled:opacity-60 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all">
                                <span className={`material-symbols-outlined text-[15px] ${savingNotifs ? 'animate-spin' : ''}`}>
                                    {savingNotifs ? 'progress_activity' : 'notifications'}
                                </span>
                                {savingNotifs ? 'Saving…' : 'Save Preferences'}
                            </button>
                        </div>
                    </Card>

                    {/* Security */}
                    <Card title="Password" description="Update your login password">
                        <form onSubmit={savePassword} className="space-y-3">
                            <Field label="New Password" hint="Minimum 8 characters">
                                <Input icon="lock" type="password" placeholder="••••••••"
                                    value={passwords.new}
                                    onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} />
                            </Field>
                            <Field label="Confirm Password">
                                <Input icon="lock_reset" type="password" placeholder="••••••••"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                            </Field>
                            <button type="submit" disabled={savingPassword || !passwords.new}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 dark:bg-white hover:opacity-90 disabled:opacity-60 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all mt-1">
                                <span className={`material-symbols-outlined text-[15px] ${savingPassword ? 'animate-spin' : ''}`}>
                                    {savingPassword ? 'progress_activity' : 'key'}
                                </span>
                                {savingPassword ? 'Updating…' : 'Update Password'}
                            </button>
                        </form>
                    </Card>

                    {/* Language */}
                    <Card title="Language & Region">
                        <div className="space-y-3">
                            <Field label="Language">
                                <select value={language} onChange={e => setLanguage(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
                                    <option value="en-IN">English (India)</option>
                                    <option value="en-US">English (US)</option>
                                    <option value="hi-IN">Hindi</option>
                                    <option value="gu-IN">Gujarati</option>
                                    <option value="mr-IN">Marathi</option>
                                    <option value="ta-IN">Tamil</option>
                                </select>
                            </Field>
                            <Field label="Timezone">
                                <select value={timezone} onChange={e => setTimezone(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all">
                                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                    <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                                    <option value="Europe/London">British Time (GMT/BST)</option>
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="Australia/Sydney">Australian Eastern (AET)</option>
                                </select>
                            </Field>
                            <button onClick={saveLocale} disabled={savingLocale}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 dark:bg-white hover:opacity-90 disabled:opacity-60 text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all">
                                <span className={`material-symbols-outlined text-[15px] ${savingLocale ? 'animate-spin' : ''}`}>
                                    {savingLocale ? 'progress_activity' : 'language'}
                                </span>
                                {savingLocale ? 'Saving…' : 'Save Preferences'}
                            </button>
                        </div>
                    </Card>

                    {/* Account */}
                    <Card title="Account">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Sign out</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">You'll be redirected to the login page</p>
                                </div>
                                <button onClick={signOut}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-[15px]">logout</span>
                                    Sign Out
                                </button>
                            </div>
                            <hr className="border-slate-100 dark:border-slate-800" />
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Data &amp; Privacy</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Export your data or request account deletion</p>
                                </div>
                                <Link to="/account/data"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-[15px]">shield_person</span>
                                    Manage
                                </Link>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    )
}
