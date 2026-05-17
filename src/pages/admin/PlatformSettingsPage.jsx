import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'react-hot-toast'
import Button from '../../components/ui/Button'
import ToggleSwitch from '../../components/ui/ToggleSwitch'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { writeAuditLog } from '../../lib/auditLog'
import { invalidatePlatformConfig } from '../../lib/platformConfig'

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'social', label: 'Social & Branding' },
    { id: 'legal', label: 'Legal' },
    { id: 'maintenance', label: 'Maintenance' },
]

const SOCIAL_PLATFORMS = [
    { key: 'twitter',   label: 'Twitter / X', placeholder: 'https://x.com/yourhandle',              icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.737-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z', color: 'text-slate-900 dark:text-white' },
    { key: 'linkedin',  label: 'LinkedIn',     placeholder: 'https://linkedin.com/company/…',        icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', color: 'text-[#0A66C2]' },
    { key: 'facebook',  label: 'Facebook',     placeholder: 'https://facebook.com/yourpage',         icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', color: 'text-[#1877F2]' },
    { key: 'instagram', label: 'Instagram',    placeholder: 'https://instagram.com/yourhandle',      icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z', color: 'text-[#E4405F]' },
    { key: 'youtube',   label: 'YouTube',      placeholder: 'https://youtube.com/@yourchannel',      icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', color: 'text-[#FF0000]' },
]

const DEFAULT_GENERAL = { max_upload_mb: 25, maintenance_mode: false }
const DEFAULT_SOCIAL = { twitter: '', linkedin: '', facebook: '', instagram: '', youtube: '' }
const DEFAULT_LEGAL = { terms_url: '', privacy_url: '' }
const DEFAULT_MAINTENANCE_MSG = 'We are currently performing scheduled maintenance. We will be back shortly.'

export default function PlatformSettingsPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('general')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)
    const [isDirty, setIsDirty] = useState(false)
    const [uploadingLegal, setUploadingLegal] = useState({ terms: false, privacy: false })

    const [general, setGeneral] = useState(DEFAULT_GENERAL)
    const [maintenanceMsg, setMaintenanceMsg] = useState(DEFAULT_MAINTENANCE_MSG)
    const [social, setSocial] = useState(DEFAULT_SOCIAL)
    const [legal, setLegal] = useState(DEFAULT_LEGAL)

    const original = useRef({})

    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const loadSettings = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('platform_settings').select('key, value, updated_at')
        if (data) {
            const snap = {
                general: DEFAULT_GENERAL,
                maintenanceMsg: DEFAULT_MAINTENANCE_MSG,
                social: DEFAULT_SOCIAL,
                legal: DEFAULT_LEGAL,
            }
            for (const row of data) {
                if (row.key === 'general') snap.general = { ...DEFAULT_GENERAL, ...row.value }
                if (row.key === 'social_links') snap.social = { ...DEFAULT_SOCIAL, ...row.value }
                if (row.key === 'maintenance_message') snap.maintenanceMsg = row.value?.message || snap.maintenanceMsg
                if (row.key === 'legal') snap.legal = { ...DEFAULT_LEGAL, ...row.value }
                if (row.key === 'general' && row.updated_at) setLastSaved(new Date(row.updated_at).toLocaleString())
            }
            setGeneral(snap.general)
            setSocial(snap.social)
            setMaintenanceMsg(snap.maintenanceMsg)
            setLegal(snap.legal)
            original.current = snap
        }
        setIsDirty(false)
        setLoading(false)
    }, [])

    useEffect(() => { loadSettings() }, [loadSettings])

    const markDirty = () => setIsDirty(true)
    const patchGeneral = (fn) => { setGeneral(g => fn(g)); markDirty() }
    const patchSocial = (fn) => { setSocial(s => fn(s)); markDirty() }
    const patchMaintenanceMsg = (v) => { setMaintenanceMsg(v); markDirty() }
    const patchLegal = (fn) => { setLegal(l => fn(l)); markDirty() }

    const handleCancel = () => {
        const o = original.current
        setGeneral(o.general || DEFAULT_GENERAL)
        setSocial(o.social || DEFAULT_SOCIAL)
        setMaintenanceMsg(o.maintenanceMsg || DEFAULT_MAINTENANCE_MSG)
        setLegal(o.legal || DEFAULT_LEGAL)
        setIsDirty(false)
    }

    const saveSetting = async (key, value) => {
        const { error } = await supabase.from('platform_settings').upsert(
            { key, value, updated_by: user?.id, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        )
        return error
    }

    const handleSave = async () => {
        setSaving(true)
        const toSave = []
        if (activeTab === 'general') toSave.push(['general', general])
        if (activeTab === 'social') toSave.push(['social_links', social])
        if (activeTab === 'legal') toSave.push(['legal', legal])
        if (activeTab === 'maintenance') {
            toSave.push(['maintenance_message', { message: maintenanceMsg }])
            toSave.push(['general', { ...general }])
        }

        let error = null
        for (const [key, val] of toSave) {
            error = await saveSetting(key, val)
            if (error) break
        }

        if (error) {
            toast.error('Failed to save settings')
        } else {
            invalidatePlatformConfig()
            toast.success('Settings saved!')
            setLastSaved(new Date().toLocaleString())
            setIsDirty(false)
            original.current = { ...original.current, general, social, maintenanceMsg, legal }
            await writeAuditLog({ action: 'Settings Updated', entityType: 'settings', details: { tab: activeTab } })
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-0">
                <p className="text-slate-500 dark:text-slate-400">Manage global configurations, social presence, and legal documents.</p>
                {isDirty && (
                    <p className="mt-1 text-xs text-amber-600 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">edit</span>
                        You have unsaved changes
                    </p>
                )}
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

                {/* ── GENERAL ── */}
                {activeTab === 'general' && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">General Settings</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <label className="flex flex-col gap-2 max-w-xs">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Max Document Upload Size (MB)</span>
                                <span className="text-xs text-slate-400">Applies to all file uploads across the platform (documents, legal PDFs). Avatar uploads are always limited to 5 MB.</span>
                                <input
                                    type="number" min="1" max="100"
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-primary focus:border-primary h-11 px-4 text-sm"
                                    value={general.max_upload_mb || 25}
                                    onChange={e => patchGeneral(g => ({ ...g, max_upload_mb: Number(e.target.value) }))}
                                />
                            </label>
                        </div>
                    </section>
                )}

                {/* ── SOCIAL & BRANDING ── */}
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
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d={icon} /></svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</span>
                                            <input type="url" value={social[key] || ''} onChange={e => patchSocial(s => ({ ...s, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-10 px-3 text-sm focus:ring-primary focus:border-primary placeholder:text-slate-400" />
                                        </div>
                                        {social[key] && (
                                            <a href={social[key]} target="_blank" rel="noopener noreferrer"
                                                className="flex-shrink-0 text-xs font-medium text-primary hover:underline flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[16px]">open_in_new</span> Test
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
                                            <svg viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d={icon} /></svg>
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

                {/* ── LEGAL ── */}
                {activeTab === 'legal' && (
                    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold">Legal & Compliance</h2>
                        </div>
                        <p className="px-6 pt-4 text-sm text-slate-500 dark:text-slate-400">
                            Upload PDFs or paste external URLs. The footer will link directly to the URL when set.
                        </p>
                        <div className="p-6 space-y-6">
                            {/* PDF upload targets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Terms of Service', icon: 'description', key: 'terms' },
                                    { label: 'Privacy Policy',   icon: 'privacy_tip', key: 'privacy' },
                                ].map(doc => {
                                    const inputId = `legal-upload-${doc.key}`
                                    const isUploading = uploadingLegal[doc.key]
                                    const handleUpload = async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        setUploadingLegal(u => ({ ...u, [doc.key]: true }))
                                        const path = `legal/${doc.key}-${Date.now()}.pdf`
                                        const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
                                        if (error) {
                                            toast.error('Upload failed')
                                        } else {
                                            const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
                                            const urlKey = `${doc.key}_url`
                                            patchLegal(l => ({ ...l, [urlKey]: urlData.publicUrl }))
                                            toast.success(`${doc.label} uploaded — save to apply`)
                                        }
                                        setUploadingLegal(u => ({ ...u, [doc.key]: false }))
                                    }
                                    return (
                                        <label key={doc.key} htmlFor={inputId}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                                            <input id={inputId} type="file" accept="application/pdf" className="hidden" onChange={handleUpload} />
                                            <span className={`material-symbols-outlined text-[32px] transition-colors ${isUploading ? 'text-primary animate-pulse' : 'text-slate-400 group-hover:text-primary'}`}>{doc.icon}</span>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{doc.label}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{isUploading ? 'Uploading…' : 'Click to upload PDF'}</p>
                                            {legal[`${doc.key}_url`] && (
                                                <a href={legal[`${doc.key}_url`]} target="_blank" rel="noreferrer"
                                                    className="text-xs text-primary hover:underline mt-1" onClick={e => e.stopPropagation()}>
                                                    View current
                                                </a>
                                            )}
                                        </label>
                                    )
                                })}
                            </div>

                            {/* Manual URL overrides */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Terms of Service URL</label>
                                    <input value={legal.terms_url || ''} onChange={e => patchLegal(l => ({ ...l, terms_url: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4 text-sm focus:ring-primary focus:border-primary"
                                        placeholder="https://… (overrides uploaded PDF)" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Privacy Policy URL</label>
                                    <input value={legal.privacy_url || ''} onChange={e => patchLegal(l => ({ ...l, privacy_url: e.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white h-11 px-4 text-sm focus:ring-primary focus:border-primary"
                                        placeholder="https://… (overrides uploaded PDF)" />
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ── MAINTENANCE ── */}
                {activeTab === 'maintenance' && (
                    <section className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600 text-[20px]">warning</span>
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold">Maintenance Mode</h2>
                            </div>
                            <ToggleSwitch
                                checked={general.maintenance_mode || false}
                                onChange={v => patchGeneral(g => ({ ...g, maintenance_mode: v }))}
                            />
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                When enabled, all non-admin users see a maintenance page instead of the platform. Admins retain full access. The /login page stays accessible so you can sign in to disable it.
                            </p>
                            {general.maintenance_mode && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-semibold text-red-700 dark:text-red-400">
                                    <span className="material-symbols-outlined text-[18px]">warning</span>
                                    Maintenance mode is ON — save to apply this to all users.
                                </div>
                            )}
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">Maintenance Message</span>
                                <textarea
                                    className="w-full rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-red-500 focus:border-red-500 min-h-[100px] p-3 text-sm resize-none"
                                    value={maintenanceMsg}
                                    onChange={e => patchMaintenanceMsg(e.target.value)}
                                />
                            </label>
                        </div>
                    </section>
                )}
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isDirty ? (
                            <span className="text-amber-600 font-medium">Unsaved changes</span>
                        ) : lastSaved ? (
                            `Last saved: ${lastSaved}`
                        ) : 'No changes'}
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancel} disabled={!isDirty || saving}>Cancel</Button>
                        <Button icon="save" onClick={handleSave} disabled={saving || !isDirty}>
                            {saving ? 'Saving…' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
