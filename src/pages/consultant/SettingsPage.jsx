import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import AvatarUpload from '../../components/ui/AvatarUpload'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { uploadAvatar } from '../../lib/storage'

const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'language', label: 'Language & Region', icon: 'language' },
]

function Toast({ msg, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [])
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 dark:bg-white px-5 py-3 text-white dark:text-slate-900 shadow-xl text-sm font-medium">
            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">check_circle</span>
            {msg}
        </div>
    )
}

function InputField({ label, icon, ...props }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">{label}</span>
            <div className="relative">
                {icon && <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">{icon}</span>}
                <input
                    className={`w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm`}
                    {...props}
                />
            </div>
        </label>
    )
}

function Toggle({ value, onChange, label, description }) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
                <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    )
}

export default function SettingsPage() {
    const { user, profile: authProfile, signOut } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState('')
    const [changingPw, setChangingPw] = useState(false)

    const [profile, setProfile] = useState({
        full_name: '', email: '', phone: '', bio: '',
        years_experience: '', languages: '', specializations: '',
        avatar_url: '',
    })
    const [notifications, setNotifications] = useState({
        case_updates_email: true,
        case_updates_push: true,
        messages_email: true,
        messages_push: false,
        marketing_email: false,
    })
    const [language, setLanguage] = useState('en-US')
    const [timezone, setTimezone] = useState('America/New_York')
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

    useEffect(() => {
        if (!user) return
        fetchProfile()
    }, [user])

    async function fetchProfile() {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            setProfile({
                full_name: data.full_name || '',
                email: data.email || user.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                years_experience: data.years_experience || '',
                languages: (data.languages || []).join(', '),
                specializations: (data.specializations || []).join(', '),
                avatar_url: data.avatar_url || '',
            })
            if (data.notification_preferences) {
                setNotifications(prev => ({ ...prev, ...data.notification_preferences }))
            }
        }
        setLoading(false)
    }

    async function handleAvatarUpload(file) {
        const url = await uploadAvatar(file, user.id)
        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
        setProfile(p => ({ ...p, avatar_url: url }))
        setToast('Profile photo updated!')
        return url
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        const { error } = await supabase.from('profiles').update({
            full_name: profile.full_name,
            phone: profile.phone,
            bio: profile.bio,
            years_experience: parseInt(profile.years_experience) || null,
            languages: profile.languages.split(',').map(s => s.trim()).filter(Boolean),
            specializations: profile.specializations.split(',').map(s => s.trim()).filter(Boolean),
        }).eq('id', user.id)

        if (!error) setToast('Profile saved!')
        setSaving(false)
    }

    const handleSaveNotifications = async () => {
        setSaving(true)
        const { error } = await supabase.from('profiles').update({
            notification_preferences: notifications,
        }).eq('id', user.id)
        if (!error) setToast('Notification preferences saved!')
        setSaving(false)
    }

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            setToast('Passwords do not match!')
            return
        }
        setChangingPw(true)
        const { error } = await supabase.auth.updateUser({ password: passwords.new })
        if (!error) {
            setToast('Password updated!')
            setPasswords({ current: '', new: '', confirm: '' })
        }
        setChangingPw(false)
    }

    if (loading) {
        return (
            <div className="flex gap-8 min-h-[calc(100vh-8rem)]">
                <div className="w-64 hidden lg:block animate-pulse bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="flex-1 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-8 min-h-[calc(100vh-8rem)] -m-4 lg:-m-8">
            {toast && <Toast msg={toast} onClose={() => setToast('')} />}

            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sticky top-0 h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex flex-col gap-2">
                    <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">Settings</h3>
                    {settingsTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors text-left ${activeTab === tab.id
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="material-symbols-outlined">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={signOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                        <p className="mt-1 text-slate-500">Manage your profile, preferences, and account security.</p>
                    </div>

                    {/* Mobile Tabs */}
                    <div className="flex gap-1 lg:hidden bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                        {settingsTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                            >{tab.label}</button>
                        ))}
                    </div>

                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h2>
                                <p className="text-sm text-slate-500">Update your public profile details.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-5 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <AvatarUpload
                                        currentUrl={profile.avatar_url}
                                        name={profile.full_name}
                                        onUpload={handleAvatarUpload}
                                        size="lg"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile Photo</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Click the camera icon to upload. JPG, PNG or WebP, max 5 MB.</p>
                                        <p className="text-xs text-slate-400 mt-1">Photo is saved immediately on upload.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Full Name"
                                        value={profile.full_name}
                                        onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                                        placeholder="Your full name"
                                    />
                                    <InputField
                                        label="Email Address"
                                        icon="mail"
                                        type="email"
                                        value={profile.email}
                                        readOnly
                                        className="opacity-60 cursor-not-allowed"
                                        placeholder="your@email.com"
                                    />
                                    <InputField
                                        label="Phone Number"
                                        icon="call"
                                        type="tel"
                                        value={profile.phone}
                                        onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    <InputField
                                        label="Years of Experience"
                                        type="number"
                                        min="0"
                                        value={profile.years_experience}
                                        onChange={e => setProfile(p => ({ ...p, years_experience: e.target.value }))}
                                        placeholder="e.g. 10"
                                    />
                                    <div className="md:col-span-2">
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Professional Bio</span>
                                            <textarea
                                                rows={4}
                                                value={profile.bio}
                                                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                                                placeholder="Tell clients about your expertise and experience..."
                                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm resize-none"
                                            />
                                        </label>
                                    </div>
                                    <InputField
                                        label="Languages (comma-separated)"
                                        value={profile.languages}
                                        onChange={e => setProfile(p => ({ ...p, languages: e.target.value }))}
                                        placeholder="English, French, Spanish"
                                    />
                                    <InputField
                                        label="Specializations (comma-separated)"
                                        value={profile.specializations}
                                        onChange={e => setProfile(p => ({ ...p, specializations: e.target.value }))}
                                        placeholder="Express Entry, Study Permit, PR"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveProfile} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                                <p className="text-sm text-slate-500">Choose what you want to be notified about.</p>
                            </div>
                            <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800">
                                <Toggle value={notifications.case_updates_email} onChange={v => setNotifications(p => ({ ...p, case_updates_email: v }))} label="Case Updates (Email)" description="Get notified about case status changes via email" />
                                <Toggle value={notifications.case_updates_push} onChange={v => setNotifications(p => ({ ...p, case_updates_push: v }))} label="Case Updates (Push)" description="Browser push notifications for case changes" />
                                <Toggle value={notifications.messages_email} onChange={v => setNotifications(p => ({ ...p, messages_email: v }))} label="New Messages (Email)" description="Email when you receive a new message" />
                                <Toggle value={notifications.messages_push} onChange={v => setNotifications(p => ({ ...p, messages_push: v }))} label="New Messages (Push)" description="Push notification for new messages" />
                                <Toggle value={notifications.marketing_email} onChange={v => setNotifications(p => ({ ...p, marketing_email: v }))} label="Marketing Emails" description="Product updates, tips, and promotional content" />
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSaveNotifications} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Privacy</h2>
                                <p className="text-sm text-slate-500">Manage your password and account security.</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <InputField label="New Password" type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} placeholder="••••••••" />
                                <InputField label="Confirm New Password" type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" />
                                <div className="flex justify-end">
                                    <Button onClick={handleChangePassword} disabled={changingPw || !passwords.new}>
                                        {changingPw ? 'Updating...' : 'Update Password'}
                                    </Button>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                                    <p className="text-sm text-slate-500 mb-3">These actions are irreversible. Please proceed with caution.</p>
                                    <button
                                        onClick={signOut}
                                        className="px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Sign Out of All Devices
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Language Tab */}
                    {activeTab === 'language' && (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Language & Region</h2>
                                <p className="text-sm text-slate-500">Set your preferred language and timezone.</p>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Language</label>
                                    <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary">
                                        <option value="en-US">English (US)</option>
                                        <option value="en-GB">English (UK)</option>
                                        <option value="fr-FR">French</option>
                                        <option value="es-ES">Spanish</option>
                                        <option value="ar">Arabic</option>
                                        <option value="zh-CN">Chinese (Simplified)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Timezone</label>
                                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary">
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        <option value="Europe/London">GMT / UTC</option>
                                        <option value="Europe/Paris">Central European Time (CET)</option>
                                        <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
                                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                        <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={() => setToast('Language preferences saved!')}>Save Preferences</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
