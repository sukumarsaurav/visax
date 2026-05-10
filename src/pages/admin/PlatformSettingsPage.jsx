import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'security', label: 'Security' },
    { id: 'integrations', label: 'Integrations' },
    { id: 'legal', label: 'Legal' },
    { id: 'maintenance', label: 'Maintenance' }
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

    const [general, setGeneral] = useState({ platform_name: 'VisaX', support_email: 'support@visax.com', max_upload_mb: 25, maintenance_mode: false })
    const [security, setSecurity] = useState({ session_timeout_hours: 24, two_factor_required: false, password_min_length: 8 })
    const [maintenanceMsg, setMaintenanceMsg] = useState('We are currently performing scheduled maintenance. We will be back shortly.')
    const [intSettings, setIntSettings] = useState({ stripe: { enabled: true, mode: 'live' }, zoom: { enabled: true }, sendgrid: { enabled: false }, hubspot: { enabled: false } })

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
