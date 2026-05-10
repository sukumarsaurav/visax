import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'

const emailTemplates = [
    { id: 1, name: 'Welcome Email', subject: 'Welcome to VisaX!', body: 'Hi {{client_name}},\n\nWelcome to VisaX! We are thrilled to have you on board.\n\nBest regards,\nThe VisaX Team', status: 'active' },
    { id: 2, name: 'Password Reset', subject: 'Reset your password', body: 'Hi {{client_name}},\n\nClick the link below to reset your password: {{login_url}}\n\nBest regards,\nThe VisaX Team', status: 'active' },
    { id: 3, name: 'Case Status Update', subject: 'Update on Case #{{case_id}}', body: 'Hi {{client_name}},\n\nYour case {{case_id}} status has been updated to: {{case_status}}\n\nBest regards,\nThe VisaX Team', status: 'draft' },
    { id: 4, name: 'Document Request', subject: 'Action Required: Documents', body: 'Hi {{client_name}},\n\nWe need additional documents from you. Please log in to upload them.\n\nBest regards,\nThe VisaX Team', status: 'active' },
    { id: 5, name: 'Appointment Confirmation', subject: 'Appointment Confirmed', body: 'Hi {{client_name}},\n\nYour appointment on {{appointment_date}} has been confirmed.\n\nBest regards,\nThe VisaX Team', status: 'active' }
]

const variables = {
    user: ['{{client_name}}', '{{client_email}}', '{{consultant_name}}'],
    case: ['{{case_id}}', '{{case_status}}', '{{appointment_date}}'],
    system: ['{{company_name}}', '{{login_url}}']
}

export default function CommunicationSettingsPage() {
    const [activeTab, setActiveTab] = useState('emails')
    const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0])
    const [editBody, setEditBody] = useState(emailTemplates[0].body || '')
    const [editSubject, setEditSubject] = useState(emailTemplates[0].subject || '')
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [testEmail, setTestEmail] = useState('')

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleSelectTemplate = (t) => {
        setSelectedTemplate(t)
        setEditBody(t.body || '')
        setEditSubject(t.subject || '')
    }

    const handleSave = async () => {
        setSaving(true)
        const templates = emailTemplates.map(t =>
            t.id === selectedTemplate.id ? { ...t, subject: editSubject, body: editBody, status: 'active' } : t
        )
        const { error } = await supabase.from('platform_settings').upsert({
            key: 'email_templates',
            value: { templates },
            updated_at: new Date().toISOString(),
        }, { onConflict: 'key' })
        setSaving(false)
        if (error) showToast('Failed: ' + error.message, 'error')
        else showToast('Template saved!')
    }

    const insertVariable = (v) => {
        setEditBody(b => b + v)
    }

    return (
        <div className="flex flex-col gap-6">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {toast.msg}
                </div>
            )}
            {/* Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400">Manage automated email and in-app notification templates.</p>
                <Button variant="outline" icon="history">View Logs</Button>
            </div>

            {/* Split Pane Content */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                {/* LEFT PANE: Template List */}
                <aside className="flex w-full lg:w-80 flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden shrink-0">
                    {/* Type Selector Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('emails')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'emails' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            Emails
                        </button>
                        <button
                            onClick={() => setActiveTab('inapp')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'inapp' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            In-App
                        </button>
                    </div>
                    {/* Search */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                            <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-sm focus:border-primary focus:ring-primary dark:text-white" placeholder="Filter templates..." type="text" />
                        </div>
                    </div>
                    {/* List Items */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {emailTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleSelectTemplate(template)}
                                className={`w-full text-left group flex items-start justify-between rounded-lg px-3 py-3 transition-all ${selectedTemplate.id === template.id ? 'bg-primary/10 ring-1 ring-inset ring-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <div>
                                    <p className={`text-sm ${selectedTemplate.id === template.id ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>{template.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">Subject: {template.subject}</p>
                                </div>
                                <span className={`flex h-2 w-2 shrink-0 rounded-full mt-1.5 ${template.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} title={template.status === 'active' ? 'Active' : 'Draft'}></span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* RIGHT PANE: Editor */}
                <section className="flex flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-w-0">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTemplate.name}</h2>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${selectedTemplate.status === 'active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-600/20'}`}>
                                    {selectedTemplate.status === 'active' ? 'Active' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Last updated by Admin on Oct 24, 2023</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" icon="visibility">Preview</Button>
                            <Button icon="save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </div>

                    {/* Editor Content Scroller */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Form Area */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Subject Line */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Subject Line</label>
                                    <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm focus:border-primary focus:ring-primary dark:text-white shadow-sm" type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
                                </div>
                                {/* WYSIWYG Editor Container */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Email Body</label>
                                        <button className="text-xs text-primary font-medium hover:underline">Reset to Default</button>
                                    </div>
                                    <div className="flex flex-col rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        {/* Toolbar */}
                                        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2">
                                            <div className="flex items-center border-r border-slate-300 dark:border-slate-600 pr-2 mr-1 gap-1">
                                                <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Bold">
                                                    <span className="material-symbols-outlined text-lg">format_bold</span>
                                                </button>
                                                <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Italic">
                                                    <span className="material-symbols-outlined text-lg">format_italic</span>
                                                </button>
                                                <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Underline">
                                                    <span className="material-symbols-outlined text-lg">format_underlined</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center border-r border-slate-300 dark:border-slate-600 pr-2 mr-1 gap-1">
                                                <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Align Left">
                                                    <span className="material-symbols-outlined text-lg">format_align_left</span>
                                                </button>
                                                <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Link">
                                                    <span className="material-symbols-outlined text-lg">link</span>
                                                </button>
                                            </div>
                                            <button className="flex items-center gap-1 px-2 py-1.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors">
                                                <span className="material-symbols-outlined text-base">data_object</span>
                                                Insert Variable
                                            </button>
                                        </div>
                                        {/* Editor Content Area */}
                                        <textarea className="w-full min-h-[200px] p-4 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border-none outline-none resize-none focus:ring-0"
                                            value={editBody} onChange={e => setEditBody(e.target.value)} />
                                    </div>
                                </div>
                                {/* Test Send Area */}
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500">send</span>
                                        Send Test Email
                                    </h3>
                                    <div className="flex gap-2">
                                        <input className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 focus:border-primary focus:ring-primary dark:text-white"
                                            placeholder="enter@email.com" type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                                        <Button variant="outline" onClick={() => { if (testEmail) showToast(`Test email sent to ${testEmail}`); else showToast('Enter email first', 'error') }}>Send</Button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">This will send a version of the template with dummy data.</p>
                                </div>
                            </div>

                            {/* Sidebar: Placeholders & Guide */}
                            <div className="space-y-6">
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Available Variables</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click to copy and insert into your template.</p>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">User Info</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variables.user.map((v) => (
                                                    <button key={v} onClick={() => insertVariable(v)} className="rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Case Details</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variables.case.map((v) => (
                                                    <button key={v} onClick={() => insertVariable(v)} className="rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">System</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variables.system.map((v) => (
                                                    <button key={v} onClick={() => insertVariable(v)} className="rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                                        {v}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50 p-4">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 shrink-0">lightbulb</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Pro Tip</h4>
                                            <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1 leading-relaxed">
                                                Avoid changing the <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{'{{login_url}}'}</code> variable placement, as this is critical for user account activation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-between items-center">
                        <button className="text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
                            Revert to Original
                        </button>
                        <Button variant="outline">Save as Draft</Button>
                    </div>
                </section>
            </div>
        </div>
    )
}
