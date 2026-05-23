import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import * as platformSettingsRepo from '../../data/platformSettingsRepo'

const DEFAULT_LANGUAGES = [
    { id: 'en-US', name: 'English (US)', code: 'EN', locale: 'en-US', progress: 100, isDefault: true, isActive: true, color: 'blue' },
    { id: 'es-ES', name: 'Spanish', code: 'ES', locale: 'es-ES', progress: 85, isDefault: false, isActive: true, color: 'orange' },
    { id: 'fr-FR', name: 'French', code: 'FR', locale: 'fr-FR', progress: 42, isDefault: false, isActive: false, color: 'indigo' },
    { id: 'ar-SA', name: 'Arabic (KSA)', code: 'AR', locale: 'ar-SA', progress: 60, isDefault: false, isActive: true, color: 'emerald' }
]

const DEFAULT_GLOBAL = { default_language: 'en-US', date_format_auto: true, currency: 'USD' }

const colorMap = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400',
    orange: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400',
    indigo: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
}

export default function LocalizationManagementPage() {
    const [languages, setLanguages] = useState(DEFAULT_LANGUAGES)
    const [globalSettings, setGlobalSettings] = useState(DEFAULT_GLOBAL)
    const [selectedLang, setSelectedLang] = useState(DEFAULT_LANGUAGES[1])
    const [translations, setTranslations] = useState({})
    const [saving, setSaving] = useState(false)
    const [savingGlobal, setSavingGlobal] = useState(false)
    const [toast, setToast] = useState(null)
    const [search, setSearch] = useState('')

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadSettings = useCallback(async () => {
        const { value } = await platformSettingsRepo.getValue('localization')
        if (value) {
            if (value.languages)    setLanguages(value.languages)
            if (value.global)       setGlobalSettings(value.global)
            if (value.translations) setTranslations(value.translations)
        }
    }, [])

    useEffect(() => { loadSettings() }, [loadSettings])

    const persistAll = async (newLangs, newGlobal, newTranslations) => {
        await platformSettingsRepo.setValue('localization', {
            languages: newLangs,
            global: newGlobal,
            translations: newTranslations,
        })
    }

    const handleToggleLang = async (id) => {
        const updated = languages.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l)
        setLanguages(updated)
        await persistAll(updated, globalSettings, translations)
        showToast('Language status updated')
    }

    const handleSaveGlobal = async () => {
        setSavingGlobal(true)
        await persistAll(languages, globalSettings, translations)
        showToast('Global settings saved')
        setSavingGlobal(false)
    }

    const handleSaveTranslations = async () => {
        setSaving(true)
        await persistAll(languages, globalSettings, translations)
        showToast('Translations saved')
        setSaving(false)
    }

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(translations, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'translations.json'; a.click()
        URL.revokeObjectURL(url)
    }

    const TRANSLATION_KEYS = [
        { key: 'auth.login_title', context: 'Auth Page', english: 'Log in to your account' },
        { key: 'dashboard.welcome_msg', context: 'Dashboard', english: 'Welcome back, {name}!' },
        { key: 'nav.home', context: 'Navigation', english: 'Home' },
        { key: 'nav.applications', context: 'Navigation', english: 'Applications' },
        { key: 'common.save', context: 'Common', english: 'Save' },
        { key: 'common.cancel', context: 'Common', english: 'Cancel' },
    ]

    const filteredKeys = TRANSLATION_KEYS.filter(k =>
        !search || k.key.includes(search.toLowerCase()) || k.english.toLowerCase().includes(search.toLowerCase())
    )

    const getTranslation = (key) => translations[selectedLang.locale]?.[key] || ''
    const setTranslation = (key, value) => {
        setTranslations(t => ({
            ...t,
            [selectedLang.locale]: { ...(t[selectedLang.locale] || {}), [key]: value }
        }))
    }

    const filteredLanguages = languages.filter(l =>
        !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.code.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Localization Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage languages, regional settings, and translations for the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon="download" onClick={handleExport}>Export</Button>
                    <Button icon="add">Add Language</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Languages Table */}
                    <Card className="overflow-hidden p-0">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900 dark:text-white">Supported Languages</h3>
                            <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">search</span>
                                <input className="pl-9 pr-4 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-primary w-48 text-slate-900 dark:text-white"
                                    placeholder="Search languages..."
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-medium text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3">Language</th>
                                        <th className="px-6 py-3">Locale</th>
                                        <th className="px-6 py-3">Translation Progress</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredLanguages.map((lang) => (
                                        <tr key={lang.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border ${colorMap[lang.color] || colorMap.blue}`}>{lang.code}</div>
                                                    {lang.name}
                                                    {lang.isDefault && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">DEFAULT</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{lang.locale}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                                        <div className={`h-2 rounded-full ${lang.progress === 100 ? 'bg-emerald-500' : lang.progress > 50 ? 'bg-primary' : 'bg-amber-500'}`} style={{ width: `${lang.progress}%` }}></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-8">{lang.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {lang.isDefault ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                                                ) : (
                                                    <button onClick={() => handleToggleLang(lang.id)}
                                                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${lang.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${lang.isActive ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setSelectedLang(lang)} className="p-1.5 text-slate-400 hover:text-primary transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit Translations">
                                                        <span className="material-symbols-outlined text-[20px]">translate</span>
                                                    </button>
                                                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Quick Editor */}
                    <Card className="overflow-hidden p-0">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Quick Edit: {selectedLang.name} ({selectedLang.locale})</h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            {filteredKeys.map((item) => {
                                const val = getTranslation(item.key)
                                const hasTrans = !!val
                                return (
                                    <div key={item.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-5 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-mono text-slate-400">{item.key}</label>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">{item.context}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-800">{item.english}</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-primary">{selectedLang.name} Translation</label>
                                                {!hasTrans && <span className="text-[10px] text-amber-500 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span> Missing</span>}
                                            </div>
                                            <textarea
                                                className={`w-full text-sm text-slate-900 dark:text-white p-2.5 bg-white dark:bg-slate-800 rounded-md border ${hasTrans ? 'border-slate-300 dark:border-slate-600 focus:ring-1 focus:ring-primary focus:border-primary' : 'border-amber-300 dark:border-amber-700 focus:ring-1 focus:ring-amber-500 focus:border-amber-500'} resize-none`}
                                                rows={2}
                                                placeholder={hasTrans ? '' : 'Enter translation...'}
                                                value={val}
                                                onChange={e => setTranslation(item.key, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                            <div className="pt-2 flex justify-end">
                                <Button onClick={handleSaveTranslations} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Global Settings */}
                    <Card>
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-slate-400">tune</span> Global Settings
                        </h3>
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default System Language</span>
                                <select className="mt-2 w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                                    value={globalSettings.default_language}
                                    onChange={e => setGlobalSettings(g => ({ ...g, default_language: e.target.value }))}>
                                    {languages.map(l => <option key={l.id} value={l.locale}>{l.name}</option>)}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Fallback language if translation is missing.</p>
                            </label>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Regional Formats</span>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Date Format</span>
                                        <p className="text-xs text-slate-500">Auto-detect based on locale</p>
                                    </div>
                                    <button onClick={() => setGlobalSettings(g => ({ ...g, date_format_auto: !g.date_format_auto }))}
                                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${globalSettings.date_format_auto ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${globalSettings.date_format_auto ? 'translate-x-4' : 'translate-x-0'}`}></span>
                                    </button>
                                </div>
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Currency</span>
                                    <select className="mt-2 w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                                        value={globalSettings.currency}
                                        onChange={e => setGlobalSettings(g => ({ ...g, currency: e.target.value }))}>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </label>
                            </div>
                            <Button className="w-full" onClick={handleSaveGlobal} disabled={savingGlobal}>
                                {savingGlobal ? 'Saving...' : 'Save Global Settings'}
                            </Button>
                        </div>
                    </Card>

                    {/* Data Management */}
                    <Card>
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-slate-400">cloud_sync</span> Data Management
                        </h3>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-3 w-full px-4 py-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-primary transition-all group cursor-pointer">
                                <input type="file" accept=".json,.csv" className="hidden" onChange={async (e) => {
                                    const file = e.target.files[0]
                                    if (!file) return
                                    const text = await file.text()
                                    try {
                                        const imported = JSON.parse(text)
                                        const merged = { ...translations, ...imported }
                                        setTranslations(merged)
                                        showToast('Translations imported')
                                    } catch {
                                        showToast('Invalid JSON file', 'error')
                                    }
                                }} />
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">upload_file</span>
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Import Translations</p>
                                    <p className="text-xs text-slate-500">JSON or CSV files</p>
                                </div>
                            </label>
                            <button className="flex items-center gap-3 w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                                onClick={handleExport}>
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">download</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">Export All Translations</p>
                                    <p className="text-xs text-slate-500">Download as JSON</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                            </button>
                        </div>
                    </Card>

                    {/* Documentation */}
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm text-primary">
                                <span className="material-symbols-outlined">menu_book</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Localization Guide</h4>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 mb-3 leading-relaxed">Learn how to format strings with variables and handle plurals correctly.</p>
                                <a className="text-xs font-semibold text-primary hover:underline" href="#">Read Documentation →</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
