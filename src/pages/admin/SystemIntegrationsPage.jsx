import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

const INTEGRATION_META = [
    {
        id: 'stripe',
        name: 'Stripe',
        description: 'Accept payments, send payouts, and manage your business online.',
        icon: 'credit_card',
        color: '#635BFF',
        fields: [
            { key: 'publishable_key', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...' },
            { key: 'secret_key', label: 'Secret Key', type: 'secret', placeholder: 'sk_live_...' },
            { key: 'webhook_secret', label: 'Webhook Secret', type: 'secret', placeholder: 'whsec_...' },
        ],
        infoFields: [
            { key: 'account_name', label: 'Account Name', icon: 'business' },
            { key: 'mode', label: 'Mode', icon: 'toggle_on' },
            { key: 'country', label: 'Country', icon: 'public' },
            { key: 'email', label: 'Email', icon: 'mail' },
        ],
        features: [
            { icon: 'add_link', label: 'Generate payment links for invoices', where: 'Sales → Invoices table → "Stripe Link" button' },
            { icon: 'receipt_long', label: 'One-click Stripe-hosted checkout per invoice', where: 'Opens in new tab, auto-saves URL back to invoice' },
            { icon: 'webhook', label: 'Webhook verification for payment events', where: 'Requires webhook_secret to verify incoming events' },
        ],
        docs: 'https://stripe.com/docs/keys',
    },
    {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Sync customer data and automate your marketing campaigns.',
        icon: 'hub',
        color: '#FF7A59',
        fields: [
            { key: 'api_key', label: 'Private App Token', type: 'secret', placeholder: 'pat-na1-...' },
            { key: 'portal_id', label: 'Portal ID', type: 'text', placeholder: '12345678' },
        ],
        infoFields: [
            { key: 'account_name', label: 'Company', icon: 'business' },
            { key: 'portal_id', label: 'Portal ID', icon: 'tag' },
            { key: 'currency', label: 'Currency', icon: 'attach_money' },
            { key: 'time_zone', label: 'Timezone', icon: 'schedule' },
        ],
        features: [
            { icon: 'contacts', label: 'Sync new user registrations as CRM contacts', where: 'Triggered when user role is saved in User Management' },
            { icon: 'person_search', label: 'Track lead pipeline from application approval', where: 'Application Review → Approve triggers HubSpot deal' },
            { icon: 'history', label: 'Activity timeline synced from platform events', where: 'Consultations, payments, and status changes' },
        ],
        docs: 'https://developers.hubspot.com/docs/api/private-apps',
    },
    {
        id: 'zoom',
        name: 'Zoom',
        description: 'Enable video consultations and webinars directly from the platform.',
        icon: 'videocam',
        color: '#2D8CFF',
        fields: [
            { key: 'api_key', label: 'Client ID', type: 'text', placeholder: 'Your Zoom Client ID' },
            { key: 'api_secret', label: 'Client Secret', type: 'secret', placeholder: 'Your Zoom Client Secret' },
            { key: 'account_id', label: 'Account ID', type: 'text', placeholder: 'Your Zoom Account ID' },
        ],
        infoFields: [
            { key: 'account_name', label: 'Name', icon: 'person' },
            { key: 'email', label: 'Email', icon: 'mail' },
            { key: 'account_type', label: 'Plan', icon: 'workspace_premium' },
        ],
        docs: 'https://developers.zoom.us/docs/internal-apps/',
        features: [
            { icon: 'video_call', label: 'Auto-create Zoom meetings when consultations are booked', where: 'Consultant → Appointments → Book generates a meeting link' },
            { icon: 'link', label: 'Join & host links stored on each booking', where: 'Clients get join_url, consultants get start_url' },
            { icon: 'lock', label: 'Waiting room enabled on all meetings by default', where: 'Configurable in Zoom dashboard per meeting' },
        ],
    },
    {
        id: 'mailchimp',
        name: 'Mailchimp',
        description: 'Create and manage email campaigns for your user base.',
        icon: 'mark_email_read',
        color: '#FFE01B',
        fields: [
            { key: 'api_key', label: 'API Key', type: 'secret', placeholder: 'xxxxxxxxxxxxxxxx-us1' },
            { key: 'list_id', label: 'Default Audience ID', type: 'text', placeholder: 'abc123de' },
        ],
        infoFields: [
            { key: 'account_name', label: 'Account', icon: 'business' },
            { key: 'email', label: 'Email', icon: 'mail' },
            { key: 'total_subscribers', label: 'Subscribers', icon: 'group' },
            { key: 'lists_count', label: 'Lists', icon: 'list' },
        ],
        features: [
            { icon: 'person_add', label: 'Sync new users to your audience on registration', where: 'Triggered on User Management → Save User' },
            { icon: 'sell', label: 'Auto-tag users by role (client, consultant, agency)', where: 'Tags applied automatically based on profile role' },
            { icon: 'unsubscribe', label: 'Unsubscribe suspended users from campaigns', where: 'User Management → Suspend triggers unsubscribe' },
        ],
        docs: 'https://mailchimp.com/developer/marketing/guides/quick-start/',
    },
    {
        id: 'analytics',
        name: 'Google Analytics',
        description: 'Track traffic and user behavior across your marketplace.',
        icon: 'analytics',
        color: '#E37400',
        fields: [
            { key: 'measurement_id', label: 'Measurement ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
            { key: 'api_secret', label: 'API Secret (optional)', type: 'secret', placeholder: 'For server-side events' },
        ],
        infoFields: [
            { key: 'measurement_id', label: 'Measurement ID', icon: 'tag' },
            { key: 'note', label: 'Note', icon: 'info' },
        ],
        features: [
            { icon: 'travel_explore', label: 'Automatic page_view on every route change', where: 'Injected globally in App.jsx via gtag.js' },
            { icon: 'check_circle', label: 'application_approved / application_rejected events', where: 'Application Review admin actions' },
            { icon: 'payments', label: 'payment_link_generated event with amount', where: 'Sales → Generate Stripe Link' },
            { icon: 'person', label: 'user_updated and user_suspended events', where: 'User Management admin actions' },
        ],
        docs: 'https://developers.google.com/analytics/devguides/collection/ga4',
    },
    {
        id: 'slack',
        name: 'Slack',
        description: "Send notifications and alerts to your team's workspace.",
        icon: 'forum',
        color: '#4A154B',
        fields: [
            { key: 'webhook_url', label: 'Incoming Webhook URL', type: 'text', placeholder: 'https://hooks.slack.com/services/...' },
            { key: 'bot_token', label: 'Bot Token (optional)', type: 'secret', placeholder: 'xoxb-...' },
        ],
        infoFields: [
            { key: 'account_name', label: 'Workspace', icon: 'business' },
            { key: 'webhook_url', label: 'Webhook', icon: 'tag' },
        ],
        features: [
            { icon: 'check_circle', label: 'Notify on application approved / rejected', where: 'Application Review → Approve or Reject button' },
            { icon: 'block', label: 'Notify when a user is suspended', where: 'User Management → Suspend User' },
            { icon: 'campaign', label: 'Notify when an announcement is published', where: 'Announcements → Publish (not draft)' },
            { icon: 'payments', label: 'Notify when a Stripe payment link is created', where: 'Sales → Generate Stripe Link on invoice' },
        ],
        docs: 'https://api.slack.com/messaging/webhooks',
    },
]

export default function SystemIntegrationsPage() {
    const [intSettings, setIntSettings] = useState({})
    const [selectedId, setSelectedId] = useState(null)
    const [showConfigPanel, setShowConfigPanel] = useState(false)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [toast, setToast] = useState(null)
    const [showSecrets, setShowSecrets] = useState({})
    const [fieldValues, setFieldValues] = useState({})
    const [testResult, setTestResult] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 4000)
    }

    const loadSettings = useCallback(async () => {
        const { data } = await supabase
            .from('platform_settings')
            .select('value')
            .eq('key', 'integrations')
            .single()
        if (data?.value) setIntSettings(data.value)
    }, [])

    useEffect(() => { loadSettings() }, [loadSettings])

    const selectedMeta = INTEGRATION_META.find(i => i.id === selectedId)
    const selectedSettings = selectedId ? (intSettings[selectedId] || {}) : {}

    const openConfig = (id) => {
        setSelectedId(id)
        const settings = intSettings[id] || {}
        const vals = {}
        INTEGRATION_META.find(m => m.id === id)?.fields.forEach(f => { vals[f.key] = settings[f.key] || '' })
        setFieldValues(vals)
        setShowSecrets({})
        setTestResult(null)
        setShowConfigPanel(true)
    }

    const handleToggle = async (id, e) => {
        e?.stopPropagation()
        const current = intSettings[id]?.enabled || false
        const updated = { ...intSettings, [id]: { ...(intSettings[id] || {}), enabled: !current } }
        setIntSettings(updated)
        await supabase.from('platform_settings').upsert({ key: 'integrations', value: updated }, { onConflict: 'key' })
        showToast(`${INTEGRATION_META.find(m => m.id === id)?.name} ${!current ? 'enabled' : 'disabled'}`)
    }

    const handleSave = async () => {
        setSaving(true)
        setTestResult(null)
        const updated = {
            ...intSettings,
            [selectedId]: {
                ...(intSettings[selectedId] || {}),
                enabled: selectedSettings.enabled || false,
                ...fieldValues,
            },
        }
        const { error } = await supabase.from('platform_settings').upsert({ key: 'integrations', value: updated }, { onConflict: 'key' })
        if (error) showToast('Failed to save settings', 'error')
        else {
            setIntSettings(updated)
            showToast('Credentials saved — click "Test Connection" to verify')
        }
        setSaving(false)
    }

    const handleTestConnection = async () => {
        setTesting(true)
        setTestResult(null)

        // Save first so edge function reads latest credentials
        const updated = {
            ...intSettings,
            [selectedId]: { ...(intSettings[selectedId] || {}), enabled: selectedSettings.enabled || false, ...fieldValues },
        }
        await supabase.from('platform_settings').upsert({ key: 'integrations', value: updated }, { onConflict: 'key' })
        setIntSettings(updated)

        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-integration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session?.access_token}`,
                apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ integration_id: selectedId }),
        })
        const result = await res.json()
        setTesting(false)

        if (result.success) {
            setTestResult({ ok: true, data: result.data })
            // Reload to get stored connected_info
            await loadSettings()
            showToast(`${selectedMeta?.name} connected successfully!`)
        } else {
            setTestResult({ ok: false, error: result.error })
            showToast(result.error || 'Connection failed', 'error')
        }
    }

    const connectedInfo = selectedSettings.connected_info || null
    const lastVerified = selectedSettings.last_verified
        ? new Date(selectedSettings.last_verified).toLocaleString()
        : null

    return (
        <div className="flex flex-col gap-6 relative">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white max-w-sm ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">Click any integration to configure credentials and test the connection.</p>
            </div>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {INTEGRATION_META.map((int) => {
                    const settings = intSettings[int.id] || {}
                    const connected = settings.enabled && settings.last_verified
                    const enabled = settings.enabled || false
                    const info = settings.connected_info

                    return (
                        <Card
                            key={int.id}
                            className={`relative flex flex-col justify-between p-6 transition-all cursor-pointer group ${connected ? 'border-2 border-emerald-400 dark:border-emerald-600 shadow-md' : enabled ? 'border-2 border-primary/40' : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600'}`}
                            onClick={() => openConfig(int.id)}
                        >
                            {/* Status badge */}
                            <div className="absolute top-4 right-4">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${connected ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400' : enabled ? 'bg-amber-50 text-amber-700 ring-amber-500/20' : 'bg-slate-50 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : enabled ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                                    {connected ? 'Verified' : enabled ? 'Saved' : 'Not connected'}
                                </span>
                            </div>

                            <div className="flex items-start gap-4 mb-4 pr-24">
                                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-white shadow-sm" style={{ backgroundColor: int.color }}>
                                    <span className="material-symbols-outlined text-[26px]">{int.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{int.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{int.description}</p>
                                </div>
                            </div>

                            {/* Connected info preview */}
                            {connected && info && (
                                <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        {info.account_name || int.name}
                                    </p>
                                    {info.mode && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">{info.mode} mode</p>
                                    )}
                                    {info.total_subscribers !== undefined && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">{info.total_subscribers.toLocaleString()} subscribers</p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                                <button
                                    onClick={(e) => handleToggle(int.id, e)}
                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${enabled ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); openConfig(int.id) }}
                                    className="text-xs font-semibold text-primary hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1"
                                >
                                    Configure <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Configuration Panel (Drawer) */}
            {showConfigPanel && selectedMeta && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowConfigPanel(false)}></div>
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="w-screen max-w-lg">
                            <div className="flex h-full flex-col overflow-y-auto bg-white dark:bg-slate-900 shadow-2xl">

                                {/* Header */}
                                <div className="px-6 py-6 flex-shrink-0" style={{ backgroundColor: selectedMeta.color }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-[22px]">{selectedMeta.icon}</span>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-white">{selectedMeta.name}</h2>
                                                <p className="text-xs text-white/70">{selectedMeta.description}</p>
                                            </div>
                                        </div>
                                        <button className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10" onClick={() => setShowConfigPanel(false)}>
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>

                                    {/* Connection status bar */}
                                    <div className="mt-5 flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                                        <div>
                                            {connectedInfo ? (
                                                <>
                                                    <p className="text-sm font-bold text-white">{connectedInfo.account_name}</p>
                                                    <p className="text-xs text-white/70">Last verified: {lastVerified}</p>
                                                </>
                                            ) : (
                                                <p className="text-sm font-medium text-white/80">
                                                    {selectedSettings.enabled ? 'Credentials saved — not yet verified' : 'Not connected'}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updated = { ...intSettings, [selectedId]: { ...(intSettings[selectedId] || {}), enabled: !selectedSettings.enabled } }
                                                setIntSettings(updated)
                                            }}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-white/30 transition-colors ${selectedSettings.enabled ? 'bg-white/30' : 'bg-white/10'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${selectedSettings.enabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable body */}
                                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                                    {/* Test result banner */}
                                    {testResult && (
                                        <div className={`rounded-xl p-4 flex items-start gap-3 ${testResult.ok ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                            <span className={`material-symbols-outlined flex-shrink-0 ${testResult.ok ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {testResult.ok ? 'check_circle' : 'error'}
                                            </span>
                                            <div>
                                                <p className={`text-sm font-bold ${testResult.ok ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                                                    {testResult.ok ? 'Connection successful!' : 'Connection failed'}
                                                </p>
                                                {testResult.ok ? (
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                        Connected as: {testResult.data.account_name}
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{testResult.error}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Connected account info */}
                                    {connectedInfo && !testResult && (
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-emerald-500 text-[18px]">verified</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">Connected Account</span>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {selectedMeta.infoFields.map(f => connectedInfo[f.key] !== undefined && (
                                                    <div key={f.key} className="flex items-center gap-3 px-4 py-3">
                                                        <span className="material-symbols-outlined text-slate-400 text-[18px]">{f.icon}</span>
                                                        <div className="flex-1">
                                                            <p className="text-xs text-slate-500">{f.label}</p>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                {typeof connectedInfo[f.key] === 'number'
                                                                    ? connectedInfo[f.key].toLocaleString()
                                                                    : String(connectedInfo[f.key])}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Features this integration powers */}
                                    {selectedMeta.features && (
                                        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-[18px]">electric_bolt</span>
                                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {connectedInfo ? 'Active Features' : 'Features unlocked after connecting'}
                                                </span>
                                            </div>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {selectedMeta.features.map((f, i) => (
                                                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                                                        <span className={`material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 ${connectedInfo ? 'text-emerald-500' : 'text-slate-400'}`}>{f.icon}</span>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{f.label}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{f.where}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* API Credentials */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400 text-[18px]">key</span>
                                            API Credentials
                                        </h3>
                                        {selectedMeta.fields.map(field => (
                                            <label key={field.key} className="block">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</span>
                                                {field.type === 'secret' ? (
                                                    <div className="mt-1.5 relative">
                                                        <input
                                                            className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-2.5 pr-10 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                            type={showSecrets[field.key] ? 'text' : 'password'}
                                                            value={fieldValues[field.key] || ''}
                                                            placeholder={field.placeholder}
                                                            onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                        />
                                                        <button
                                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                                                            onClick={() => setShowSecrets(s => ({ ...s, [field.key]: !s[field.key] }))}
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">{showSecrets[field.key] ? 'visibility' : 'visibility_off'}</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <input
                                                        className="mt-1.5 block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm p-2.5 font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                        type="text"
                                                        value={fieldValues[field.key] || ''}
                                                        placeholder={field.placeholder}
                                                        onChange={e => setFieldValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                    />
                                                )}
                                            </label>
                                        ))}
                                    </div>

                                    {/* Test Connection button */}
                                    <button
                                        onClick={handleTestConnection}
                                        disabled={testing}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${testing ? 'animate-spin' : ''}`}>
                                            {testing ? 'sync' : 'wifi_tethering'}
                                        </span>
                                        {testing ? 'Testing connection...' : 'Save & Test Connection'}
                                    </button>

                                    {/* Documentation link */}
                                    <a
                                        href={selectedMeta.docs}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <span className="material-symbols-outlined text-blue-500 text-[20px]">menu_book</span>
                                        <div>
                                            <p className="font-semibold">View {selectedMeta.name} Documentation</p>
                                            <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">Where to find your API keys</p>
                                        </div>
                                        <span className="material-symbols-outlined text-blue-400 ml-auto text-[18px]">open_in_new</span>
                                    </a>
                                </div>

                                {/* Footer */}
                                <div className="flex-shrink-0 flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                    <Button variant="outline" onClick={() => setShowConfigPanel(false)}>Cancel</Button>
                                    <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Credentials'}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
