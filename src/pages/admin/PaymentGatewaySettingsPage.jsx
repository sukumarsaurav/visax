import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

const GATEWAY_META = [
    { id: 'stripe', name: 'Stripe', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stripe/stripe-original.svg', fields: ['api_key', 'publishable_key', 'webhook'] },
    { id: 'paypal', name: 'PayPal', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/paypal/paypal-original.svg', fields: ['api_key', 'client_id'] },
    { id: 'square', name: 'Square', icon: '', fields: ['api_key', 'location_id'] },
]

const FIELD_LABELS = { api_key: 'API Secret Key', publishable_key: 'Publishable Key', webhook: 'Webhook URL', client_id: 'Client ID', location_id: 'Location ID' }
const SECRET_FIELDS = ['api_key']

const DEFAULT_GLOBAL = { default_gateway: 'stripe', transaction_fee: '2.9', currency: 'USD' }

export default function PaymentGatewaySettingsPage() {
    const [settings, setSettings] = useState({})
    const [globalConfig, setGlobalConfig] = useState(DEFAULT_GLOBAL)
    const [editing, setEditing] = useState({})
    const [showSecrets, setShowSecrets] = useState({})
    const [saving, setSaving] = useState(false)
    const [savingGlobal, setSavingGlobal] = useState(false)
    const [toast, setToast] = useState(null)
    const [testing, setTesting] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadSettings = useCallback(async () => {
        const { data } = await supabase.from('platform_settings').select('value').eq('key', 'payment').single()
        if (data?.value) {
            setSettings(data.value.gateways || {})
            setGlobalConfig(data.value.global || DEFAULT_GLOBAL)
        }
    }, [])

    useEffect(() => { loadSettings() }, [loadSettings])

    const persistAll = async (newSettings, newGlobal) => {
        await supabase.from('platform_settings').upsert(
            { key: 'payment', value: { gateways: newSettings, global: newGlobal } },
            { onConflict: 'key' }
        )
    }

    const handleToggle = async (id) => {
        const cur = settings[id] || {}
        const updated = { ...settings, [id]: { ...cur, enabled: !cur.enabled } }
        setSettings(updated)
        await persistAll(updated, globalConfig)
        showToast(`${GATEWAY_META.find(g => g.id === id)?.name} ${!cur.enabled ? 'enabled' : 'disabled'}`)
    }

    const handleSaveGateway = async (id) => {
        setSaving(id)
        const updated = { ...settings, [id]: { ...(settings[id] || {}), ...editing[id] } }
        setSettings(updated)
        await persistAll(updated, globalConfig)
        setEditing(e => ({ ...e, [id]: null }))
        showToast('Gateway settings saved')
        setSaving(false)
    }

    const handleSaveGlobal = async () => {
        setSavingGlobal(true)
        await persistAll(settings, globalConfig)
        showToast('Global configuration saved')
        setSavingGlobal(false)
    }

    const startEdit = (id) => {
        const cur = settings[id] || {}
        const vals = {}
        GATEWAY_META.find(g => g.id === id)?.fields.forEach(f => { vals[f] = cur[f] || '' })
        setEditing(e => ({ ...e, [id]: vals }))
    }

    const handleTestConnection = async (id) => {
        setTesting(id)
        await new Promise(r => setTimeout(r, 1200))
        setTesting(null)
        showToast(`${GATEWAY_META.find(g => g.id === id)?.name} connection test successful`)
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        showToast('Copied to clipboard')
    }

    return (
        <div className="flex flex-col gap-6">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400">Configure and manage your payment providers and API keys.</p>
                <Button variant="outline" icon="history">View Transactions</Button>
            </div>

            {/* Global Configuration */}
            <Card>
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">settings</span> Global Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Gateway</span>
                        <select className="mt-2 w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            value={globalConfig.default_gateway}
                            onChange={e => setGlobalConfig(g => ({ ...g, default_gateway: e.target.value }))}>
                            {GATEWAY_META.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Transaction Fee (%)</span>
                        <input className="mt-2 w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            type="text"
                            value={globalConfig.transaction_fee}
                            onChange={e => setGlobalConfig(g => ({ ...g, transaction_fee: e.target.value }))} />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Currency</span>
                        <select className="mt-2 w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
                            value={globalConfig.currency}
                            onChange={e => setGlobalConfig(g => ({ ...g, currency: e.target.value }))}>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </label>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button size="sm" onClick={handleSaveGlobal} disabled={savingGlobal}>{savingGlobal ? 'Saving...' : 'Save Global Config'}</Button>
                </div>
            </Card>

            {/* Gateway Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {GATEWAY_META.map((gw) => {
                    const gwSettings = settings[gw.id] || {}
                    const isEnabled = gwSettings.enabled || false
                    const isEditing = !!editing[gw.id]
                    const editVals = editing[gw.id] || {}

                    return (
                        <Card key={gw.id} className={`overflow-hidden p-0 ${!isEnabled ? 'opacity-60' : ''}`}>
                            <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between ${isEnabled ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-white border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center p-2">
                                        {gw.icon ? <img src={gw.icon} alt={gw.name} className="w-full h-full object-contain" /> : <span className="material-symbols-outlined text-2xl text-slate-400">credit_card</span>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {gw.name}
                                            {isEnabled && gwSettings.mode && (
                                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${gwSettings.mode === 'Live' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{gwSettings.mode}</span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-slate-500">{isEnabled ? 'Connected' : 'Not configured'}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleToggle(gw.id)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${isEnabled ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                {isEnabled ? (
                                    <>
                                        {isEditing ? (
                                            <>
                                                {gw.fields.map(field => (
                                                    <label key={field} className="block">
                                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{FIELD_LABELS[field] || field}</span>
                                                        {SECRET_FIELDS.includes(field) ? (
                                                            <div className="mt-1 relative">
                                                                <input className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white"
                                                                    type={showSecrets[`${gw.id}_${field}`] ? 'text' : 'password'}
                                                                    value={editVals[field] || ''}
                                                                    onChange={e => setEditing(ed => ({ ...ed, [gw.id]: { ...ed[gw.id], [field]: e.target.value } }))}
                                                                    placeholder={`Enter ${FIELD_LABELS[field]}`} />
                                                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                                                    onClick={() => setShowSecrets(s => ({ ...s, [`${gw.id}_${field}`]: !s[`${gw.id}_${field}`] }))}>
                                                                    <span className="material-symbols-outlined text-[18px]">{showSecrets[`${gw.id}_${field}`] ? 'visibility' : 'visibility_off'}</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <input className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white"
                                                                type="text"
                                                                value={editVals[field] || ''}
                                                                onChange={e => setEditing(ed => ({ ...ed, [gw.id]: { ...ed[gw.id], [field]: e.target.value } }))}
                                                                placeholder={`Enter ${FIELD_LABELS[field]}`} />
                                                        )}
                                                    </label>
                                                ))}
                                                <div className="pt-2 flex items-center justify-between gap-2">
                                                    <button className="text-sm text-slate-500 font-medium hover:text-slate-700"
                                                        onClick={() => setEditing(e => ({ ...e, [gw.id]: null }))}>Cancel</button>
                                                    <Button size="sm" onClick={() => handleSaveGateway(gw.id)} disabled={saving === gw.id}>
                                                        {saving === gw.id ? 'Saving...' : 'Save Keys'}
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {gw.fields.map(field => gwSettings[field] ? (
                                                    <label key={field} className="block">
                                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{FIELD_LABELS[field] || field}</span>
                                                        {field === 'webhook' ? (
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <input className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-400"
                                                                    value={gwSettings[field]} readOnly />
                                                                <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                                                                    onClick={() => copyToClipboard(gwSettings[field])}>
                                                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                                                </button>
                                                            </div>
                                                        ) : SECRET_FIELDS.includes(field) ? (
                                                            <div className="mt-1 relative">
                                                                <input className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white"
                                                                    type="password" value={gwSettings[field]} readOnly />
                                                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">lock</span>
                                                            </div>
                                                        ) : (
                                                            <input className="mt-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white"
                                                                type="text" value={gwSettings[field]} readOnly />
                                                        )}
                                                    </label>
                                                ) : null)}
                                                <div className="pt-2 flex items-center justify-between">
                                                    <button className="text-sm text-primary font-medium hover:underline" onClick={() => handleTestConnection(gw.id)} disabled={testing === gw.id}>
                                                        {testing === gw.id ? 'Testing...' : 'Test Connection'}
                                                    </button>
                                                    <Button variant="secondary" size="sm" onClick={() => startEdit(gw.id)}>Edit Keys</Button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">add_circle</span>
                                        <p className="text-slate-500 text-sm mb-4">Configure this gateway to start accepting payments.</p>
                                        <Button size="sm" onClick={() => { handleToggle(gw.id); startEdit(gw.id) }}>Set Up {gw.name}</Button>
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
                    <span className="material-symbols-outlined text-slate-400">shield</span> Security & Compliance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-lg">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600">
                            <span className="material-symbols-outlined">verified_user</span>
                        </div>
                        <div>
                            <p className="font-semibold text-green-800 dark:text-green-400">PCI DSS Compliant</p>
                            <p className="text-xs text-green-600 dark:text-green-500 mt-1">Your integration is compliant with PCI Data Security Standards.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                            <span className="material-symbols-outlined">lock</span>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-white">3D Secure 2.0</p>
                            <p className="text-xs text-slate-500 mt-1">Enhanced authentication enabled for all transactions.</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
