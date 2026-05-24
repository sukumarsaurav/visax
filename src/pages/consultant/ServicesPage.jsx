import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useAuth } from '../../contexts/AuthContext'
import * as servicesRepo from '../../data/servicesRepo'
import { writeAuditLog } from '../../lib/auditLog'
import toast from 'react-hot-toast'

const CATEGORIES = ['Visa Application', 'Consultation', 'Document Review', 'Appeal', 'Settlement', 'Citizenship', 'Other']
const ICON_MAP = { 'Visa Application': 'badge', 'Consultation': 'forum', 'Document Review': 'history_edu', 'Appeal': 'gavel', 'Settlement': 'home_work', 'Citizenship': 'public', 'Other': 'handyman' }
const COLOR_MAP = { 'Visa Application': 'blue', 'Consultation': 'purple', 'Document Review': 'orange', 'Appeal': 'red', 'Settlement': 'emerald', 'Citizenship': 'indigo', 'Other': 'slate' }
const BG_MAP = { blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400', slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }

const EMPTY_FORM = { title: '', description: '', category: 'Visa Application', price: '', duration_minutes: 60, is_active: true, expertise_areas: '', target_countries: '' }

export default function ServicesPage() {
    const { user } = useAuth()
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editService, setEditService] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    // F-SV01: confirm before permanently deleting a service
    const [deleteConfirm, setDeleteConfirm] = useState(null) // service object
    const [deleting, setDeleting] = useState(null)

    useEffect(() => {
        if (!user) return
        fetchServices()
    }, [user])

    async function fetchServices() {
        setLoading(true)
        const { data } = await servicesRepo.listByProvider(user.id)
        setServices(data || [])
        setLoading(false)
    }

    const openNew = () => { setForm(EMPTY_FORM); setEditService(null); setShowForm(true) }
    const openEdit = (svc) => { setForm({ ...svc, expertise_areas: (svc.expertise_areas || []).join(', '), target_countries: (svc.target_countries || []).join(', ') }); setEditService(svc); setShowForm(true) }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        const payload = {
            ...form,
            price: parseFloat(form.price) || 0,
            duration_minutes: parseInt(form.duration_minutes) || 60,
            expertise_areas: form.expertise_areas.split(',').map(s => s.trim()).filter(Boolean),
            target_countries: form.target_countries.split(',').map(s => s.trim()).filter(Boolean),
            provider_id: user.id,
        }
        const res = editService
            ? await servicesRepo.update(editService.id, payload)
            : await servicesRepo.create(payload)
        const error = res.error
        if (error) {
            toast.error('Failed to save service. Please try again.')
        } else {
            // F-SV02: audit log on create/update
            await writeAuditLog({
                action: editService ? 'Resource Created' : 'Resource Created',
                entityType: 'service',
                entityId: res.data?.id || editService?.id,
                details: { title: payload.title, price: payload.price, category: payload.category, action: editService ? 'updated' : 'created' },
            })
            toast.success(editService ? 'Service updated!' : 'Service created!')
            setShowForm(false)
            fetchServices()
        }
        setSaving(false)
    }

    const handleToggle = async (svc) => {
        await servicesRepo.setActive(svc.id, !svc.is_active)
        setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !s.is_active } : s))
    }

    // F-SV01: called after ConfirmModal confirms
    const handleDelete = async (svc) => {
        setDeleting(svc.id)
        await servicesRepo.remove(svc.id)
        // F-SV02: audit log on delete
        await writeAuditLog({
            action: 'Resource Deleted',
            entityType: 'service',
            entityId: svc.id,
            details: { title: svc.title },
        })
        setServices(prev => prev.filter(s => s.id !== svc.id))
        setDeleteConfirm(null)
        setDeleting(null)
    }

    const color = (cat) => COLOR_MAP[cat] || 'slate'

    return (
        <div className="flex flex-col gap-6">
            {/* F-SV01: confirm before permanently deleting a service */}
            <ConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Delete service?"
                message={`"${deleteConfirm?.title}" will be permanently removed and will no longer be bookable by clients.`}
                confirmLabel="Delete"
                variant="danger"
                loading={!!deleting}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Services & Pricing</h1>
                    <p className="text-slate-500 mt-1">Manage the services you offer to clients.</p>
                </div>
                <Button icon="add" onClick={openNew}>Add Service</Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{editService ? 'Edit Service' : 'New Service'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Service Title</label>
                                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Description</label>
                                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Price (USD)</label>
                                    <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Duration (minutes)</label>
                                <select value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))} className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary">
                                    {[30, 45, 60, 90, 120, 180].map(d => <option key={d} value={d}>{d} min</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Expertise Areas (comma-separated)</label>
                                <input value={form.expertise_areas} onChange={e => setForm(p => ({ ...p, expertise_areas: e.target.value }))} placeholder="e.g. Study Permit, Work Visa, PR" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">Target Countries (comma-separated)</label>
                                <input value={form.target_countries} onChange={e => setForm(p => ({ ...p, target_countries: e.target.value }))} placeholder="e.g. Canada, UK, Australia" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary" />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                                >
                                    <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Active (visible to clients)</span>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-primary text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
                                    {saving ? 'Saving...' : editService ? 'Update Service' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Services Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : services.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[64px]">design_services</span>
                    <div className="text-center">
                        <p className="text-base font-medium">No services yet</p>
                        <p className="text-sm mt-1">Add services to make them bookable by clients</p>
                    </div>
                    <Button icon="add" onClick={openNew}>Add First Service</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {services.map(svc => {
                        const cat = svc.category || 'Other'
                        const col = color(cat)
                        return (
                            <div key={svc.id} className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 ${!svc.is_active ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div className={`size-10 rounded-lg flex items-center justify-center ${BG_MAP[col]}`}>
                                        <span className="material-symbols-outlined text-[22px]">{ICON_MAP[cat] || 'handyman'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggle(svc)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${svc.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                            <span className={`inline-block size-3.5 transform rounded-full bg-white transition-transform ${svc.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{svc.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{svc.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {(svc.expertise_areas || []).slice(0, 3).map(area => (
                                        <span key={area} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{area}</span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-base font-black text-slate-900 dark:text-white">${svc.price}</p>
                                        <p className="text-xs text-slate-400">{svc.duration_minutes} min · {cat}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(svc)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(svc)}
                                            disabled={deleting === svc.id}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">{deleting === svc.id ? 'hourglass_empty' : 'delete'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
