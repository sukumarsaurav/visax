import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'

const savedProfessionals = [
    {
        id: 1,
        name: 'Sarah Jenkins, Esq.',
        title: 'Immigration Attorney',
        specialty: 'H-1B Visas, Green Cards',
        rating: 4.9,
        reviews: 128,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
        hourlyRate: 250,
        languages: ['English', 'Spanish'],
        isAvailable: true,
    },
    {
        id: 2,
        name: 'Michael Chen',
        title: 'Immigration Consultant',
        specialty: 'Student Visas, Work Permits',
        rating: 4.8,
        reviews: 96,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        hourlyRate: 180,
        languages: ['English', 'Mandarin'],
        isAvailable: true,
    },
    {
        id: 3,
        name: 'Maria Rodriguez',
        title: 'Visa Specialist',
        specialty: 'Family Reunification',
        rating: 4.7,
        reviews: 64,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
        hourlyRate: 150,
        languages: ['English', 'Spanish', 'Portuguese'],
        isAvailable: false,
    },
]

const savedServices = [
    {
        id: 1,
        name: 'H-1B Visa Application',
        description: 'Complete H-1B visa application assistance including petition preparation',
        price: 2500,
        category: 'Work Visas',
        icon: 'work',
    },
    {
        id: 2,
        name: 'Green Card Consultation',
        description: 'Initial consultation for green card eligibility assessment',
        price: 200,
        category: 'Permanent Residency',
        icon: 'card_membership',
    },
]

export default function WishlistPage() {
    const [activeTab, setActiveTab] = useState('professionals')
    const [professionals, setProfessionals] = useState(savedProfessionals)
    const [services, setServices] = useState(savedServices)

    const removeProfessional = (id) => {
        setProfessionals(prev => prev.filter(p => p.id !== id))
    }

    const removeService = (id) => {
        setServices(prev => prev.filter(s => s.id !== id))
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                    My Wishlist
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Your saved professionals and services for quick access.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('professionals')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'professionals'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    Professionals ({professionals.length})
                </button>
                <button
                    onClick={() => setActiveTab('services')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'services'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                >
                    Services ({services.length})
                </button>
            </div>

            {/* Professionals Tab */}
            {activeTab === 'professionals' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professionals.length > 0 ? (
                        professionals.map((professional) => (
                            <Card key={professional.id} className="relative">
                                {/* Remove button */}
                                <button
                                    onClick={() => removeProfessional(professional.id)}
                                    className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                                </button>

                                <div className="flex flex-col items-center text-center gap-3 p-2">
                                    <div className="relative">
                                        <Avatar src={professional.avatar} alt={professional.name} size="xl" />
                                        {professional.isAvailable && (
                                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                        )}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{professional.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{professional.title}</p>
                                    </div>

                                    <div className="flex items-center gap-1 text-sm">
                                        <span className="material-symbols-outlined text-yellow-400 text-[16px]">star</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{professional.rating}</span>
                                        <span className="text-slate-500">({professional.reviews} reviews)</span>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-1">
                                        {professional.languages.map((lang) => (
                                            <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                                        ))}
                                    </div>

                                    <p className="text-sm text-slate-600 dark:text-slate-300">{professional.specialty}</p>

                                    <p className="text-lg font-bold text-primary">
                                        ${professional.hourlyRate}<span className="text-sm font-normal text-slate-500">/hr</span>
                                    </p>

                                    <div className="flex gap-2 w-full mt-2">
                                        <Button className="flex-1" size="sm">Book Now</Button>
                                        <Button variant="outline" size="sm" icon="chat">Message</Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-slate-400 text-3xl">favorite_border</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No saved professionals</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                Browse our directory and save professionals you're interested in working with.
                            </p>
                            <Button className="mt-4" icon="search">Find Professionals</Button>
                        </div>
                    )}
                </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
                <div className="flex flex-col gap-4">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <Card key={service.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined">{service.icon}</span>
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{service.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{service.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Badge variant="secondary">{service.category}</Badge>
                                        <span className="text-lg font-bold text-primary">${service.price.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button size="sm">Get Started</Button>
                                    <button
                                        onClick={() => removeService(service.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-slate-400 text-3xl">bookmark_border</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No saved services</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                Browse available services and save them for later.
                            </p>
                            <Button className="mt-4" icon="search">Browse Services</Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
