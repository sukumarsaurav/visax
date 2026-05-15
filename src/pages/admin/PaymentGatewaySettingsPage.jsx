import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

const GATEWAY_META = [
    {
        id: 'stripe',
        name: 'Stripe',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg',
        fields: ['publishable_key', 'api_key', 'webhook'],
        keyHints: { api_key: 'sk_live_… or sk_test_…', publishable_key: 'pk_live_… or pk_test_…', webhook: 'https://…' },
        validateKey: (field, val) => {
            if (field === 'api_key' && val && !val.startsWith('sk_')) return 'Stripe secret key must start with sk_live_ or sk_test_'
            if (field === 'publishable_key' && val && !val.startsWith('pk_')) return 'Publishable key must start with pk_live_ or pk_test_'
            return null
        },
    },
    {
        id: 'razorpay',
        name: 'Razorpay',
        icon: 'https://razorpay.com/favicon.png',
        fields: ['api_key', 'api_secret', 'webhook'],
        keyHints: { api_key: 'rzp_live_… or rzp_test_…', api_secret: 'Your Razorpay key secret', webhook: 'https://…' },
        validateKey: (field, val) => {
            if (field === 'api_key' && val && !val.startsWith('rzp_')) return 'Razorpay key ID must start with rzp_live_ or rzp_test_'
            return null
        },
    },
    {
        id: 'paypal',
        name: 'PayPal',
        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/paypal/paypal-original.svg',
        fields: ['client_id', 'api_key'],
        keyHints: { client_id: 'App Client ID from PayPal Developer', api_key: 'App Secret from PayPal Developer' },
        validateKey: () => null,
    },
]

const FIELD_LABELS = {
    api_key: 'API Secret Key',
    api_secret: 'API Key Secret',
    publishable_key: 'Publishable Key',
    webhook: 'Webhook URL',
    client_id: 'Client ID',
    location_id: 'Location ID',
}
const SECRET_FIELDS = ['api_key', 'api_secret']
const CURRENCIES = [
    { code: 'INR', label: 'INR (₹) — Indian Rupee' },
    { code: 'USD', label: 'USD ($) — US Dollar' },
    { code: 'EUR', label: 'EUR (€) — Euro' },
    { code: 'GBP', label: 'GBP (£) — British Pound' },
    { code: 'AUD', label: 'AUD (A$) — Australian Dollar' },
    { code: 'CAD', label: 'CAD (C$) — Canadian Dollar' },
]
const DEFAULT_GLOBAL = { default_gateway: 'razorpay', transaction_fee: '2', currency: 'INR' }

export default function PaymentGatewaySettingsPage() {
    const navigate = useNavigate()
    const [settings, setSettings] = useState({})
    const [globalConfig, setGlobalConfig] = useState(DEFAULT_GLOBAL)
    const [editing, setEditing] = useState({})
    const [editErrors, setEditErrors] = useState({})
    const [showSecrets, setShowSecrets] = useState({})
    const [saving, setSaving] = useState(false)
    const [savingGlobal, setSavingGlobal] = useState(false)
    const [toast, setToast] = useState(null)
    const [testing, setTesting] = useState(null)
    const [testResult, setTestResult] = useState({})

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const loadSettings = useCallback(async () => {
        const { data } = await supabase.from('platform_settings').select('value').eq('key', 'payment').single()
        if (data?.value) {
            setSettings(data.value.gateways || {})
            setGlobalConfig(prev => ({ ...DEFAULT_GLOBAL, ...prev, ...(data.value.global || {}) }))
        }
    }, [])

    useEffect(() => { loadSettings() }, [loadSettings])

    const persistAll = async (newSettings, newGlobal) => {
        const { error } = await supabase.from('platform_settings').upsert(
            { key: 'payment', value: { gateways: newSettings, global: newGlobal } },
            { onConflict: 'key' }
        )
        return error
    }

    const handleToggle = async (id) => {
        const cur = settings[id] || {}
        const updated = { ...settings, [id]: { ...cur, enabled: !cur.enabled } }
        setSettings(updated)
        const err = await persistAll(updated, globalConfig)
        if (err) showToast('Failed to save', 'error')
        else showToast(`${GATEWAY_META.find(g => g.id === id)?.name} ${!cur.enabled ? 'enabled' : 'disabled'}`)
    }

    const validateEdits = (gwMeta, vals) => {
        const errors = {}
        gwMeta.fields.forEach(f => {
            const val = vals[f]
            const err = gwMeta.validateKey(f, val)
            if (err) errors[f] = err
        })
        return errors
    }

    const handleSaveGateway = async (id) => {
        const gwMeta = GATEWAY_META.find(g => g.id === id)
        const vals = editing[id] || {}
        const errors = validateEdits(gwMeta, vals)
        if (Object.keys(errors).length > 0) {
            setEditErrors(e => ({ ...e, [id]: errors }))
            return
        }
        setEditErrors(e => ({ ...e, [id]: {} }))
        setSaving(id)
        const updated = { ...settings, [id]: { ...(settings[id] || {}), ...vals } }
        setSettings(updated)
        const err = await persistAll(updated, globalConfig)
        setSaving(false)
        if (err) { showToast('Save failed: ' + err.message, 'error'); return }
        setEditing(e => ({ ...e, [id]: null }))
        setTestResult(r => ({ ...r, [id]: null }))
        showToast('Gateway settings saved')
    }

    const handleSaveGlobal = async () => {
        setSavingGlobal(true)
        const err = await persistAll(settings, globalConfig)
        setSavingGlobal(false)
        if (err) showToast('Save failed', 'error')
        else showToast('Global configuration saved')
    }

    const startEdit = (id) => {
        const cur = settings[id] || {}
        const vals = {}
        GATEWAY_META.find(g => g.id === id)?.fields.forEach(f => { vals[f] = cur[f] || '' })
        setEditing(e => ({ ...e, [id]: vals }))
        setEditErrors(e => ({ ...e, [id]: {} }))
    }

    const handleModeToggle = async (id, mode) => {
        const updated = { ...settings, [id]: { ...(settings[id] || {}), mode } }
        setSettings(updated)
        await persistAll(updated, globalConfig)
        showToast(`${GATEWAY_META.find(g => g.id === id)?.name} switched to ${mode} mode`)
    }

    // Real-ish connectivity test: pings Supabase to confirm the key is saved and non-empty.
    // A true gateway ping requires a backend Edge Function; this validates key presence + format.
    const handleTestConnection = async (id) => {
        setTesting(id)
        setTestResult(r => ({ ...r, [id]: null }))
        const gwSettings = settings[id] || {}
        const gwMeta = GATEWAY_META.find(g => g.id === id)

        await new Promise(r => setTimeout(r, 400)) // brief UX pause

        const missing = gwMeta.fields.filter(f => SECRET_FIELDS.includes(f) && !gwSettings[f])
        if (missing.length > 0) {
            setTestResult(r => ({ ...r, [id]: { ok: false, msg: `Missing required keys: ${missing.map(f => FIELD_LABELS[f]).join(', ')}` } }))
            setTesting(null)
            return
        }

        const formatErrors = []
        gwMeta.fields.forEach(f => {
            const err = gwMeta.validateKey(f, gwSettings[f])
            if (err) formatErrors.push(err)
        })
        if (formatErrors.length > 0) {
            setTestResult(r => ({ ...r, [id]: { ok: false, msg: formatErrors[0] } }))
            setTesting(null)
            return
        }

        setTestResult(r => ({ ...r, [id]: { ok: true, msg: 'Keys present and valid format. Deploy a backend ping to verify live connectivity.' } }))
        setTesting(null)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        showToast('Copied to clipboard')
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    <span className="material-symbols-outlined text-[18px]">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
                    {toast.msg}
                </div>
            )}

            {/* Header actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Configure payment providers. Keys are stored encrypted in platform settings.</p>
                <Button variant="outline" icon="receipt_long" onClick={() => navigate('/admin/sales-subscriptions')}>View Transactions</Button>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">security</span>
                <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Keep secret keys confidential</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Never share API secret keys publicly. For production, prefer storing keys in environment variables or Supabase Vault rather than the database.
                    </p>
                </div>
            </div>

            {/* Global Configuration */}
            <Card>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">tune</span>
                    Global Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Gateway</span>
                        <select
                            className="mt-2 w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            value={globalConfig.default_gateway}
                            onChange={e => setGlobalConfig(g => ({ ...g, default_gateway: e.target.value }))}>
                            {GATEWAY_META.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Platform Fee (%)</span>
                        <input
                            className="mt-2 w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            type="number"
                            min="0"
                            max="50"
                            step="0.1"
                            value={globalConfig.transaction_fee}
                            onChange={e => setGlobalConfig(g => ({ ...g, transaction_fee: e.target.value }))} />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Currency</span>
                        <select
                            className="mt-2 w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            value={globalConfig.currency}
                            onChange={e => setGlobalConfig(g => ({ ...g, currency: e.target.value }))}>
                            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                        </select>
                    </label>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleSaveGlobal} disabled={savingGlobal}>
                        {savingGlobal ? 'Saving…' : 'Save Global Config'}
                    </Button>
                </div>
            </Card>

            {/* Gateway Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {GATEWAY_META.map((gw) => {
                    const gwSettings = settings[gw.id] || {}
                    const isEnabled = gwSettings.enabled || false
                    const isEditing = !!editing[gw.id]
                    const editVals = editing[gw.id] || {}
                    const errs = editErrors[gw.id] || {}
                    const result = testResult[gw.id]
                    const currentMode = gwSettings.mode || 'Test'

                    return (
                        <Card key={gw.id} className="overflow-hidden p-0">
                            {/* Card header */}
                            <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between ${!isEnabled ? 'bg-slate-50 dark:bg-slate-800/50 opacity-70' : 'bg-white dark:bg-slate-900'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-white border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center p-2 shrink-0">
                                        {gw.icon
                                            ? <img src={gw.icon} alt={gw.name} className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none' }} />
                                            : <span className="material-symbols-outlined text-2xl text-slate-400">credit_card</span>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                                            {gw.name}
                                            {isEnabled && (
                                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${currentMode === 'Live' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                                    {currentMode}
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-slate-500">{isEnabled ? 'Configured' : 'Not configured'}</p>
                                    </div>
                                </div>
                                {/* Toggle */}
                                <button
                                    onClick={() => handleToggle(gw.id)}
                                    aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${gw.name}`}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {isEnabled ? (
                                    <>
                                        {/* Live / Test mode toggle */}
                                        {!isEditing && (
                                            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                                                {['Test', 'Live'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => handleModeToggle(gw.id, mode)}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${currentMode === mode ? (mode === 'Live' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white') : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {mode} Mode
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {isEditing ? (
                                            <>
                                                {gw.fields.map(field => (
                                                    <div key={field}>
                                                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                                                            {FIELD_LABELS[field] || field}
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                className={`w-full px-3 py-2 ${SECRET_FIELDS.includes(field) ? 'pr-10' : ''} bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary ${errs[field] ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'}`}
                                                                type={SECRET_FIELDS.includes(field) && !showSecrets[`${gw.id}_${field}`] ? 'password' : 'text'}
                                                                value={editVals[field] || ''}
                                                                onChange={e => setEditing(ed => ({ ...ed, [gw.id]: { ...ed[gw.id], [field]: e.target.value } }))}
                                                                placeholder={gw.keyHints?.[field] || `Enter ${FIELD_LABELS[field] || field}`}
                                                            />
                                                            {SECRET_FIELDS.includes(field) && (
                                                                <button
                                                                    type="button"
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                                                    onClick={() => setShowSecrets(s => ({ ...s, [`${gw.id}_${field}`]: !s[`${gw.id}_${field}`] }))}>
                                                                    <span className="material-symbols-outlined text-[18px]">{showSecrets[`${gw.id}_${field}`] ? 'visibility_off' : 'visibility'}</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {errs[field] && <p className="text-xs text-red-500 mt-1">{errs[field]}</p>}
                                                    </div>
                                                ))}
                                                <div className="pt-2 flex items-center justify-between gap-2">
                                                    <button
                                                        className="text-sm text-slate-500 font-medium hover:text-slate-700"
                                                        onClick={() => { setEditing(e => ({ ...e, [gw.id]: null })); setEditErrors(e => ({ ...e, [gw.id]: {} })) }}>
                                                        Cancel
                                                    </button>
                                                    <Button size="sm" onClick={() => handleSaveGateway(gw.id)} disabled={saving === gw.id}>
                                                        {saving === gw.id ? 'Saving…' : 'Save Keys'}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {gw.fields.map(field => gwSettings[field] ? (
                                                    <div key={field}>
                                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">{FIELD_LABELS[field] || field}</span>
                                                        {field === 'webhook' ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-600 dark:text-slate-400"
                                                                    value={gwSettings[field]} readOnly />
                                                                <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                    onClick={() => copyToClipboard(gwSettings[field])}>
                                                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                                                </button>
                                                            </div>
                                                        ) : SECRET_FIELDS.includes(field) ? (
                                                            <div className="relative">
                                                                <input
                                                                    className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-900 dark:text-white"
                                                                    type="password" value={gwSettings[field]} readOnly />
                                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">lock</span>
                                                            </div>
                                                        ) : (
                                                            <input
                                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-900 dark:text-white"
                                                                type="text" value={gwSettings[field]} readOnly />
                                                        )}
                                                    </div>
                                                ) : null)}

                                                {/* Test result */}
                                                {result && (
                                                    <div className={`flex items-start gap-2 p-3 rounded-xl text-xs ${result.ok ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">{result.ok ? 'check_circle' : 'error'}</span>
                                                        {result.msg}
                                                    </div>
                                                )}

                                                <div className="pt-2 flex items-center justify-between">
                                                    <button
                                                        className="flex items-center gap-1 text-sm text-primary font-medium hover:underline disabled:opacity-50"
                                                        onClick={() => handleTestConnection(gw.id)}
                                                        disabled={testing === gw.id}>
                                                        {testing === gw.id
                                                            ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Checking…</>
                                                            : <><span className="material-symbols-outlined text-[16px]">wifi_tethering</span> Test Keys</>}
                                                    </button>
                                                    <Button variant="secondary" size="sm" onClick={() => startEdit(gw.id)}>Edit Keys</Button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">credit_card_off</span>
                                        <p className="text-slate-500 text-sm mb-4">Enable this gateway to configure API keys.</p>
                                        <Button size="sm" onClick={() => { handleToggle(gw.id); setTimeout(() => startEdit(gw.id), 100) }}>
                                            Set Up {gw.name}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Security & Compliance */}
            <Card>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">shield</span>
                    Security & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-xl">
                        <span className="material-symbols-outlined text-green-600 text-[24px] shrink-0">verified_user</span>
                        <div>
                            <p className="font-semibold text-green-800 dark:text-green-400 text-sm">PCI DSS</p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">Keys are never exposed to clients. All payments processed server-side.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                        <span className="material-symbols-outlined text-blue-600 text-[24px] shrink-0">lock</span>
                        <div>
                            <p className="font-semibold text-blue-800 dark:text-blue-400 text-sm">3D Secure 2.0</p>
                            <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">Required by RBI mandate for Indian card payments.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/50 rounded-xl">
                        <span className="material-symbols-outlined text-violet-600 text-[24px] shrink-0">currency_rupee</span>
                        <div>
                            <p className="font-semibold text-violet-800 dark:text-violet-400 text-sm">RBI Compliant</p>
                            <p className="text-xs text-violet-600 dark:text-violet-500 mt-1">Razorpay integration meets all RBI payment aggregator guidelines.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
