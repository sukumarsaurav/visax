import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

const DEFAULT_CONFIG = {
    referrer_reward: 50,
    referee_discount: 20,
    min_subscription: 'None (all users can refer)',
    fraud_protection: 'moderate',
}

export default function ReferralProgramPage() {
    const [activeTab, setActiveTab] = useState('configuration')
    const [promotions, setPromotions] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [savingConfig, setSavingConfig] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [toast, setToast] = useState(null)
    const [stats, setStats] = useState({ total: 0, active: 0, totalRedemptions: 0, conversionRate: 0 })
    const [form, setForm] = useState({ code: '', discount_percent: 10, description: '', valid_months: 1, max_redemptions: '', expires_at: '' })
    const [config, setConfig] = useState(DEFAULT_CONFIG)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchPromotions = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
        const list = data || []
        setPromotions(list)
        setStats({
            total: list.length,
            active: list.filter(p => p.status === 'active').length,
            totalRedemptions: list.reduce((s, p) => s + (p.redemption_count || 0), 0),
            conversionRate: list.length > 0 ? Math.round((list.filter(p => p.redemption_count > 0).length / list.length) * 100) : 0,
        })
        setLoading(false)
    }, [])

    const fetchConfig = useCallback(async () => {
        const { data } = await supabase.from('platform_settings').select('value').eq('key', 'referral_config').single()
        if (data?.value) setConfig(c => ({ ...c, ...data.value }))
    }, [])

    const handleSaveConfig = async () => {
        setSavingConfig(true)
        const { error } = await supabase.from('platform_settings').upsert(
            { key: 'referral_config', value: config, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        )
        if (error) showToast('Failed: ' + error.message, 'error')
        else showToast('Settings saved!')
        setSavingConfig(false)
    }

    useEffect(() => { fetchPromotions(); fetchConfig() }, [fetchPromotions, fetchConfig])

    const handleCreate = async () => {
        if (!form.code.trim()) { showToast('Promo code is required', 'error'); return }
        setSaving(true)
        const payload = {
            code: form.code.toUpperCase().trim(),
            discount_percent: Number(form.discount_percent),
            description: form.description,
            valid_months: Number(form.valid_months),
            max_redemptions: form.max_redemptions ? Number(form.max_redemptions) : null,
            expires_at: form.expires_at || null,
            status: 'active',
        }
        const { error } = await supabase.from('promotions').insert(payload)
        if (error) { showToast('Failed: ' + error.message, 'error') }
        else {
            showToast('Promotion created!')
            setShowAddModal(false)
            setForm({ code: '', discount_percent: 10, description: '', valid_months: 1, max_redemptions: '', expires_at: '' })
            fetchPromotions()
        }
        setSaving(false)
    }

    const handleToggleStatus = async (promo) => {
        const newStatus = promo.status === 'active' ? 'paused' : 'active'
        await supabase.from('promotions').update({ status: newStatus }).eq('id', promo.id)
        showToast(`Promotion ${newStatus}`)
        fetchPromotions()
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this promotion?')) return
        await supabase.from('promotions').delete().eq('id', id)
        showToast('Deleted')
        fetchPromotions()
    }

    const statusBadge = (status) => {
        const map = {
            active: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
            expiring_soon: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
            expired: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
            paused: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
        }
        return map[status] || map.expired
    }

    return (
        <div className="flex flex-col gap-6 relative">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="outline" icon="description">View Reports</Button>
                <Button icon="add" onClick={() => setShowAddModal(true)}>Create Promotion</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Promotions', value: stats.total, trend: 'All promo codes', trendColor: 'slate', icon: 'sell', iconColor: 'primary' },
                    { label: 'Active Codes', value: stats.active, trend: 'Currently active', trendColor: 'green', icon: 'check_circle', iconColor: 'green' },
                    { label: 'Total Redemptions', value: stats.totalRedemptions.toLocaleString(), trend: 'Across all codes', trendColor: 'slate', icon: 'sync_alt', iconColor: 'purple' },
                    { label: 'Usage Rate', value: `${stats.conversionRate}%`, trend: 'Codes with redemptions', trendColor: 'slate', icon: 'percent', iconColor: 'amber' },
                ].map((stat) => (
                    <Card key={stat.label} className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                            <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${stat.trendColor === 'green' ? 'text-green-600' : 'text-slate-500'}`}>{stat.trend}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.iconColor === 'primary' ? 'bg-blue-50 dark:bg-blue-900/20 text-primary' : stat.iconColor === 'green' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : stat.iconColor === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {['configuration', 'promotions'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            {tab === 'configuration' ? 'Program Settings' : 'Promo Codes'}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'configuration' && (
                <Card>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">Referral Program Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Referrer Reward</span>
                            <div className="relative mt-2">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">₹</span>
                                <input type="number" value={config.referrer_reward}
                                    onChange={e => setConfig(c => ({ ...c, referrer_reward: Number(e.target.value) }))}
                                    className="w-full pl-7 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Credited when referee converts</p>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Referee Discount</span>
                            <div className="relative mt-2">
                                <input type="number" value={config.referee_discount}
                                    onChange={e => setConfig(c => ({ ...c, referee_discount: Number(e.target.value) }))}
                                    className="w-full pr-8 py-2.5 px-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" />
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">%</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Applied to referee's first payment</p>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Subscription Required</span>
                            <select value={config.min_subscription}
                                onChange={e => setConfig(c => ({ ...c, min_subscription: e.target.value }))}
                                className="mt-2 w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary">
                                <option>None (all users can refer)</option>
                                <option>Starter</option>
                                <option>Professional</option>
                                <option>Enterprise</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fraud Protection</span>
                            <select value={config.fraud_protection}
                                onChange={e => setConfig(c => ({ ...c, fraud_protection: e.target.value }))}
                                className="mt-2 w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary">
                                <option value="low">Low — Flag obvious fraud only</option>
                                <option value="moderate">Moderate — Balanced protection</option>
                                <option value="strict">Strict — Manual review of all</option>
                            </select>
                        </label>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSaveConfig} disabled={savingConfig}>{savingConfig ? 'Saving...' : 'Save Settings'}</Button>
                    </div>
                </Card>
            )}

            {activeTab === 'promotions' && (
                <Card className="p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                {['Code', 'Discount', 'Description', 'Redemptions', 'Expires', 'Status', ''].map(h => (
                                    <th key={h} className="py-4 px-5 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {loading ? (
                                [1, 2, 3].map(i => <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-6 animate-pulse rounded bg-slate-100 dark:bg-slate-800" /></td></tr>)
                            ) : promotions.length === 0 ? (
                                <tr><td colSpan={7} className="py-16 text-center text-sm text-slate-400">
                                    <span className="material-symbols-outlined text-[48px] block mb-2">sell</span>
                                    No promotions yet. Create your first promo code.
                                </td></tr>
                            ) : promotions.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                                    <td className="py-4 px-5 font-mono font-bold text-slate-900 dark:text-white">{p.code}</td>
                                    <td className="py-4 px-5 font-bold text-primary">{p.discount_percent}% off</td>
                                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">{p.description || '—'}</td>
                                    <td className="py-4 px-5 text-slate-700 dark:text-slate-300">
                                        {p.redemption_count || 0}{p.max_redemptions ? ` / ${p.max_redemptions}` : ''}
                                    </td>
                                    <td className="py-4 px-5 text-slate-500 dark:text-slate-400">
                                        {p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="py-4 px-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusBadge(p.status)}`}>
                                            <span className={`size-1.5 rounded-full ${p.status === 'active' ? 'bg-green-600' : p.status === 'paused' ? 'bg-red-600' : 'bg-gray-500'}`}></span>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleToggleStatus(p)}
                                                className={`p-1.5 rounded-md text-xs ${p.status === 'active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                                                <span className="material-symbols-outlined text-[18px]">{p.status === 'active' ? 'pause_circle' : 'play_circle'}</span>
                                            </button>
                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* Add Promotion Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Promo Code</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Promo Code *</span>
                            <input className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:ring-1 focus:ring-primary outline-none"
                                placeholder="e.g. SUMMER2024"
                                value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Discount %</span>
                                <input type="number" min="1" max="100" className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Valid (months)</span>
                                <input type="number" min="1" className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    value={form.valid_months} onChange={e => setForm(f => ({ ...f, valid_months: e.target.value }))} />
                            </label>
                        </div>
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</span>
                            <input className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                placeholder="e.g. 20% off for 3 months"
                                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Max Redemptions</span>
                                <input type="number" className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Unlimited"
                                    value={form.max_redemptions} onChange={e => setForm(f => ({ ...f, max_redemptions: e.target.value }))} />
                            </label>
                            <label className="block">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expires</span>
                                <input type="date" className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                                    value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                            </label>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create Code'}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
