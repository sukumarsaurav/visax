import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useAuth } from '../../contexts/AuthContext'
import * as wishlistRepo from '../../data/wishlistRepo'
import toast from 'react-hot-toast'

export default function WishlistPage() {
    const { user } = useAuth()
    const [wishlist, setWishlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [removing, setRemoving] = useState(null)
    // F-WL01: confirm before removing a saved professional
    const [deleteConfirm, setDeleteConfirm] = useState(null) // wishlist item object

    useEffect(() => {
        if (!user) return
        fetchWishlist()
    }, [user])

    async function fetchWishlist() {
        setLoading(true)
        const { data } = await wishlistRepo.listByClient(user.id)
        setWishlist(data || [])
        setLoading(false)
    }

    // F-WL01: called after ConfirmModal confirms
    const handleRemove = async (item) => {
        setRemoving(item.id)
        const { error } = await wishlistRepo.remove(item.id)
        if (error) {
            toast.error('Failed to remove from wishlist. Please try again.')
        } else {
            setWishlist(prev => prev.filter(w => w.id !== item.id))
        }
        setDeleteConfirm(null)
        setRemoving(null)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* F-WL01: confirm before removing a saved professional */}
            <ConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleRemove(deleteConfirm)}
                title="Remove from wishlist?"
                message={`${deleteConfirm?.consultant?.full_name || 'This professional'} will be removed from your saved list.`}
                confirmLabel="Remove"
                variant="danger"
                loading={!!removing}
            />

            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Wishlist</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Your saved professionals for quick access.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            ) : wishlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-slate-400 text-3xl">favorite_border</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No saved professionals</h3>
                    <p className="text-slate-500 max-w-sm mb-6">
                        Browse our directory and save professionals you're interested in working with.
                    </p>
                    <Link to="/client/services">
                        <Button icon="search">Find Professionals</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map(w => {
                        const pro = w.consultant
                        return (
                            <Card key={w.id} className="relative">
                                {/* Remove button */}
                                <button
                                    onClick={() => setDeleteConfirm(w)}
                                    disabled={removing === w.id}
                                    className="absolute top-4 right-4 p-1.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Remove from wishlist"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {removing === w.id ? 'hourglass_empty' : 'favorite'}
                                    </span>
                                </button>

                                <div className="flex flex-col items-center text-center gap-3 p-2 pr-8">
                                    <Avatar src={pro?.avatar_url} alt={pro?.full_name} size="xl" />

                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{pro?.full_name || '—'}</h3>
                                        <p className="text-sm text-slate-500">
                                            {pro?.years_experience ? `${pro.years_experience} yrs experience` : 'Immigration Consultant'}
                                        </p>
                                    </div>

                                    {/* Specializations */}
                                    {pro?.specializations?.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {pro.specializations.slice(0, 2).map(s => (
                                                <Badge key={s} variant="blue" size="sm">{s}</Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Languages */}
                                    {pro?.languages?.length > 0 && (
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {pro.languages.slice(0, 3).map(lang => (
                                                <span key={lang} className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{lang}</span>
                                            ))}
                                        </div>
                                    )}

                                    {pro?.bio && (
                                        <p className="text-xs text-slate-500 line-clamp-2">{pro.bio}</p>
                                    )}

                                    <div className="flex gap-2 w-full mt-2">
                                        <Link to="/client/services" className="flex-1">
                                            <Button className="w-full" size="sm">Book Now</Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
