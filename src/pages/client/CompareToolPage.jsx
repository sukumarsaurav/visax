import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import { supabase } from '../../lib/supabase'

function StarRating({ rating, reviews }) {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    const empty = 5 - full - (half ? 1 : 0)
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center text-yellow-400 gap-0.5">
                {Array.from({ length: full }).map((_, i) => (
                    <span key={`f${i}`} className="material-symbols-outlined text-[18px]">star</span>
                ))}
                {half && <span className="material-symbols-outlined text-[18px]">star_half</span>}
                {Array.from({ length: empty }).map((_, i) => (
                    <span key={`e${i}`} className="material-symbols-outlined text-[18px] text-slate-300">star</span>
                ))}
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {rating > 0 ? rating.toFixed(1) : 'No ratings'} <span className="text-slate-500 font-normal">({reviews} reviews)</span>
            </span>
        </div>
    )
}

function RateBar({ value, label }) {
    return (
        <div className="flex items-center gap-2 justify-center">
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${value}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{label}</span>
        </div>
    )
}

export default function CompareToolPage() {
    const [allConsultants, setAllConsultants] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState([])
    const [showSelector, setShowSelector] = useState(false)
    const [selectorSlot, setSelectorSlot] = useState(null)
    const [highlightDifferences, setHighlightDifferences] = useState(true)

    useEffect(() => { fetchConsultants() }, [])

    async function fetchConsultants() {
        setLoading(true)
        // Fetch consultants with their services and reviews
        const { data: profiles } = await supabase
            .from('profiles')
            .select(`
                id, full_name, avatar_url, bio,
                years_experience, languages, specializations,
                is_verified
            `)
            .in('role', ['individual', 'agency_admin'])
            .eq('application_status', 'approved')
            .limit(20)

        if (!profiles) { setLoading(false); return }

        const ids = profiles.map(p => p.id)

        // Use pre-aggregated materialized view instead of full reviews scan
        const [ratingSummaries, servicesRes] = await Promise.all([
            supabase.from('consultant_rating_summary').select('consultant_id, avg_rating, review_count').in('consultant_id', ids),
            supabase.from('services').select('provider_id, title, price').eq('is_active', true).in('provider_id', ids),
        ])

        const ratingMap = {}
        const countMap = {}
        for (const r of ratingSummaries.data || []) {
            ratingMap[r.consultant_id] = Number(r.avg_rating) * r.review_count
            countMap[r.consultant_id] = r.review_count
        }

        const servicesData = servicesRes.data

        const servicesMap = {}
        for (const s of servicesData || []) {
            if (!servicesMap[s.provider_id]) servicesMap[s.provider_id] = []
            servicesMap[s.provider_id].push(s)
        }

        const consultants = profiles.map(p => {
            const reviewCount = countMap[p.id] || 0
            const avgRating = reviewCount > 0 ? ratingMap[p.id] / reviewCount : 0
            const myServices = servicesMap[p.id] || []
            const minPrice = myServices.length > 0 ? Math.min(...myServices.map(s => Number(s.price))) : null

            return {
                id: p.id,
                name: p.full_name || 'Unknown',
                avatar: p.avatar_url,
                bio: p.bio,
                experience: p.years_experience ? `${p.years_experience} Years` : '—',
                languages: p.languages || [],
                services: (p.specializations || []).slice(0, 4),
                rating: parseFloat(avgRating.toFixed(1)),
                reviews: reviewCount,
                verified: p.is_verified || false,
                consultationFee: minPrice,
                feeType: minPrice !== null ? 'starting price' : 'contact for pricing',
            }
        })

        setAllConsultants(consultants)
        // Pre-select first 3
        setSelectedIds(consultants.slice(0, Math.min(3, consultants.length)).map(c => c.id))
        setLoading(false)
    }

    const selected = selectedIds.map(id => allConsultants.find(c => c.id === id)).filter(Boolean)

    const handleAddToCompare = (id) => {
        if (selectorSlot !== null) {
            setSelectedIds(prev => { const n = [...prev]; n[selectorSlot] = id; return n })
        } else if (selectedIds.length < 4) {
            setSelectedIds(prev => [...prev, id])
        }
        setShowSelector(false)
        setSelectorSlot(null)
    }

    const handleRemove = (index) => {
        setSelectedIds(prev => prev.filter((_, i) => i !== index))
    }

    const openSelector = (slot = null) => { setSelectorSlot(slot); setShowSelector(true) }

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 w-80" />
                <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-2">
                        <Link to="/client" className="hover:text-primary">Home</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white">Compare Professionals</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Compare Professionals</h1>
                    <p className="text-slate-500 mt-1">Side-by-side comparison to find your best match.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedIds([])}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                    <button
                        type="button"
                        onClick={() => setHighlightDifferences(v => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highlightDifferences ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${highlightDifferences ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">Highlight Differences</span>
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{selectedIds.length} of 4 selected</span>
                    {selectedIds.length < 4 && (
                        <button
                            onClick={() => openSelector()}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Add Professional
                        </button>
                    )}
                </div>
            </div>

            {selected.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-20 text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[64px]">compare</span>
                    <p className="text-base font-medium">No professionals selected</p>
                    <Button icon="add" onClick={() => openSelector()}>Add Professionals to Compare</Button>
                </div>
            ) : (
                /* Comparison Table */
                <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                    <th className="sticky left-0 z-20 w-48 p-5 text-left align-bottom bg-slate-50 dark:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Criteria</span>
                                    </th>
                                    {selected.map((pro, index) => (
                                        <th key={pro.id} className="w-64 min-w-[240px] p-0 align-top border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative">
                                            <button
                                                onClick={() => handleRemove(index)}
                                                className="absolute top-2 right-2 z-10 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">close</span>
                                            </button>
                                            <div className="p-5 flex flex-col items-center text-center gap-3">
                                                <div className="relative">
                                                    <Avatar src={pro.avatar} alt={pro.name} size="xl" />
                                                    {pro.verified && (
                                                        <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-slate-800">
                                                            <span className="material-symbols-outlined text-white text-[12px] block">check</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{pro.name}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">{pro.experience} experience</p>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                    {selectedIds.length < 4 && (
                                        <th className="w-64 min-w-[240px] p-0 align-top border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                            <div className="p-5 flex items-center justify-center min-h-[180px]">
                                                <button
                                                    onClick={() => openSelector()}
                                                    className="flex flex-col items-center gap-3 w-full h-full justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all"
                                                >
                                                    <div className="size-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:text-primary">
                                                        <span className="material-symbols-outlined text-[24px]">add</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-500">Add Professional</span>
                                                </button>
                                            </div>
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* Rating */}
                                <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Overall Rating</td>
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                            <StarRating rating={pro.rating} reviews={pro.reviews} />
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>

                                {/* Experience */}
                                <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Experience</td>
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                                            {pro.experience}
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>

                                {/* Specializations */}
                                <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Specializations</td>
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                            {pro.services.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5 justify-center">
                                                    {pro.services.map(s => (
                                                        <span key={s} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded">{s}</span>
                                                    ))}
                                                </div>
                                            ) : <span className="text-slate-400 text-xs">Not specified</span>}
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>

                                {/* Fee */}
                                <tr className={`border-b border-slate-100 dark:border-slate-700 ${highlightDifferences ? 'bg-yellow-50/40 dark:bg-yellow-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}>
                                    <td className={`sticky left-0 z-10 p-5 font-medium text-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${highlightDifferences ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                        Consultation Fee
                                        {highlightDifferences && <span className="ml-1 text-yellow-600 text-[10px] font-bold">▲ DIFF</span>}
                                    </td>
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                            <span className={`text-lg font-bold ${pro.consultationFee === 0 ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                                                {pro.consultationFee === null ? '—' : pro.consultationFee === 0 ? 'Free' : `$${pro.consultationFee}`}
                                            </span>
                                            <span className="text-xs text-slate-500 block">{pro.feeType}</span>
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>

                                {/* Languages */}
                                <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Languages</td>
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
                                            {pro.languages.length > 0 ? pro.languages.join(', ') : '—'}
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>

                                {/* Verified */}
                                <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Verified</td>
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                            {pro.verified ? (
                                                <span className="material-symbols-outlined material-filled text-green-500 text-[24px]">verified</span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Not verified</span>
                                            )}
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>

                                {/* CTA */}
                                <tr className="bg-slate-50 dark:bg-slate-900">
                                    <td className="sticky left-0 z-10 p-5 bg-slate-50 dark:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" />
                                    {selected.map(pro => (
                                        <td key={pro.id} className="p-5 border-l border-slate-200 dark:border-slate-700">
                                            <div className="flex flex-col gap-2">
                                                <Link to="/client/services">
                                                    <Button className="w-full">Book Consultation</Button>
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        const { data } = await supabase.from('wishlist').upsert({ client_id: (await supabase.auth.getUser()).data.user?.id, consultant_id: pro.id }, { onConflict: 'client_id,consultant_id', ignoreDuplicates: true })
                                                    }}
                                                    className="flex items-center justify-center gap-1 w-full py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">favorite_border</span>
                                                    Save to Wishlist
                                                </button>
                                            </div>
                                        </td>
                                    ))}
                                    {selectedIds.length < 4 && <td className="p-5 border-l border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30" />}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Selector Modal */}
            {showSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Professional</h3>
                            <button onClick={() => { setShowSelector(false); setSelectorSlot(null) }} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {allConsultants.filter(c => !selectedIds.includes(c.id) || (selectorSlot !== null && selectedIds[selectorSlot] === c.id)).map(pro => (
                                <button
                                    key={pro.id}
                                    onClick={() => handleAddToCompare(pro.id)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-100 dark:border-slate-800"
                                >
                                    <Avatar src={pro.avatar} alt={pro.name} size="md" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900 dark:text-white">{pro.name}</p>
                                            {pro.verified && <span className="material-symbols-outlined text-green-500 text-[16px]">verified</span>}
                                        </div>
                                        <p className="text-xs text-slate-500">{pro.experience} · {pro.languages.slice(0, 2).join(', ')}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="material-symbols-outlined material-filled text-yellow-400 text-[14px]">star</span>
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                {pro.rating > 0 ? pro.rating.toFixed(1) : 'No ratings'} ({pro.reviews})
                                            </span>
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                </button>
                            ))}
                            {allConsultants.filter(c => !selectedIds.includes(c.id)).length === 0 && (
                                <p className="text-center text-slate-400 py-8 text-sm">All available consultants are already selected</p>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
