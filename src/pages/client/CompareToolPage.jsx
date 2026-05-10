import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

const allProfessionals = [
    {
        id: 1,
        name: 'Maria Gonzalez',
        title: 'Immigration Attorney',
        type: 'individual',
        rating: 5.0,
        reviews: 120,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
        consultationFee: 150,
        feeType: 'per hour',
        languages: ['English', 'Spanish'],
        experience: '12 Years',
        successRate: 98,
        verified: true,
        bestMatch: true,
        services: ['Family Visas', 'Green Cards', 'Citizenship'],
        responseTime: '< 2 hours',
        availability: 'Next available: Tomorrow',
    },
    {
        id: 2,
        name: 'Global Pathways',
        title: 'Large Agency',
        type: 'agency',
        initials: 'GP',
        rating: 4.2,
        reviews: 85,
        avatar: null,
        consultationFee: 200,
        feeType: 'flat fee',
        languages: ['English', 'French', 'Mandarin'],
        experience: '20+ Years',
        successRate: 95,
        verified: true,
        bestMatch: false,
        services: ['H1-B', 'Corporate', 'Asylum'],
        responseTime: '< 4 hours',
        availability: 'Next available: Today',
    },
    {
        id: 3,
        name: 'David Chen',
        title: 'Visa Consultant',
        type: 'individual',
        rating: 4.8,
        reviews: 42,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        consultationFee: 0,
        feeType: '15 mins free',
        languages: ['English', 'Mandarin'],
        experience: '5 Years',
        successRate: 92,
        verified: false,
        bestMatch: false,
        services: ['Student Visas', 'Tourist'],
        responseTime: '< 6 hours',
        availability: 'Next available: Friday',
    },
    {
        id: 4,
        name: 'Sarah Williams',
        title: 'Immigration Lawyer',
        type: 'individual',
        rating: 4.9,
        reviews: 156,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        consultationFee: 175,
        feeType: 'per hour',
        languages: ['English'],
        experience: '15 Years',
        successRate: 97,
        verified: true,
        bestMatch: false,
        services: ['Citizenship', 'Deportation Defense', 'Appeals'],
        responseTime: '< 1 hour',
        availability: 'Next available: Today',
    },
]

// Star rating component
function StarRating({ rating, reviews }) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center text-yellow-400 gap-0.5">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
                {hasHalfStar && (
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="material-symbols-outlined text-[18px] text-slate-300">star</span>
                ))}
            </div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {rating.toFixed(1)} <span className="text-slate-500 font-normal">({reviews} reviews)</span>
            </span>
        </div>
    )
}

// Success rate bar
function SuccessRateBar({ rate }) {
    return (
        <div className="flex items-center gap-2 justify-center">
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${rate}%` }}
                />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{rate}%</span>
        </div>
    )
}

export default function CompareToolPage() {
    const [selectedIds, setSelectedIds] = useState([1, 2, 3])
    const [showSelector, setShowSelector] = useState(false)
    const [selectorSlot, setSelectorSlot] = useState(null)
    const [highlightDifferences, setHighlightDifferences] = useState(true)

    const selectedProfessionals = selectedIds.map(id =>
        allProfessionals.find(p => p.id === id)
    ).filter(Boolean)

    const handleAddToCompare = (id) => {
        if (selectorSlot !== null) {
            setSelectedIds(prev => {
                const newIds = [...prev]
                newIds[selectorSlot] = id
                return newIds
            })
        } else if (selectedIds.length < 4) {
            setSelectedIds(prev => [...prev, id])
        }
        setShowSelector(false)
        setSelectorSlot(null)
    }

    const handleRemove = (index) => {
        setSelectedIds(prev => prev.filter((_, i) => i !== index))
    }

    const openSelector = (slot = null) => {
        setSelectorSlot(slot)
        setShowSelector(true)
    }

    const clearAll = () => {
        setSelectedIds([])
    }

    // Find best value for highlighting
    const getBestValue = (key, isLowerBetter = false) => {
        const values = selectedProfessionals.map(p => {
            if (key === 'consultationFee') return p[key]
            if (key === 'rating') return p[key]
            if (key === 'successRate') return p[key]
            return null
        }).filter(v => v !== null)

        return isLowerBetter ? Math.min(...values) : Math.max(...values)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col gap-2">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Link to="/client" className="hover:text-primary">Home</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <Link to="/find-professionals" className="hover:text-primary">Search</Link>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white">Compare</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Compare Professionals
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
                        Reviewing {selectedIds.length} selections side-by-side to find your best match. Compare credentials, fees, and success rates.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon="share">Share</Button>
                    <button
                        onClick={clearAll}
                        className="flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm font-bold transition-all"
                    >
                        <span className="material-symbols-outlined mr-2 text-[20px]">delete</span>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Comparison Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={highlightDifferences}
                                onChange={(e) => setHighlightDifferences(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            Highlight Differences
                        </span>
                    </label>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
                    <span className="text-sm text-slate-500">{selectedIds.length} of 4 slots used</span>
                </div>
                {selectedIds.length < 4 && (
                    <button
                        onClick={() => openSelector()}
                        className="flex items-center justify-center rounded-lg h-9 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white text-sm font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined mr-1.5 text-[18px]">add</span>
                        Add another professional
                    </button>
                )}
            </div>

            {/* Comparison Table */}
            <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                {/* Criteria Column - Sticky */}
                                <th className="sticky left-0 z-20 w-48 md:w-60 p-5 text-left align-bottom bg-slate-50 dark:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Criteria</span>
                                </th>

                                {/* Professional Columns */}
                                {selectedProfessionals.map((pro, index) => (
                                    <th key={pro.id} className="w-64 md:w-72 min-w-[256px] p-0 align-top border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative group">
                                        {/* Remove button */}
                                        <button
                                            onClick={() => handleRemove(index)}
                                            className="absolute top-2 right-2 z-10 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Remove"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">close</span>
                                        </button>

                                        <div className="p-5 flex flex-col gap-3 items-center text-center h-full">
                                            {/* Avatar */}
                                            <div className="relative w-20 h-20">
                                                {pro.avatar ? (
                                                    <img
                                                        src={pro.avatar}
                                                        alt={pro.name}
                                                        className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-700 shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-2xl">
                                                        {pro.initials}
                                                    </div>
                                                )}
                                                {pro.verified && (
                                                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-slate-800" title="Verified">
                                                        <span className="material-symbols-outlined text-white text-[12px] font-bold block">check</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name & Title */}
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{pro.name}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{pro.title}</p>
                                            </div>

                                            {/* Best Match Badge */}
                                            {pro.bestMatch && (
                                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded text-yellow-700 dark:text-yellow-400 text-xs font-bold border border-yellow-100 dark:border-yellow-800">
                                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                                                    Best Match
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                ))}

                                {/* Add New Slot */}
                                {selectedIds.length < 4 && (
                                    <th className="w-64 md:w-72 min-w-[256px] p-0 align-top border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="p-5 flex flex-col gap-3 items-center justify-center text-center h-full min-h-[180px]">
                                            <button
                                                onClick={() => openSelector()}
                                                className="group flex flex-col items-center gap-3 w-full h-full justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                                            >
                                                <div className="size-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors text-slate-400">
                                                    <span className="material-symbols-outlined text-[24px]">add</span>
                                                </div>
                                                <span className="text-sm font-medium text-slate-500 group-hover:text-primary">Add Professional</span>
                                            </button>
                                        </div>
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody className="text-sm">
                            {/* Rating Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Overall Rating</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                        <StarRating rating={pro.rating} reviews={pro.reviews} />
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Experience Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Experience</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700 font-medium text-slate-900 dark:text-white">
                                        {pro.experience}
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Services Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Primary Services</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {pro.services.map((service) => (
                                                <span
                                                    key={service}
                                                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-md"
                                                >
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Consultation Fee Row - Highlighted */}
                            <tr className={`border-b border-slate-100 dark:border-slate-700 ${highlightDifferences ? 'bg-yellow-50/40 dark:bg-yellow-900/10' : ''} relative`}>
                                <td className={`sticky left-0 z-10 p-5 font-medium text-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${highlightDifferences ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-white dark:bg-slate-800'}`}>
                                    Consultation Fee
                                    {highlightDifferences && (
                                        <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 text-[10px]" title="Difference highlighted">
                                            <span className="material-symbols-outlined text-[10px]">priority_high</span>
                                        </span>
                                    )}
                                </td>
                                {selectedProfessionals.map((pro) => {
                                    const isBest = highlightDifferences && pro.consultationFee === getBestValue('consultationFee', true)
                                    return (
                                        <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                            <span className={`text-lg font-bold ${pro.consultationFee === 0 ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                                                {pro.consultationFee === 0 ? 'Free' : `$${pro.consultationFee}`}
                                            </span>
                                            <span className="text-xs text-slate-500 block">{pro.feeType}</span>
                                        </td>
                                    )
                                })}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Languages Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Languages</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white">
                                        {pro.languages.join(', ')}
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Success Rate Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Success Rate</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700">
                                        <SuccessRateBar rate={pro.successRate} />
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Response Time Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Response Time</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                                        {pro.responseTime}
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* Availability Row */}
                            <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="sticky left-0 z-10 p-5 font-medium text-slate-500 bg-white dark:bg-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Availability</td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 text-center border-l border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                                        {pro.availability}
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>

                            {/* CTA Row */}
                            <tr className="bg-slate-50 dark:bg-slate-900">
                                <td className="sticky left-0 z-10 p-5 bg-slate-50 dark:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"></td>
                                {selectedProfessionals.map((pro) => (
                                    <td key={pro.id} className="p-5 border-l border-slate-200 dark:border-slate-700">
                                        <div className="flex flex-col gap-2">
                                            <Button className="w-full">Book Consultation</Button>
                                            <Button variant="outline" className="w-full">View Profile</Button>
                                        </div>
                                    </td>
                                ))}
                                {selectedIds.length < 4 && <td className="p-5 border-l border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30"></td>}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Best Match CTA */}
            {selectedProfessionals.some(p => p.bestMatch) && (
                <div className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                    <Button className="w-full h-12 text-base">
                        View Best Match ({selectedProfessionals.find(p => p.bestMatch)?.name})
                    </Button>
                </div>
            )}

            {/* Professional Selector Modal */}
            {showSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Professional</h3>
                            <button
                                onClick={() => {
                                    setShowSelector(false)
                                    setSelectorSlot(null)
                                }}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                {allProfessionals
                                    .filter(p => !selectedIds.includes(p.id) || (selectorSlot !== null && selectedIds[selectorSlot] === p.id))
                                    .map((pro) => (
                                        <button
                                            key={pro.id}
                                            onClick={() => handleAddToCompare(pro.id)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                                        >
                                            {pro.avatar ? (
                                                <Avatar src={pro.avatar} alt={pro.name} size="lg" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {pro.initials}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">{pro.name}</h3>
                                                    {pro.verified && (
                                                        <span className="material-symbols-outlined text-green-500 text-[16px]">verified</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{pro.title}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-sm flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-yellow-400 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                        {pro.rating.toFixed(1)}
                                                    </span>
                                                    <span className="text-sm text-slate-500">
                                                        {pro.consultationFee === 0 ? 'Free consultation' : `$${pro.consultationFee}/${pro.feeType.includes('hour') ? 'hr' : 'session'}`}
                                                    </span>
                                                    <span className="text-sm text-green-600">{pro.successRate}% success</span>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
