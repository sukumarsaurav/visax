import { useState } from 'react'
import Button from '../../components/ui/Button'

const services = [
    {
        id: 1,
        name: 'Visa Applications',
        category: 'Core Service',
        icon: 'badge',
        iconColor: 'blue',
        visible: true,
        expertiseAreas: ['Study Permit', 'Work Visa', 'Visitor Visa'],
        countries: [
            { code: 'CA', name: 'Canada', flag: '🇨🇦' },
            { code: 'UK', name: 'UK', flag: '🇬🇧' }
        ],
        pricingModel: 'Starts at $500',
        pricingType: 'per application'
    },
    {
        id: 2,
        name: 'Citizenship',
        category: 'Specialized',
        icon: 'public',
        iconColor: 'indigo',
        visible: true,
        expertiseAreas: ['Naturalization', 'Descent'],
        countries: [
            { code: 'AU', name: 'Australia', flag: '🇦🇺' },
            { code: 'UK', name: 'UK', flag: '🇬🇧' }
        ],
        pricingModel: 'Fixed $2,000',
        pricingType: 'Package'
    },
    {
        id: 3,
        name: 'Document Review',
        category: 'Hourly Service',
        icon: 'history_edu',
        iconColor: 'orange',
        visible: false,
        expertiseAreas: ['Legal Check', 'Translation'],
        countries: [],
        isGlobal: true,
        pricingModel: '$150.00',
        pricingType: 'per hour'
    },
    {
        id: 4,
        name: 'Family Sponsorship',
        category: 'High Priority',
        icon: 'family_restroom',
        iconColor: 'pink',
        visible: true,
        expertiseAreas: ['Spousal', 'Parent/Grandparent'],
        countries: [
            { code: 'CA', name: 'Canada', flag: '🇨🇦' }
        ],
        pricingModel: 'Custom Quote',
        pricingType: 'Varies'
    },
    {
        id: 5,
        name: 'Video Consultation',
        category: 'Introductory',
        icon: 'video_chat',
        iconColor: 'teal',
        visible: true,
        expertiseAreas: ['General Inquiry', 'Strategy'],
        countries: [],
        isGlobal: true,
        pricingModel: '$100.00',
        pricingType: 'per 30 mins'
    }
]

export default function ServicesPage() {
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [serviceList, setServiceList] = useState(services)

    const getIconColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 dark:bg-blue-900/20 text-primary border-blue-100 dark:border-blue-800',
            indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800',
            orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800',
            pink: 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-800',
            teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-800'
        }
        return colors[color] || colors.blue
    }

    const toggleVisibility = (serviceId) => {
        setServiceList(prev => prev.map(s =>
            s.id === serviceId ? { ...s, visible: !s.visible } : s
        ))
    }

    const filteredServices = serviceList.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase())
        if (activeTab === 'all') return matchesSearch
        if (activeTab === 'active') return s.visible && matchesSearch
        if (activeTab === 'drafts') return !s.visible && matchesSearch
        return matchesSearch
    })

    const tabCounts = {
        all: serviceList.length,
        active: serviceList.filter(s => s.visible).length,
        drafts: serviceList.filter(s => !s.visible).length
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">
                        Services Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                        Manage your service offerings, define expertise areas, and set pricing packages.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon="tune">
                        Global Settings
                    </Button>
                    <Button icon="add_circle">
                        Add New Service
                    </Button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex gap-2 p-1 w-full md:w-auto overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'all'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        All Services
                        <span className="ml-1 text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 rounded-full">
                            {tabCounts.all}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'active'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'drafts'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        Drafts
                    </button>
                    <button className="px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">
                        Packages
                    </button>
                </div>
                <div className="relative w-full md:w-64 px-2 mb-2 md:mb-0">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                    <div
                        key={service.id}
                        className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group relative"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-xl flex items-center justify-center border ${getIconColorClasses(service.iconColor)}`}>
                                    <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                        {service.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {service.category}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    {service.visible ? 'Visible' : 'Hidden'}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={service.visible}
                                        onChange={() => toggleVisibility(service.id)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 flex flex-col gap-4 flex-1">
                            {/* Expertise Areas */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Expertise Areas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {service.expertiseAreas.map((area) => (
                                        <span
                                            key={area}
                                            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Geographical Scope */}
                            <div className="flex flex-col gap-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Geographical Scope
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    {service.isGlobal ? (
                                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">globe</span>
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                Global / All Regions
                                            </span>
                                        </div>
                                    ) : (
                                        service.countries.map((country) => (
                                            <div
                                                key={country.code}
                                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                                                title={country.name}
                                            >
                                                <span className="text-sm">{country.flag}</span>
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {country.name}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="flex flex-col gap-1 mt-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Pricing Model
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-base font-bold text-slate-900 dark:text-white">
                                        {service.pricingModel}
                                    </span>
                                    <span className="text-xs text-slate-500">{service.pricingType}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 rounded-b-xl">
                            {service.visible ? (
                                <button className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    Preview
                                </button>
                            ) : (
                                <span className="text-xs font-bold text-slate-400 italic">Currently Offline</span>
                            )}
                            <div className="flex gap-1">
                                <button
                                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-all"
                                    title="Edit Service"
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                    title="Delete Service"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Service Card */}
                <button className="flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group min-h-[300px]">
                    <div className="size-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[32px]">add</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            Create New Service
                        </span>
                        <span className="text-xs text-slate-500 text-center px-8">
                            Define a new service package, set pricing, and publish.
                        </span>
                    </div>
                </button>
            </div>
        </div>
    )
}
