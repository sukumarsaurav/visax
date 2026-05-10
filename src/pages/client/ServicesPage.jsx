import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'Visa Consultation', label: 'Consultation' },
    { id: 'Document Review', label: 'Document Review' },
    { id: 'Legal Representation', label: 'Legal' },
    { id: 'Application Prep', label: 'Applications' },
]

export default function ServicesPage() {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => { fetchServices() }, [])

    async function fetchServices() {
        setLoading(true)
        const { data } = await supabase
            .from('services')
            .select(`*, provider:profiles!services_provider_id_fkey(id, full_name, avatar_url, is_verified)`)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
        setServices(data || [])
        setLoading(false)
    }

    const filtered = services.filter(s => {
        const matchCat = filter === 'all' || s.category === filter
        const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.provider?.full_name?.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Browse Services</h2>
                <p className="text-sm text-slate-500">Find the right immigration expert for your needs</p>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-slate-400">search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search services or consultants…"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setFilter(c.id)}
                            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                                filter === c.id
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="h-52 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                        <span className="material-symbols-outlined text-[52px]">search_off</span>
                        <p className="font-semibold">No services found</p>
                        <p className="text-sm">Try a different search or category</p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(s => (
                        <Card key={s.id} className="flex flex-col gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                                    <span className="material-symbols-outlined text-[24px] text-primary">design_services</span>
                                </div>
                                {s.category && <Badge variant="blue">{s.category}</Badge>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{s.title}</h3>
                                {s.description && (
                                    <p className="mt-1 text-sm text-slate-500 line-clamp-2">{s.description}</p>
                                )}
                            </div>
                            {s.provider && (
                                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <Avatar src={s.provider.avatar_url} alt={s.provider.full_name} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{s.provider.full_name}</p>
                                        {s.provider.is_verified && (
                                            <span className="text-[10px] font-semibold text-emerald-600">✓ Verified</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="font-black text-slate-900 dark:text-white">
                                    {s.price ? `$${s.price}` : 'Contact for price'}
                                </span>
                                <Button size="sm">Book Now</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {filtered.length === 0 && !loading && (
                <div className="text-center">
                    <p className="text-sm text-slate-500">
                        Want to find a professional directly?{' '}
                        <Link to="/find-professionals" className="font-semibold text-primary hover:underline">Browse all professionals</Link>
                    </p>
                </div>
            )}
        </div>
    )
}
