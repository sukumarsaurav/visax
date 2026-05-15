import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

const sections = [
    { id: 'landing', name: 'Landing Page', icon: 'home' },
    { id: 'about', name: 'About Us', icon: 'info' },
    { id: 'faq', name: 'FAQ', icon: 'help' },
    { id: 'blog', name: 'Blog Posts', icon: 'article' },
    { id: 'email', name: 'Email Templates', icon: 'mail' },
    { id: 'gallery', name: 'Image Gallery', icon: 'photo_library' }
]

const DEFAULT_CONTENT = {
    landing: { headline: 'Find your new home in a new country.', subheadline: 'Connect with trusted landlords, community members, and legal experts to streamline your immigration journey.', body: 'Join over 50,000 immigrants who have successfully settled using our platform. We verify every listing to ensure your safety and peace of mind.', alt_text: 'Happy family moving into new apartment', status: 'published' },
    about: { headline: 'About Immizy', subheadline: 'We simplify immigration for everyone.', body: 'Immizy is a marketplace connecting immigrants with trusted consultants and legal experts worldwide.', status: 'published' },
    faq: { headline: 'Frequently Asked Questions', subheadline: 'Find answers to common questions.', body: '', status: 'published' },
    blog: { headline: 'Latest News & Updates', subheadline: 'Stay informed about immigration changes.', body: '', status: 'published' },
    email: { headline: 'Email Templates', subheadline: 'Manage all system email templates.', body: '', status: 'published' },
    gallery: { headline: 'Image Gallery', subheadline: 'Manage platform imagery.', body: '', status: 'published' },
}

export default function ContentManagementPage() {
    const [activeSection, setActiveSection] = useState('landing')
    const [content, setContent] = useState(DEFAULT_CONTENT)
    const [saving, setSaving] = useState(false)
    const [publishing, setPublishing] = useState(false)
    const [toast, setToast] = useState(null)
    const [lastSaved, setLastSaved] = useState(null)

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const loadContent = useCallback(async () => {
        const { data } = await supabase.from('platform_settings').select('value').eq('key', 'cms_content').single()
        if (data?.value) setContent({ ...DEFAULT_CONTENT, ...data.value })
    }, [])

    useEffect(() => { loadContent() }, [loadContent])

    const persistContent = async (updatedContent) => {
        await supabase.from('platform_settings').upsert({ key: 'cms_content', value: updatedContent }, { onConflict: 'key' })
        setLastSaved(new Date())
    }

    const updateField = (field, value) => {
        setContent(c => ({ ...c, [activeSection]: { ...c[activeSection], [field]: value } }))
    }

    const handleSaveDraft = async () => {
        setSaving(true)
        const updated = { ...content, [activeSection]: { ...content[activeSection], status: 'draft' } }
        setContent(updated)
        const { error } = await persistContent(updated)
        if (error) showToast('Failed to save', 'error')
        else showToast('Draft saved')
        setSaving(false)
    }

    const handlePublish = async () => {
        setPublishing(true)
        const updated = { ...content, [activeSection]: { ...content[activeSection], status: 'published' } }
        setContent(updated)
        const { error } = await persistContent(updated)
        if (error) showToast('Failed to publish', 'error')
        else showToast(`${getSectionTitle()} published`)
        setPublishing(false)
    }

    const handleUnpublish = async () => {
        const updated = { ...content, [activeSection]: { ...content[activeSection], status: 'draft' } }
        setContent(updated)
        await persistContent(updated)
        showToast(`${getSectionTitle()} unpublished`)
    }

    const getSectionTitle = () => sections.find(s => s.id === activeSection)?.name || 'Content'
    const cur = content[activeSection] || {}

    return (
        <div className="flex flex-col gap-6">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Breadcrumbs & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">CMS</span>
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                    <span className="text-slate-900 dark:text-white font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{getSectionTitle()}</span>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon="visibility">Preview</Button>
                    <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>{saving ? 'Saving...' : 'Save Draft'}</Button>
                    <Button icon="publish" onClick={handlePublish} disabled={publishing}>{publishing ? 'Publishing...' : 'Publish'}</Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0">
                    <div className="p-6">
                        <div className="flex flex-col gap-1 mb-6">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">Sections</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Select area to edit</p>
                        </div>
                        <nav className="flex flex-col gap-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeSection === section.id ? 'bg-primary/10 border border-transparent' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${activeSection === section.id ? 'text-primary' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>{section.icon}</span>
                                    <span className={`text-sm flex-1 ${activeSection === section.id ? 'text-primary font-bold' : 'text-slate-700 dark:text-slate-300 group-hover:font-medium'}`}>{section.name}</span>
                                    {content[section.id]?.status === 'published' && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                    )}
                                    {activeSection === section.id && (
                                        <span className="material-symbols-outlined text-primary text-[16px]">chevron_right</span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                        {lastSaved && (
                            <p className="text-xs text-slate-400">Saved {lastSaved.toLocaleTimeString()}</p>
                        )}
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Page Description */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-slate-500 dark:text-slate-400">Manage the content for the {getSectionTitle()} section.</p>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 shadow-sm">
                            <span className={`relative flex h-2 w-2`}>
                                {cur.status === 'published' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${cur.status === 'published' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                            </span>
                            {cur.status === 'published' ? 'Published' : 'Draft'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Editor Column (Left 2/3) */}
                        <div className="xl:col-span-2 space-y-6">
                            {/* Text Content Card */}
                            <Card className="p-0 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Text Content</h3>
                                </div>
                                <div className="p-6 space-y-6">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Main Headline</span>
                                        <input
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                                            placeholder="Enter headline..."
                                            value={cur.headline || ''}
                                            onChange={e => updateField('headline', e.target.value)}
                                        />
                                    </label>
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sub-headline</span>
                                        <textarea
                                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-3 text-base focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-slate-400"
                                            rows={2}
                                            value={cur.subheadline || ''}
                                            onChange={e => updateField('subheadline', e.target.value)}
                                        />
                                    </label>

                                    {/* Body Content */}
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Body Content</span>
                                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                                            {/* Toolbar */}
                                            <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                                {['format_bold', 'format_italic', 'format_underlined'].map(icon => (
                                                    <button key={icon} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                                                    </button>
                                                ))}
                                                <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                                {['link', 'format_list_bulleted', 'format_clear'].map(icon => (
                                                    <button key={icon} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                                                        <span className="material-symbols-outlined text-[20px]">{icon}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full p-4 min-h-[150px] text-slate-700 dark:text-slate-300 text-base leading-relaxed outline-none bg-transparent resize-none"
                                                value={cur.body || ''}
                                                onChange={e => updateField('body', e.target.value)}
                                                placeholder="Enter body content..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Media Manager Card */}
                            <Card className="p-0 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 dark:text-white">Hero Image</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="w-full md:w-1/2 flex flex-col gap-3">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Current Asset</span>
                                            <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800">
                                                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-5xl text-slate-400">image</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-1/2 flex flex-col gap-4">
                                            <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer min-h-[140px]">
                                                <span className="material-symbols-outlined text-slate-400 text-4xl mb-2">cloud_upload</span>
                                                <p className="text-slate-700 dark:text-slate-200 font-medium text-sm">Click or drag image to replace</p>
                                                <p className="text-slate-400 text-xs mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                            <label className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Alt Text</span>
                                                    <span className="text-xs text-slate-400">Required for SEO</span>
                                                </div>
                                                <input
                                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                                    type="text"
                                                    value={cur.alt_text || ''}
                                                    onChange={e => updateField('alt_text', e.target.value)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Meta Column (Right 1/3) */}
                        <div className="space-y-6">
                            {/* Status Card */}
                            <Card className="flex flex-col gap-4">
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider opacity-70">Publishing Status</h3>
                                <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Current Status</span>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cur.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cur.status === 'published' ? 'bg-green-600 dark:bg-green-400' : 'bg-slate-400'}`}></span>
                                        {cur.status === 'published' ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Section</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{getSectionTitle()}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Visibility</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Public</span>
                                </div>
                                {cur.status === 'published' && (
                                    <div className="pt-2">
                                        <Button variant="outline" className="w-full border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleUnpublish}>
                                            Unpublish Page
                                        </Button>
                                    </div>
                                )}
                            </Card>

                            {/* Quick save info */}
                            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-500 flex-shrink-0 mt-0.5">info</span>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Auto-save disabled</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Use "Save Draft" to preserve changes without publishing, or "Publish" to make them live immediately.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
