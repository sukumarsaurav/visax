import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
    full_name: '', email: '', phone: '', bio: '',
    city: '', role: 'individual', years_experience: 0,
    specializations: '', languages: '',
}

const CLAIM_BASE = `${window.location.origin}/claim-profile?token=`

// Parse a CSV row, handling quoted fields
function parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"') { inQuotes = !inQuotes }
        else if (c === ',' && !inQuotes) { result.push(current.trim()); current = '' }
        else { current += c }
    }
    result.push(current.trim())
    return result
}

function parseCSV(text) {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line)
        return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']))
    }).filter(r => r.email && r.full_name)
}

export default function UnclaimedProfilesPage() {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('unclaimed') // unclaimed | claimed | all
    const [search, setSearch] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [creating, setCreating] = useState(false)
    const [csvPreview, setCsvPreview] = useState([])
    const [csvImporting, setCsvImporting] = useState(false)
    const [sendingEmail, setSendingEmail] = useState(null)
    const fileRef = useRef()

    useEffect(() => { fetchProfiles() }, [filterStatus, search])

    async function fetchProfiles() {
        setLoading(true)
        let q = supabase
            .from('unclaimed_profiles')
            .select('id, full_name, email, city, role, is_claimed, claim_token, claim_token_expires_at, created_at, claimed_at')
            .order('created_at', { ascending: false })

        if (filterStatus === 'unclaimed') q = q.eq('is_claimed', false)
        if (filterStatus === 'claimed') q = q.eq('is_claimed', true)
        if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)

        const { data, error } = await q
        if (error) toast.error('Failed to load profiles')
        else setProfiles(data || [])
        setLoading(false)
    }

    async function createProfile(e) {
        e.preventDefault()
        setCreating(true)
        const payload = {
            ...form,
            years_experience: Number(form.years_experience) || 0,
            specializations: form.specializations ? form.specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
            languages: form.languages ? form.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
        }
        const { error } = await supabase.from('unclaimed_profiles').insert(payload)
        if (error) { toast.error(error.message); setCreating(false); return }
        toast.success(`Profile created for ${form.full_name}`)
        setForm(EMPTY_FORM)
        setShowCreateForm(false)
        fetchProfiles()
        setCreating(false)
    }

    function handleFileUpload(e) {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const rows = parseCSV(ev.target.result)
            setCsvPreview(rows)
        }
        reader.readAsText(file)
    }

    async function importCSV() {
        if (!csvPreview.length) return
        setCsvImporting(true)
        const rows = csvPreview.map(r => ({
            full_name: r.full_name || r.name,
            email: r.email,
            phone: r.phone || null,
            bio: r.bio || null,
            city: r.city || null,
            role: r.role === 'agency_admin' ? 'agency_admin' : 'individual',
            years_experience: Number(r.years_experience) || 0,
            specializations: r.specializations ? r.specializations.split(';').map(s => s.trim()).filter(Boolean) : [],
            languages: r.languages ? r.languages.split(';').map(s => s.trim()).filter(Boolean) : [],
        }))

        const { error } = await supabase.from('unclaimed_profiles').insert(rows)
        if (error) { toast.error('Import failed: ' + error.message); setCsvImporting(false); return }
        toast.success(`Imported ${rows.length} profiles`)
        setCsvPreview([])
        if (fileRef.current) fileRef.current.value = ''
        fetchProfiles()
        setCsvImporting(false)
    }

    async function sendClaimEmail(profile) {
        setSendingEmail(profile.id)
        // Use Supabase magic link — sends email via Supabase Auth
        const { error } = await supabase.auth.signInWithOtp({
            email: profile.email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/claim-profile?token=${profile.claim_token}`,
            },
        })
        setSendingEmail(null)
        if (error) { toast.error('Failed to send email: ' + error.message); return }
        toast.success(`Claim email sent to ${profile.email}`)
    }

    function copyClaimLink(token) {
        navigator.clipboard.writeText(CLAIM_BASE + token)
        toast.success('Claim link copied!')
    }

    async function deleteProfile(id) {
        if (!window.confirm('Delete this unclaimed profile?')) return
        const { error } = await supabase.from('unclaimed_profiles').delete().eq('id', id)
        if (error) { toast.error(error.message); return }
        toast.success('Deleted')
        fetchProfiles()
    }

    const counts = {
        all: profiles.length,
        unclaimed: profiles.filter(p => !p.is_claimed).length,
        claimed: profiles.filter(p => p.is_claimed).length,
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Unclaimed Profiles</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Pre-seeded consultant profiles waiting to be claimed
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Import CSV
                    </button>
                    <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    <button
                        onClick={() => setShowCreateForm(s => !s)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 rounded-xl text-sm font-bold text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        Add Profile
                    </button>
                </div>
            </div>

            {/* CSV template hint */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300">
                <strong>CSV columns:</strong>{' '}
                <code>full_name, email, phone, bio, city, role, years_experience, specializations (semicolon-separated), languages (semicolon-separated)</code>
            </div>

            {/* CSV Preview */}
            {csvPreview.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            {csvPreview.length} profiles ready to import
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setCsvPreview([])} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                            <button
                                onClick={importCSV}
                                disabled={csvImporting}
                                className="flex items-center gap-1 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
                            >
                                {csvImporting ? 'Importing…' : `Import ${csvPreview.length} profiles`}
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="text-xs w-full">
                            <thead>
                                <tr className="text-left text-amber-700 dark:text-amber-400">
                                    <th className="pr-4 pb-1">Name</th>
                                    <th className="pr-4 pb-1">Email</th>
                                    <th className="pr-4 pb-1">City</th>
                                    <th className="pb-1">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {csvPreview.slice(0, 5).map((r, i) => (
                                    <tr key={i} className="text-amber-900 dark:text-amber-200">
                                        <td className="pr-4 py-0.5">{r.full_name || r.name}</td>
                                        <td className="pr-4 py-0.5">{r.email}</td>
                                        <td className="pr-4 py-0.5">{r.city || '—'}</td>
                                        <td className="py-0.5">{r.role || 'individual'}</td>
                                    </tr>
                                ))}
                                {csvPreview.length > 5 && (
                                    <tr><td colSpan={4} className="text-amber-600 pt-1">…and {csvPreview.length - 5} more</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create form */}
            {showCreateForm && (
                <form onSubmit={createProfile} className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h2 className="font-black text-slate-900 dark:text-white mb-4">Create Unclaimed Profile</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { key: 'full_name', label: 'Full Name *', type: 'text', required: true, placeholder: 'Anita Kapoor' },
                            { key: 'email', label: 'Email *', type: 'email', required: true, placeholder: 'anita@consultancy.in' },
                            { key: 'phone', label: 'Phone', type: 'text', placeholder: '+91 98765 43210' },
                            { key: 'city', label: 'City', type: 'text', placeholder: 'Mumbai' },
                            { key: 'years_experience', label: 'Years Experience', type: 'number', placeholder: '5' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">{f.label}</label>
                                <input
                                    type={f.type}
                                    required={f.required}
                                    placeholder={f.placeholder}
                                    value={form[f.key]}
                                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                    className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Role</label>
                            <select
                                value={form.role}
                                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="individual">Individual Consultant</option>
                                <option value="agency_admin">Agency</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Specialisations (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="Canada PR, Australia PR, UK Skilled Worker"
                                value={form.specializations}
                                onChange={e => setForm(p => ({ ...p, specializations: e.target.value }))}
                                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Languages (comma-separated)</label>
                            <input
                                type="text"
                                placeholder="English, Hindi, Gujarati"
                                value={form.languages}
                                onChange={e => setForm(p => ({ ...p, languages: e.target.value }))}
                                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Bio</label>
                            <textarea
                                rows={3}
                                placeholder="Brief professional bio…"
                                value={form.bio}
                                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex items-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
                        >
                            {creating ? 'Creating…' : 'Create Profile'}
                        </button>
                        <button type="button" onClick={() => { setShowCreateForm(false); setForm(EMPTY_FORM) }} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2.5">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {['unclaimed', 'claimed', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`text-sm px-4 py-1.5 rounded-full font-semibold transition-colors border ${filterStatus === status ? 'bg-primary text-white border-primary' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'}`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
                <div className="ml-auto relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Search name, email, city…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="text-sm pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary w-56"
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                </div>
            ) : profiles.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <span className="material-symbols-outlined text-[48px] block mb-2">person_search</span>
                    No profiles found. Create one or import a CSV.
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                                <tr className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    <th className="px-5 py-3">Consultant</th>
                                    <th className="px-5 py-3">City</th>
                                    <th className="px-5 py-3">Role</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Token expires</th>
                                    <th className="px-5 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {profiles.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-white">{p.full_name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{p.email}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{p.city || '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.role === 'agency_admin' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                                                {p.role === 'agency_admin' ? 'Agency' : 'Consultant'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {p.is_claimed ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                    Claimed {p.claimed_at ? new Date(p.claimed_at).toLocaleDateString('en-IN') : ''}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                    <span className="material-symbols-outlined text-[12px]">pending</span>
                                                    Unclaimed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400">
                                            {p.claim_token_expires_at
                                                ? new Date(p.claim_token_expires_at) < new Date()
                                                    ? <span className="text-red-500">Expired</span>
                                                    : new Date(p.claim_token_expires_at).toLocaleDateString('en-IN')
                                                : '—'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                {/* View public profile */}
                                                <Link
                                                    to={`/consultant/unclaimed/${p.id}`}
                                                    target="_blank"
                                                    title="View public profile"
                                                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                                </Link>
                                                {!p.is_claimed && p.claim_token && (
                                                    <>
                                                        {/* Copy claim link */}
                                                        <button
                                                            onClick={() => copyClaimLink(p.claim_token)}
                                                            title="Copy claim link"
                                                            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                                        </button>
                                                        {/* Send claim email */}
                                                        <button
                                                            onClick={() => sendClaimEmail(p)}
                                                            disabled={sendingEmail === p.id}
                                                            title="Send claim email"
                                                            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40"
                                                        >
                                                            <span className={`material-symbols-outlined text-[18px] ${sendingEmail === p.id ? 'animate-spin' : ''}`}>
                                                                {sendingEmail === p.id ? 'progress_activity' : 'send'}
                                                            </span>
                                                        </button>
                                                    </>
                                                )}
                                                {/* Delete */}
                                                {!p.is_claimed && (
                                                    <button
                                                        onClick={() => deleteProfile(p.id)}
                                                        title="Delete"
                                                        className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                        {profiles.length} profiles shown
                    </div>
                </div>
            )}
        </div>
    )
}
