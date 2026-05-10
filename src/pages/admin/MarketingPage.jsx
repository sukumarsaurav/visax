import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { supabase } from '../../lib/supabase'

export default function MarketingPage() {
    const [selectedProgram, setSelectedProgram] = useState(null)
    const [activeTab, setActiveTab] = useState('configuration')
    const [stats, setStats] = useState({ totalPromos: 0, activePromos: 0, totalRedemptions: 0 })
    const [promotions, setPromotions] = useState([])
    const [referralConfig, setReferralConfig] = useState({
        approval_workflow: 'auto',
        referrer_reward_type: 'Account Credit ($)',
        referrer_amount: 50,
        referee_reward_type: 'Percentage Discount (%)',
        referee_amount: 15,
    })
    const [savingConfig, setSavingConfig] = useState(false)
    const [toast, setToast] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadData = useCallback(async () => {
        const { data: promos } = await supabase.from('promotions').select('*').order('created_at', { ascending: false })
        const list = promos || []
        setPromotions(list)
        setStats({
            totalPromos: list.length,
            activePromos: list.filter(p => p.status === 'active').length,
            totalRedemptions: list.reduce((s, p) => s + (p.redemption_count || 0), 0),
        })

        const { data: cfg } = await supabase.from('platform_settings').select('value').eq('key', 'referral_program').single()
        if (cfg?.value) setReferralConfig(c => ({ ...c, ...cfg.value }))
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const marketingPrograms = [
        { id: 'referral', name: 'Referral Program', description: 'Incentivize users to refer friends with rewards and credits', icon: 'group_add', status: 'active', stats: { primary: String(stats.totalRedemptions), label: 'Total Redemptions', trend: '' } },
        { id: 'promotions', name: 'Promotional Campaigns', description: 'Create time-limited offers, discount codes, and seasonal promotions', icon: 'campaign', status: 'active', stats: { primary: String(stats.activePromos), label: 'Active Campaigns', trend: '' } },
        { id: 'affiliate', name: 'Affiliate Program', description: 'Partner with influencers and bloggers for commission-based marketing', icon: 'handshake', status: 'active', stats: { primary: '—', label: 'Coming Soon', trend: '' } },
        { id: 'loyalty', name: 'Loyalty Rewards', description: 'Reward returning customers with points and exclusive benefits', icon: 'loyalty', status: 'draft', stats: { primary: '—', label: 'Coming Soon', trend: '' } },
    ]

    const handleSaveReferralConfig = async () => {
        setSavingConfig(true)
        await supabase.from('platform_settings').upsert({ key: 'referral_program', value: referralConfig }, { onConflict: 'key' })
        showToast('Referral configuration saved')
        setSavingConfig(false)
    }

    // Programs list view
    if (!selectedProgram) {
        return (
            <div className="flex flex-col gap-6">
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        {toast.msg}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-slate-500 dark:text-slate-400">Manage referrals, affiliates, loyalty rewards, and promotional campaigns.</p>
                    <Button icon="add">Create Program</Button>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Programs', value: String(stats.activePromos + 2), icon: 'campaign', color: 'primary' },
                        { label: 'Total Redemptions', value: String(stats.totalRedemptions), icon: 'trending_up', color: 'green' },
                        { label: 'Active Promotions', value: String(stats.activePromos), icon: 'payments', color: 'purple' },
                        { label: 'Total Promotions', value: String(stats.totalPromos), icon: 'pending_actions', color: 'orange' }
                    ].map((stat) => (
                        <Card key={stat.label} className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <span className={`material-symbols-outlined p-1 rounded ${stat.color === 'primary' ? 'text-primary bg-primary/10' :
                                    stat.color === 'green' ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' :
                                        stat.color === 'purple' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' :
                                            'text-orange-600 bg-orange-100 dark:bg-orange-900/30'
                                    }`}>{stat.icon}</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </Card>
                    ))}
                </div>

                {/* Programs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {marketingPrograms.map((program) => (
                        <Card key={program.id} className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                            onClick={() => setSelectedProgram(program.id)}>
                            <div className="flex items-start gap-4">
                                <div className={`size-12 rounded-xl flex items-center justify-center ${program.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    <span className="material-symbols-outlined text-2xl">{program.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{program.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${program.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{program.status}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{program.description}</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{program.stats.primary}</p>
                                            <p className="text-xs text-slate-500">{program.stats.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    // Referral Program detail view
    if (selectedProgram === 'referral') {
        return (
            <div className="flex flex-col gap-6">
                {toast && (
                    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        {toast.msg}
                    </div>
                )}

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => setSelectedProgram(null)} className="text-slate-500 hover:text-primary transition-colors">Marketing</button>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-900 dark:text-white font-medium">Referral Program</span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <p className="text-slate-500 dark:text-slate-400">Configure rules, rewards, and monitor program performance.</p>
                    <div className="flex gap-3">
                        <Button variant="outline" icon="description">View Reports</Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Redemptions', value: String(stats.totalRedemptions), icon: 'group_add', iconColor: 'primary' },
                        { label: 'Active Promotions', value: String(stats.activePromos), icon: 'sync_alt', iconColor: 'purple' },
                        { label: 'Total Promotions', value: String(stats.totalPromos), icon: 'payments', iconColor: 'orange' },
                        { label: 'Conversion Rate', value: stats.totalPromos > 0 ? `${Math.round((stats.activePromos / stats.totalPromos) * 100)}%` : '—', icon: 'trending_up', iconColor: 'blue' }
                    ].map((stat) => (
                        <Card key={stat.label} className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <span className={`material-symbols-outlined p-1 rounded ${stat.iconColor === 'primary' ? 'text-primary bg-primary/10' : stat.iconColor === 'purple' ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' : stat.iconColor === 'orange' ? 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' : 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'}`}>{stat.icon}</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 gap-8 overflow-x-auto">
                    {[
                        { id: 'configuration', label: 'Configuration', icon: 'tune' },
                        { id: 'promotions', label: 'Promotions', icon: 'campaign' },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 pb-3 pt-4 text-sm font-bold border-b-[3px] whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-primary'}`}>
                            <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'configuration' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">settings</span> General Settings
                                    </h3>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Active</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <label className="block">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Approval Workflow</span>
                                        <select className="mt-2 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                                            value={referralConfig.approval_workflow}
                                            onChange={e => setReferralConfig(c => ({ ...c, approval_workflow: e.target.value }))}>
                                            <option value="auto">Auto-approve valid referrals</option>
                                            <option value="manual">Manual approval required</option>
                                        </select>
                                    </label>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-slate-400">card_giftcard</span> Reward Logic
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                                    <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-slate-200 dark:bg-slate-700 -translate-x-1/2"></div>
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Referrer (Advocate)</h4>
                                        <label className="block">
                                            <span className="text-xs font-semibold text-slate-500">Reward Type</span>
                                            <select className="mt-1 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                                                value={referralConfig.referrer_reward_type}
                                                onChange={e => setReferralConfig(c => ({ ...c, referrer_reward_type: e.target.value }))}>
                                                <option>Account Credit ($)</option>
                                                <option>Percentage Discount (%)</option>
                                                <option>Free Month Subscription</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-semibold text-slate-500">Amount / Value</span>
                                            <input className="mt-1 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                type="number"
                                                value={referralConfig.referrer_amount}
                                                onChange={e => setReferralConfig(c => ({ ...c, referrer_amount: Number(e.target.value) }))} />
                                        </label>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-purple-600">Referee (New User)</h4>
                                        <label className="block">
                                            <span className="text-xs font-semibold text-slate-500">Reward Type</span>
                                            <select className="mt-1 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                                                value={referralConfig.referee_reward_type}
                                                onChange={e => setReferralConfig(c => ({ ...c, referee_reward_type: e.target.value }))}>
                                                <option>Percentage Discount (%)</option>
                                                <option>Account Credit ($)</option>
                                                <option>First Booking Free</option>
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-xs font-semibold text-slate-500">Amount / Value</span>
                                            <input className="mt-1 w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                                type="number"
                                                value={referralConfig.referee_amount}
                                                onChange={e => setReferralConfig(c => ({ ...c, referee_amount: Number(e.target.value) }))} />
                                        </label>
                                    </div>
                                </div>
                            </Card>

                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => loadData()}>Discard Changes</Button>
                                <Button onClick={handleSaveReferralConfig} disabled={savingConfig}>{savingConfig ? 'Saving...' : 'Save Configuration'}</Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Card className="p-0 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Promotions</h3>
                                    <button className="text-primary text-xs font-bold hover:underline" onClick={() => setActiveTab('promotions')}>View All</button>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {promotions.slice(0, 3).map(p => (
                                        <div key={p.id} className="p-4 flex gap-3 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{p.code}</p>
                                                <p className="text-xs text-slate-500">{p.discount_percent}% off · {p.redemption_count || 0} uses</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                                        </div>
                                    ))}
                                    {promotions.length === 0 && (
                                        <div className="p-6 text-center text-sm text-slate-400">No promotions yet</div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'promotions' && (
                    <Card className="p-0 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white">All Promotions</h3>
                            <a href="/admin/referral-program" className="text-sm text-primary font-semibold hover:underline">Manage →</a>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    {['Code', 'Discount', 'Redemptions', 'Expires', 'Status'].map(h => (
                                        <th key={h} className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                {promotions.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">No promotions created yet.</td></tr>
                                ) : promotions.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{p.code}</td>
                                        <td className="px-6 py-4 font-bold text-primary">{p.discount_percent}% off</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{p.redemption_count || 0}{p.max_redemptions ? ` / ${p.max_redemptions}` : ''}</td>
                                        <td className="px-6 py-4 text-slate-500">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : 'Never'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full border capitalize ${p.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{p.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                )}
            </div>
        )
    }

    // Placeholder for other programs
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm">
                <button onClick={() => setSelectedProgram(null)} className="text-slate-500 hover:text-primary transition-colors">Marketing</button>
                <span className="text-slate-400">/</span>
                <span className="text-slate-900 dark:text-white font-medium">{marketingPrograms?.find(p => p.id === selectedProgram)?.name || selectedProgram}</span>
            </div>
            <Card className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">construction</span>
                <p className="text-slate-500">Configuration for this program is coming soon.</p>
                <Button variant="outline" className="mt-4" onClick={() => setSelectedProgram(null)}>Back to Marketing</Button>
            </Card>
        </div>
    )
}
