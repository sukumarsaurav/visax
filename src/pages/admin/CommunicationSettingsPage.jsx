import { useState, useEffect, useRef } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import * as platformSettingsRepo from '../../data/platformSettingsRepo'
import { supabase } from '../../lib/supabase'
import { isEmail } from '../../lib/validators'
import { writeAuditLog } from '../../lib/auditLog'
import toast from 'react-hot-toast'

const DEFAULT_TEMPLATES = [
    { id: 1, name: 'Welcome Email', subject: 'Welcome to Immizy!', body: 'Hi {{client_name}},\n\nWelcome to Immizy! We are thrilled to have you on board.\n\nBest regards,\nThe Immizy Team', status: 'active' },
    { id: 2, name: 'Password Reset', subject: 'Reset your password', body: 'Hi {{client_name}},\n\nClick the link below to reset your password: {{login_url}}\n\nBest regards,\nThe Immizy Team', status: 'active' },
    { id: 3, name: 'Case Status Update', subject: 'Update on Case #{{case_id}}', body: 'Hi {{client_name}},\n\nYour case {{case_id}} status has been updated to: {{case_status}}\n\nBest regards,\nThe Immizy Team', status: 'draft' },
    { id: 4, name: 'Document Request', subject: 'Action Required: Documents', body: 'Hi {{client_name}},\n\nWe need additional documents from you. Please log in to upload them.\n\nBest regards,\nThe Immizy Team', status: 'active' },
    { id: 5, name: 'Appointment Confirmation', subject: 'Appointment Confirmed', body: 'Hi {{client_name}},\n\nYour appointment on {{appointment_date}} has been confirmed.\n\nBest regards,\nThe Immizy Team', status: 'active' },
]

const variables = {
    user: ['{{client_name}}', '{{client_email}}', '{{consultant_name}}'],
    case: ['{{case_id}}', '{{case_status}}', '{{appointment_date}}'],
    system: ['{{company_name}}', '{{login_url}}'],
}

export default function CommunicationSettingsPage() {
    const [activeTab, setActiveTab] = useState('emails')
    const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
    const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATES[0])
    const [editBody, setEditBody] = useState(DEFAULT_TEMPLATES[0].body)
    const [editSubject, setEditSubject] = useState(DEFAULT_TEMPLATES[0].subject)
    const [saving, setSaving] = useState(false)
    const [sendingTest, setSendingTest] = useState(false)
    const [testEmail, setTestEmail] = useState('')
    const textareaRef = useRef(null)

    useEffect(() => {
        async function loadTemplates() {
            const { value } = await platformSettingsRepo.getValue('email_templates')
            if (value?.templates?.length) {
                const loaded = value.templates
                setTemplates(loaded)
                setSelectedTemplate(loaded[0])
                setEditBody(loaded[0].body)
                setEditSubject(loaded[0].subject)
            }
        }
        loadTemplates()
    }, [])

    const handleSelectTemplate = (t) => {
        setSelectedTemplate(t)
        setEditBody(t.body || '')
        setEditSubject(t.subject || '')
    }

    const saveTemplates = async (updatedTemplates) => {
        const { error } = await platformSettingsRepo.setValue('email_templates', {
            templates: updatedTemplates,
        })
        return error
    }

    const handleSave = async () => {
        setSaving(true)
        const updated = templates.map(t =>
            t.id === selectedTemplate.id ? { ...t, subject: editSubject, body: editBody, status: 'active' } : t
        )
        const error = await saveTemplates(updated)
        if (error) { toast.error('Failed: ' + error.message) }
        else {
            setTemplates(updated)
            setSelectedTemplate(prev => ({ ...prev, subject: editSubject, body: editBody, status: 'active' }))
            toast.success('Template saved!')
            // F-CS05: audit sensitive settings changes
            await writeAuditLog({
                action: 'Email Template Updated',
                entityType: 'settings',
                entityId: String(selectedTemplate.id),
                details: { template_name: selectedTemplate.name, status: 'active' },
            })
        }
        setSaving(false)
    }

    const handleSaveAsDraft = async () => {
        setSaving(true)
        const updated = templates.map(t =>
            t.id === selectedTemplate.id ? { ...t, subject: editSubject, body: editBody, status: 'draft' } : t
        )
        const error = await saveTemplates(updated)
        if (error) { toast.error('Failed: ' + error.message) }
        else {
            setTemplates(updated)
            setSelectedTemplate(prev => ({ ...prev, subject: editSubject, body: editBody, status: 'draft' }))
            toast.success('Saved as draft')
            // F-CS05: audit draft saves as well
            await writeAuditLog({
                action: 'Email Template Updated',
                entityType: 'settings',
                entityId: String(selectedTemplate.id),
                details: { template_name: selectedTemplate.name, status: 'draft' },
            })
        }
        setSaving(false)
    }

    const handleRevertToOriginal = () => {
        const original = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate.id)
        if (original) {
            setEditBody(original.body)
            setEditSubject(original.subject)
            toast.success('Reverted to original')
        }
    }

    const handleResetToDefault = () => {
        const original = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate.id)
        if (original) {
            setEditBody(original.body)
            setEditSubject(original.subject)
        }
    }

    const insertAtCursor = (text) => {
        const el = textareaRef.current
        if (!el) { setEditBody(b => b + text); return }
        const start = el.selectionStart
        const end = el.selectionEnd
        const newBody = editBody.substring(0, start) + text + editBody.substring(end)
        setEditBody(newBody)
        setTimeout(() => {
            el.selectionStart = el.selectionEnd = start + text.length
            el.focus()
        }, 0)
    }

    const wrapSelection = (prefix, suffix = prefix) => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const selected = editBody.substring(start, end)
        const wrapped = prefix + (selected || 'text') + suffix
        const newBody = editBody.substring(0, start) + wrapped + editBody.substring(end)
        setEditBody(newBody)
        setTimeout(() => {
            el.selectionStart = start + prefix.length
            el.selectionEnd = start + prefix.length + (selected || 'text').length
            el.focus()
        }, 0)
    }

    const handleInsertLink = () => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const selected = editBody.substring(start, end) || 'link text'
        const link = `[${selected}]({{login_url}})`
        const newBody = editBody.substring(0, start) + link + editBody.substring(end)
        setEditBody(newBody)
        setTimeout(() => el.focus(), 0)
    }

    const handleSendTestEmail = async () => {
        if (!testEmail) { toast.error('Enter a recipient email'); return }
        if (!isEmail(testEmail)) { toast.error('Enter a valid email'); return }
        setSendingTest(true)
        try {
            const { error } = await supabase.functions.invoke('send-test-email', {
                body: {
                    to: testEmail,
                    subject: editSubject,
                    body: editBody,
                    template_name: selectedTemplate.name,
                },
            })
            if (error) throw error
            toast.success(`Test email sent to ${testEmail}`)
        } catch (e) {
            // Surface the actual failure — the previous catch silently lied
            // about a successful "queued" send.
            toast.error(`Test email failed: ${e?.message || 'unknown error'}`)
        }
        setSendingTest(false)
    }

    const insertVariable = (v) => insertAtCursor(v)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400">Manage automated email and in-app notification templates.</p>
                <Button variant="outline" icon="history">View Logs</Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
                {/* LEFT PANE: Template List */}
                <aside className="flex w-full lg:w-80 flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden shrink-0">
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button onClick={() => setActiveTab('emails')}
                            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === 'emails' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            Emails
                        </button>
                        <button onClick={() => setActiveTab('inapp')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'inapp' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            In-App
                        </button>
                    </div>
                    {/* F-CS06: show email templates only on the Emails tab; In-App shows a placeholder */}
                    {activeTab === 'emails' ? (
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {templates.map((template) => (
                                <button key={template.id} onClick={() => handleSelectTemplate(template)}
                                    className={`w-full text-left group flex items-start justify-between rounded-lg px-3 py-3 transition-all ${selectedTemplate.id === template.id ? 'bg-primary/10 ring-1 ring-inset ring-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                    <div>
                                        <p className={`text-sm ${selectedTemplate.id === template.id ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>{template.name}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">Subject: {template.subject}</p>
                                    </div>
                                    <span className={`flex h-2 w-2 shrink-0 rounded-full mt-1.5 ${template.status === 'active' ? 'bg-green-500' : 'bg-amber-400'}`} title={template.status === 'active' ? 'Active' : 'Draft'}></span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-slate-400">
                            <span className="material-symbols-outlined text-[40px]">notifications</span>
                            <p className="text-sm font-semibold">In-App notifications</p>
                            <p className="text-xs text-center px-4">In-app notification templates are not yet configurable. Coming soon.</p>
                        </div>
                    )}
                </aside>

                {/* RIGHT PANE: Editor */}
                <section className="flex flex-1 flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-w-0">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTemplate.name}</h2>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${selectedTemplate.status === 'active' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-green-600/20' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-600/20'}`}>
                                    {selectedTemplate.status === 'active' ? 'Active' : 'Draft'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button icon="save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Subject Line</label>
                                    <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2.5 px-4 text-sm focus:border-primary focus:ring-primary dark:text-white shadow-sm"
                                        type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Email Body</label>
                                        <button onClick={handleResetToDefault} className="text-xs text-primary font-medium hover:underline">Reset to Default</button>
                                    </div>
                                    <div className="flex flex-col rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                                        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2">
                                            <div className="flex items-center border-r border-slate-300 dark:border-slate-600 pr-2 mr-1 gap-1">
                                                <button onClick={() => wrapSelection('**')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Bold">
                                                    <span className="material-symbols-outlined text-lg">format_bold</span>
                                                </button>
                                                <button onClick={() => wrapSelection('_')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Italic">
                                                    <span className="material-symbols-outlined text-lg">format_italic</span>
                                                </button>
                                                <button onClick={() => wrapSelection('__')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Underline">
                                                    <span className="material-symbols-outlined text-lg">format_underlined</span>
                                                </button>
                                            </div>
                                            <div className="flex items-center border-r border-slate-300 dark:border-slate-600 pr-2 mr-1 gap-1">
                                                <button onClick={() => insertAtCursor('\n')} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="New Line">
                                                    <span className="material-symbols-outlined text-lg">format_align_left</span>
                                                </button>
                                                <button onClick={handleInsertLink} className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400" title="Insert Link">
                                                    <span className="material-symbols-outlined text-lg">link</span>
                                                </button>
                                            </div>
                                        </div>
                                        <textarea ref={textareaRef}
                                            className="w-full min-h-[200px] p-4 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border-none outline-none resize-none focus:ring-0"
                                            value={editBody} onChange={e => setEditBody(e.target.value)} />
                                    </div>
                                </div>
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-500">send</span>
                                        Send Test Email
                                    </h3>
                                    <div className="flex gap-2">
                                        <input className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm px-3 py-2 focus:border-primary focus:ring-primary dark:text-white"
                                            placeholder="enter@email.com" type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
                                        <Button variant="outline" onClick={handleSendTestEmail} disabled={sendingTest}>
                                            {sendingTest ? 'Sending...' : 'Send'}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Sends this template with dummy data to the address above.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Available Variables</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Click to insert at cursor position.</p>
                                    <div className="space-y-4">
                                        {Object.entries(variables).map(([group, vars]) => (
                                            <div key={group}>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    {group === 'user' ? 'User Info' : group === 'case' ? 'Case Details' : 'System'}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {vars.map(v => (
                                                        <button key={v} onClick={() => insertVariable(v)}
                                                            className="rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 text-xs font-mono text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors">
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50 p-4">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 shrink-0">lightbulb</span>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Pro Tip</h4>
                                            <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1 leading-relaxed">
                                                Avoid changing the <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">{'{{login_url}}'}</code> variable placement — it is critical for account activation.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-6 py-4 flex justify-between items-center">
                        <button onClick={handleRevertToOriginal} className="text-slate-500 hover:text-red-600 text-sm font-medium transition-colors">
                            Revert to Original
                        </button>
                        <Button variant="outline" onClick={handleSaveAsDraft} disabled={saving}>Save as Draft</Button>
                    </div>
                </section>
            </div>
        </div>
    )
}
