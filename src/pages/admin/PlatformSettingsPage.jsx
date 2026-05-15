import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'social', label: 'Social & Branding' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'legal', label: 'Legal' },
    { id: 'maintenance', label: 'Maintenance' },
]

const SOCIAL_PLATFORMS = [
    {
        key: 'twitter',
        label: 'Twitter / X',
        placeholder: 'https://x.com/yourhandle',
        icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.737-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z',
        color: 'text-slate-900 dark:text-white',
    },
    {
        key: 'linkedin',
        label: 'LinkedIn',
        placeholder: 'https://linkedin.com/company/yourcompany',
        icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
        color: 'text-[#0A66C2]',
    },
    {
        key: 'facebook',
        label: 'Facebook',
        placeholder: 'https://facebook.com/yourpage',
        icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
        color: 'text-[#1877F2]',
    },
    {
        key: 'instagram',
        label: 'Instagram',
        placeholder: 'https://instagram.com/yourhandle',
        icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
        color: 'text-[#E4405F]',
    },
    {
        key: 'youtube',
        label: 'YouTube',
        placeholder: 'https://youtube.com/@yourchannel',
        icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
        color: 'text-[#FF0000]',
    },
]

const integrations = [
    { key: 'stripe', name: 'Stripe Payments', description: 'Handles all marketplace transactions and payouts.', icon: 'payments' },
    { key: 'zoom', name: 'Zoom', description: 'Enable video consultations directly from the platform.', icon: 'videocam' },
    { key: 'sendgrid', name: 'SendGrid', description: 'Email delivery service for notifications and marketing.', icon: 'mark_email_read' },
    { key: 'hubspot', name: 'HubSpot', description: 'Sync customer data and automate marketing campaigns.', icon: 'hub' },
]

export default function PlatformSettingsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [lastSaved, setLastSaved] = useState(null)

    const [general, setGeneral] = useState({ platform_name: 'Immizy', support_email: 'support@immizy.in', max_upload_mb: 25, maintenance_mode: false })
    const [security, setSecurity] = useState({ session_timeout_hours: 24, two_factor_required: false, password_min_length: 8 })
    const [maintenanceMsg, setMaintenanceMsg] = useState('We are currently performing scheduled maintenance. We will be back shortly.')
    const [intSettings, setIntSettings] = useState({ stripe: { enabled: true, mode: 'live' }, zoom: { enabled: true }, sendgrid: { enabled: false }, hubspot: { enabled: false } })
    const [social, setSocial] = useState({ twitter: '', linkedin: '', facebook: '', instagram: '', youtube: '' })

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    useEffect(() => {
        async function load() {
            setLoading(true)
            const { data } = await supabase.from('platform_settings').select('key, value, updated_at')
            if (data) {
                for (const row of data) {
                    if (row.key === 'general') setGeneral(v => ({ ...v, ...row.value }))
                    if (row.key === 'security') setSecurity(v => ({ ...v, ...row.value }))
                    if (row.key === 'integrations') setIntSettings(v => ({ ...v, ...row.value }))
                    if (row.key === 'social_links') setSocial(v => ({ ...v, ...row.value }))
                    if (row.key === 'maintenance_message') setMaintenanceMsg(row.value?.message || maintenanceMsg)
                    if (row.key === 'general') setLastSaved(row.updated_at ? new Date(row.updated_at).toLocaleString() : null)
                }
            }
            setLoading(false)
        }
        load()
    }, [])

    const saveSetting = async (key, value) => {
        const { error } = await supabase.from('platform_settings').upsert({
            key, value, updated_by: user?.id, updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
        return error
    }

    const handleSave = async () => {
        setSaving(true)
        const toSave = []
        if (activeTab === 'general') toSave.push(['general', general])
        if (activeTab === 'security') toSave.push(['security', security])
        if (activeTab === 'social') toSave.push(['social_links', social])
        if (activeTab === 'integrations') toSave.push(['integrations', intSettings])
        if (activeTab === 'maintenance') toSave.push(['maintenance_message', { message: maintenanceMsg }], ['general', { ...general }])

        let error = null
        for (const [key, val] of toSave) {
            error = await saveSetting(key, val)
            if (error) break
        }
        if (error) {
            showToast('Failed to save: ' + error.message, 'error')
        } else {
            showToast('Settings saved!')
            setLastSaved(new Date().toLocaleString())
        }
        setSaving(false)
    }

    const Toggle = ({ checked, onChange }) => (
        <button type="button" onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}></span>
        </button>
    )

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-0">
                <p className="text-slate-500 dark:text-slate-400">Manage global configurations, integrations, and security policies.</p>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-3 text-sm font-bold tracking-wide border-b-[3px] transition-colors ${activeTab === tab.id ? 'border-b-primary text-slate-900 dark:text-white' : 'border-b-transparent text-slate-500 hover:text-primary'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-8 space-y-8">
                {activeTab === 'general' && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">General Settings</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Platform Name</span>
                                <input className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary h-11 px-4 text-sm"
                                    value={general.platform_name || ''} onChange={e => setGeneral(g => ({ ...g, platform_name: e.target.value }))} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Support Email</span>
                                <input type="email" className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary h-11 px-4 text-sm"
                                    value={general.support_email || ''} onChange={e => setGeneral(g => ({ ...g, support_email: e.target.value }))} />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Max Upload Size (MB)</span>
                                <input type="number" min="1" max="100" className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary h-11 px-4 text-sm"
                                    value={general.max_upload_mb || 25} onChange={e => setGeneral(g => ({ ...g, max_upload_mb: Number(e.target.value) }))} />
                            </label>
                            <div className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Maintenance Mode</span>
                                <div className="flex items-center gap-3 h-11">
                                    <Toggle checked={general.maintenance_mode || false} onChange={v => setGeneral(g => ({ ...g, maintenance_mode: v }))} />
                                    <span className="text-sm text-slate-500">{general.maintenance_mode ? 'Enabled — Site is hidden from users' : 'Disabled'}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'security' && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">Security Settings</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-4">
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Session Timeout (Hours)</span>
                                    <input type="number" min="1" max="168" className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary h-11 px-4 text-sm"
                                        value={security.session_timeout_hours || 24} onChange={e => setSecurity(s => ({ ...s, session_timeout_hours: Number(e.target.value) }))} />
                                </label>
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Min Password Length</span>
                                    <input type="number" min="8" max="32" className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary h-11 px-4 text-sm"
                                        value={security.password_min_length || 8} onChange={e => setSecurity(s => ({ ...s, password_min_length: Number(e.target.value) }))} />
                                </label>
                            </div>
                            <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Enforce 2FA</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Require Two-Factor Authentication for all admin accounts.</p>
                                    </div>
                                    <Toggle checked={security.two_factor_required || false} onChange={v => setSecurity(s => ({ ...s, two_factor_required: v }))} />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'social' && (
                    <div className="space-y-6">
                        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">share</span>
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold">Social Media Links</h2>
                            </div>
                            <p className="px-6 pt-4 text-sm text-slate-500 dark:text-slate-400">
                                These URLs appear as icons in the site footer. Leave blank to hide a platform.
                            </p>
                            <div className="p-6 space-y-4">
                                {SOCIAL_PLATFORMS.map(({ key, label, placeholder, icon, color }) => (
                                    <label key={key} className="flex items-center gap-4">
                                        <div className={`size-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${color}`}>
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                                <path d={icon} />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</span>
                                            <input
                                                type="url"
                                                value={social[key] || ''}
                                                onChange={e => setSocial(s => ({ ...s, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-10 px-3 text-sm focus:ring-primary focus:border-primary placeholder:text-slate-400"
                                            />
                                        </div>
                                        {social[key] && (
                                            <a href={social[key]} target="_blank" rel="noopener noreferrer"
                                                className="flex-shrink-0 text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                Test
                                            </a>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">preview</span>
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold">Footer Preview</h2>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Active social icons as they will appear in the footer:</p>
                                <div className="flex items-center gap-3">
                                    {SOCIAL_PLATFORMS.filter(p => social[p.key]).map(({ key, label, icon }) => (
                                        <div key={key} title={label}
                                            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                                                <path d={icon} />
                                            </svg>
                                        </div>
                                    ))}
                                    {!SOCIAL_PLATFORMS.some(p => social[p.key]) && (
                                        <p className="text-sm text-slate-400 italic">No active links — add a URL above to see the preview.</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'integrations' && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">extension</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">Integrations</h2>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {integrations.map((int) => {
                                const connected = intSettings[int.key]?.enabled ?? false
                                return (
                                    <div key={int.key} className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">{int.icon}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-slate-900 dark:text-white font-bold">{int.name}</h3>
                                                    {connected ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                            <span className="size-1.5 rounded-full bg-green-600"></span> Connected
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            Not connected
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{int.description}</p>
                                            </div>
                                        </div>
                                        <Toggle checked={connected} onChange={v => setIntSettings(s => ({ ...s, [int.key]: { ...s[int.key], enabled: v } }))} />
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {activeTab === 'legal' && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">Legal & Compliance</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Terms of Service', icon: 'description' },
                                    { label: 'Privacy Policy', icon: 'privacy_tip' },
                                ].map(doc => (
                                    <div key={doc.label} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[32px]">{doc.icon}</span>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{doc.label}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Click to upload PDF</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Terms of Service URL</label>
                                <input className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4 text-sm focus:ring-primary focus:border-primary"
                                    placeholder="https://..." />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Privacy Policy URL</label>
                                <input className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4 text-sm focus:ring-primary focus:border-primary"
                                    placeholder="https://..." />
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'maintenance' && (
                    <section className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold">Maintenance Mode</h2>
                            </div>
                            <Toggle checked={general.maintenance_mode || false} onChange={v => setGeneral(g => ({ ...g, maintenance_mode: v }))} />
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Activating maintenance mode will make the platform inaccessible to regular users. Admins will still have access.</p>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Maintenance Message</span>
                                <textarea className="w-full rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500 min-h-[100px] p-3 text-sm resize-none"
                                    value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} />
                            </label>
                        </div>
                    </section>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {lastSaved ? `Last saved: ${lastSaved}` : 'Unsaved changes'}
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                        <Button icon="save" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
