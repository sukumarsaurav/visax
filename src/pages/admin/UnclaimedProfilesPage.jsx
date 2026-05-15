import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import AvatarUpload from '../../components/ui/AvatarUpload'
import { uploadUnclaimedAvatar } from '../../lib/storage'

const EMPTY_FORM = {
    full_name: '', email: '', phone: '', bio: '',
    city: '', role: 'individual', years_experience: 0,
    specializations: '', languages: '',
    avatar_url: '', website: '', linkedin_url: '',
    consultation_fee: '', license_number: '', agency_name: '',
}

const CLAIM_BASE = `${window.location.origin}/claim-profile?token=`

const SPECIALIZATION_OPTIONS = [
    'Canada PR', 'Australia PR', 'UK Skilled Worker', 'Germany Job Seeker',
    'USA H1-B', 'Schengen Visa', 'Student Visa', 'Work Permit',
    'Family Reunification', 'Investor Visa', 'Portugal D7', 'New Zealand PR',
]

const LANGUAGE_OPTIONS = [
    'English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil',
    'Telugu', 'Kannada', 'Bengali', 'Punjabi', 'Malayalam',
    'Urdu', 'Odia', 'Assamese', 'French', 'German',
]

const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Pune', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Surat',
    'Lucknow', 'Kochi', 'Chandigarh', 'Bhopal', 'Indore',
]

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

function Avatar({ url, name, size = 9 }) {
    const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
    return url ? (
        <img src={url} alt={name} className={`size-${size} rounded-full object-cover shrink-0`} />
    ) : (
        <div className={`size-${size} rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0`}>
            {initials}
        </div>
    )
}

function TagInput({ value, onChange, suggestions, placeholder }) {
    const [input, setInput] = useState('')
    const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : []

    function addTag(tag) {
        const trimmed = tag.trim()
        if (!trimmed || tags.includes(trimmed)) { setInput(''); return }
        onChange([...tags, trimmed].join(', '))
        setInput('')
    }
    function removeTag(tag) { onChange(tags.filter(t => t !== tag).join(', ')) }

    return (
        <div className="border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-primary">
            <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px]">
                {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                            <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                    </span>
                ))}
                <input
                    type="text" value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input) }
                        if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1])
                    }}
                    placeholder={tags.length ? '' : placeholder}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 dark:text-white outline-none px-1 placeholder:text-slate-400"
                />
            </div>
            {suggestions && input.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-1.5 flex flex-wrap gap-1">
                    {suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)).slice(0, 6).map(s => (
                        <button key={s} type="button" onClick={() => addTag(s)}
                            className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function ProfileModal({ form, setForm, onSubmit, onClose, saving, isEdit, editingId, onAvatarUpload }) {
    // Close on backdrop click
    function onBackdrop(e) { if (e.target === e.currentTarget) onClose() }

    // Close on Escape
    useEffect(() => {
        function onKey(e) { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    return (
        <div
            onClick={onBackdrop}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">

                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <div>
                        <h2 className="font-black text-slate-900 dark:text-white text-lg">
                            {isEdit ? 'Edit Profile' : 'Create Unclaimed Profile'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEdit ? 'Update consultant details' : 'Manually seed a consultant profile'}
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Scrollable body */}
                <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">

                        {/* Avatar */}
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                            {isEdit && editingId ? (
                                <>
                                    <AvatarUpload
                                        currentUrl={form.avatar_url}
                                        name={form.full_name}
                                        onUpload={onAvatarUpload}
                                        size="md"
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile Photo</p>
                                        <p className="text-xs text-slate-400 mt-0.5">Click the camera icon to upload. Saved immediately.</p>
                                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP · max 5 MB</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {form.avatar_url ? (
                                        <img src={form.avatar_url} alt="" className="size-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 shrink-0" />
                                    ) : (
                                        <div className="size-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-black text-xl shrink-0">
                                            {form.full_name ? form.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Profile Photo URL <span className="font-normal text-slate-400">(optional — paste a URL, or edit after saving to upload)</span></label>
                                        <input type="url" placeholder="https://example.com/photo.jpg"
                                            value={form.avatar_url} onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))}
                                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Basic info */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Full Name *</label>
                                    <input type="text" required placeholder="Anita Kapoor"
                                        value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Email *</label>
                                    <input type="email" required placeholder="anita@consultancy.in"
                                        value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Phone</label>
                                    <input type="text" placeholder="+91 98765 43210"
                                        value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">City</label>
                                    <input type="text" list="city-list" placeholder="Mumbai"
                                        value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                    <datalist id="city-list">{INDIAN_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Role</label>
                                    <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="individual">Individual Consultant</option>
                                        <option value="agency_admin">Agency</option>
                                    </select>
                                </div>
                                {form.role === 'agency_admin' && (
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Agency Name</label>
                                        <input type="text" placeholder="Kapoor Immigration Services"
                                            value={form.agency_name} onChange={e => setForm(p => ({ ...p, agency_name: e.target.value }))}
                                            className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Years of Experience</label>
                                    <input type="number" min="0" max="50" placeholder="5"
                                        value={form.years_experience} onChange={e => setForm(p => ({ ...p, years_experience: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Consultation Fee (₹)</label>
                                    <input type="number" min="0" placeholder="2000"
                                        value={form.consultation_fee} onChange={e => setForm(p => ({ ...p, consultation_fee: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">License / ICCRC No.</label>
                                    <input type="text" placeholder="R123456"
                                        value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))}
                                        className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Online presence */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Online Presence</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Website</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">language</span>
                                        <input type="url" placeholder="https://example.in"
                                            value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                                            className="w-full pl-9 text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">LinkedIn URL</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">link</span>
                                        <input type="url" placeholder="https://linkedin.com/in/…"
                                            value={form.linkedin_url} onChange={e => setForm(p => ({ ...p, linkedin_url: e.target.value }))}
                                            className="w-full pl-9 text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expertise */}
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Expertise</p>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                                        Specialisations <span className="font-normal text-slate-400">— type + Enter or pick below</span>
                                    </label>
                                    <TagInput value={form.specializations} onChange={v => setForm(p => ({ ...p, specializations: v }))}
                                        suggestions={SPECIALIZATION_OPTIONS} placeholder="Canada PR, Australia PR…" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                                        Languages <span className="font-normal text-slate-400">— type + Enter or pick below</span>
                                    </label>
                                    <TagInput value={form.languages} onChange={v => setForm(p => ({ ...p, languages: v }))}
                                        suggestions={LANGUAGE_OPTIONS} placeholder="English, Hindi…" />
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Professional Bio</label>
                            <textarea rows={3} placeholder="Brief professional bio…"
                                value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                                className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                        </div>

                    </div>

                    {/* Sticky footer */}
                    <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all">
                            <span className="material-symbols-outlined text-[16px]">{saving ? 'progress_activity' : isEdit ? 'save' : 'person_add'}</span>
                            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Profile'}
                        </button>
                        <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function UnclaimedProfilesPage() {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('unclaimed')
    const [search, setSearch] = useState('')

    const [modalOpen, setModalOpen] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)

    const [csvPreview, setCsvPreview] = useState([])
    const [csvImporting, setCsvImporting] = useState(false)
    const [sendingEmail, setSendingEmail] = useState(null)
    const fileRef = useRef()

    useEffect(() => { fetchProfiles() }, [filterStatus, search])

    async function fetchProfiles() {
        setLoading(true)
        let q = supabase
            .from('unclaimed_profiles')
            .select('id, full_name, email, phone, city, role, is_claimed, claim_token, claim_token_expires_at, created_at, claimed_at, avatar_url, website, linkedin_url, specializations, languages, years_experience, consultation_fee, license_number, agency_name, bio')
            .order('created_at', { ascending: false })

        if (filterStatus === 'unclaimed') q = q.eq('is_claimed', false)
        if (filterStatus === 'claimed') q = q.eq('is_claimed', true)
        if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)

        const { data, error } = await q
        if (error) toast.error('Failed to load profiles')
        else setProfiles(data || [])
        setLoading(false)
    }

    function formToPayload(f) {
        return {
            full_name: f.full_name,
            email: f.email,
            phone: f.phone || null,
            bio: f.bio || null,
            city: f.city || null,
            role: f.role,
            years_experience: Number(f.years_experience) || 0,
            specializations: f.specializations ? f.specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
            languages: f.languages ? f.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
            avatar_url: f.avatar_url || null,
            website: f.website || null,
            linkedin_url: f.linkedin_url || null,
            consultation_fee: f.consultation_fee ? Number(f.consultation_fee) : null,
            license_number: f.license_number || null,
            agency_name: f.agency_name || null,
        }
    }

    async function handleSave(e) {
        e.preventDefault()
        setSaving(true)
        if (editingId) {
            const { error } = await supabase.from('unclaimed_profiles').update(formToPayload(form)).eq('id', editingId)
            if (error) { toast.error(error.message); setSaving(false); return }
            toast.success('Profile updated')
        } else {
            const { error } = await supabase.from('unclaimed_profiles').insert(formToPayload(form))
            if (error) { toast.error(error.message); setSaving(false); return }
            toast.success(`Profile created for ${form.full_name}`)
        }
        setSaving(false)
        setModalOpen(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
        fetchProfiles()
    }

    function openCreate() {
        setForm(EMPTY_FORM)
        setEditingId(null)
        setModalOpen(true)
    }

    async function handleUnclaimedAvatarUpload(file) {
        const url = await uploadUnclaimedAvatar(file, editingId)
        await supabase.from('unclaimed_profiles').update({ avatar_url: url }).eq('id', editingId)
        setForm(f => ({ ...f, avatar_url: url }))
        toast.success('Photo updated!')
        return url
    }

    function openEdit(p) {
        setForm({
            full_name: p.full_name || '',
            email: p.email || '',
            phone: p.phone || '',
            bio: p.bio || '',
            city: p.city || '',
            role: p.role || 'individual',
            years_experience: p.years_experience || 0,
            specializations: Array.isArray(p.specializations) ? p.specializations.join(', ') : '',
            languages: Array.isArray(p.languages) ? p.languages.join(', ') : '',
            avatar_url: p.avatar_url || '',
            website: p.website || '',
            linkedin_url: p.linkedin_url || '',
            consultation_fee: p.consultation_fee || '',
            license_number: p.license_number || '',
            agency_name: p.agency_name || '',
        })
        setEditingId(p.id)
        setModalOpen(true)
    }

    function closeModal() {
        setModalOpen(false)
        setEditingId(null)
        setForm(EMPTY_FORM)
    }

    function handleFileUpload(e) {
        const file = e.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => setCsvPreview(parseCSV(ev.target.result))
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
            website: r.website || null,
            linkedin_url: r.linkedin_url || null,
            avatar_url: r.avatar_url || null,
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
        const { error } = await supabase.auth.signInWithOtp({
            email: profile.email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/claim-profile?token=${profile.claim_token}`,
            },
        })
        setSendingEmail(null)
        if (error) { toast.error('Failed to send: ' + error.message); return }
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

    return (
        <>
            {/* Modal */}
            {modalOpen && (
                <ProfileModal
                    form={form} setForm={setForm}
                    onSubmit={handleSave} onClose={closeModal}
                    saving={saving} isEdit={!!editingId}
                    editingId={editingId}
                    onAvatarUpload={handleUnclaimedAvatarUpload}
                />
            )}

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Unclaimed Profiles</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Pre-seeded consultant profiles waiting to be claimed</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">upload_file</span>
                            Import CSV
                        </button>
                        <input ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        <button onClick={openCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 rounded-xl text-sm font-bold text-white transition-all">
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            Add Profile
                        </button>
                    </div>
                </div>

                {/* CSV hint */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300">
                    <strong>CSV columns:</strong>{' '}
                    <code>full_name, email, phone, bio, city, role, years_experience, specializations (semicolon-sep), languages (semicolon-sep), website, linkedin_url, avatar_url</code>
                </div>

                {/* CSV Preview */}
                {csvPreview.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{csvPreview.length} profiles ready to import</p>
                            <div className="flex gap-2">
                                <button onClick={() => setCsvPreview([])} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                <button onClick={importCSV} disabled={csvImporting}
                                    className="flex items-center gap-1 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg disabled:opacity-60">
                                    {csvImporting ? 'Importing…' : `Import ${csvPreview.length} profiles`}
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="text-xs w-full">
                                <thead>
                                    <tr className="text-left text-amber-700 dark:text-amber-400">
                                        <th className="pr-4 pb-1">Name</th><th className="pr-4 pb-1">Email</th>
                                        <th className="pr-4 pb-1">City</th><th className="pb-1">Role</th>
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

                {/* Filters + search */}
                <div className="flex items-center gap-3 flex-wrap">
                    {['unclaimed', 'claimed', 'all'].map(status => (
                        <button key={status} onClick={() => setFilterStatus(status)}
                            className={`text-sm px-4 py-1.5 rounded-full font-semibold transition-colors border ${filterStatus === status ? 'bg-primary text-white border-primary' : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                    <div className="ml-auto relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input type="text" placeholder="Search name, email, city…" value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="text-sm pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary w-56" />
                    </div>
                </div>

                {/* List */}
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
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700">
                                <tr className="text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    <th className="px-5 py-3">Consultant</th>
                                    <th className="px-5 py-3 hidden md:table-cell">Specialisations</th>
                                    <th className="px-5 py-3 hidden lg:table-cell">Links</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 hidden sm:table-cell">Token expires</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {profiles.map(p => {
                                    const specs = Array.isArray(p.specializations) ? p.specializations : []
                                    const isExpired = p.claim_token_expires_at && new Date(p.claim_token_expires_at) < new Date()

                                    return (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* Consultant */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar url={p.avatar_url} name={p.full_name} size={9} />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">{p.full_name}</p>
                                                        <p className="text-xs text-slate-400 truncate max-w-[160px]">{p.email}</p>
                                                        {p.city && (
                                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                                <span className="material-symbols-outlined text-[11px] text-slate-400">location_on</span>
                                                                <span className="text-[11px] text-slate-400">{p.city}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Specialisations */}
                                            <td className="px-5 py-3.5 hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {specs.slice(0, 2).map(s => (
                                                        <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full whitespace-nowrap">{s}</span>
                                                    ))}
                                                    {specs.length > 2 && (
                                                        <span className="text-[10px] text-slate-400">+{specs.length - 2}</span>
                                                    )}
                                                    {specs.length === 0 && <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                                                </div>
                                            </td>

                                            {/* Links */}
                                            <td className="px-5 py-3.5 hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    {p.website && (
                                                        <a href={p.website} target="_blank" rel="noreferrer"
                                                            title={p.website}
                                                            className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                                            <span className="material-symbols-outlined text-[15px]">language</span>
                                                        </a>
                                                    )}
                                                    {p.linkedin_url && (
                                                        <a href={p.linkedin_url} target="_blank" rel="noreferrer"
                                                            title="LinkedIn"
                                                            className="flex size-6 items-center justify-center rounded-md text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                                            <span className="material-symbols-outlined text-[15px]">link</span>
                                                        </a>
                                                    )}
                                                    {!p.website && !p.linkedin_url && <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5">
                                                {p.is_claimed ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[11px]">check_circle</span>
                                                        Claimed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                        <span className="material-symbols-outlined text-[11px]">pending</span>
                                                        Unclaimed
                                                    </span>
                                                )}
                                            </td>

                                            {/* Token expiry */}
                                            <td className="px-5 py-3.5 hidden sm:table-cell text-xs">
                                                {p.claim_token_expires_at
                                                    ? isExpired
                                                        ? <span className="text-red-500 font-semibold">Expired</span>
                                                        : <span className="text-slate-400">{new Date(p.claim_token_expires_at).toLocaleDateString('en-IN')}</span>
                                                    : <span className="text-slate-300 dark:text-slate-600">—</span>}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Edit */}
                                                    <button onClick={() => openEdit(p)} title="Edit"
                                                        className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                                    </button>
                                                    {/* View public */}
                                                    <Link to={`/consultant/unclaimed/${p.id}`} target="_blank" title="View public profile"
                                                        className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                    </Link>
                                                    {!p.is_claimed && p.claim_token && (
                                                        <>
                                                            <button onClick={() => copyClaimLink(p.claim_token)} title="Copy claim link"
                                                                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                            </button>
                                                            <button onClick={() => sendClaimEmail(p)} disabled={sendingEmail === p.id} title="Send claim email"
                                                                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-40">
                                                                <span className={`material-symbols-outlined text-[16px] ${sendingEmail === p.id ? 'animate-spin' : ''}`}>
                                                                    {sendingEmail === p.id ? 'progress_activity' : 'send'}
                                                                </span>
                                                            </button>
                                                        </>
                                                    )}
                                                    {!p.is_claimed && (
                                                        <button onClick={() => deleteProfile(p.id)} title="Delete"
                                                            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400">
                            {profiles.length} profile{profiles.length !== 1 ? 's' : ''} shown
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
