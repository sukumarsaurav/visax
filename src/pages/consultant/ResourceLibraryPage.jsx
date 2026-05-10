import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

// Mock resource data
const resources = [
    {
        id: 1,
        title: 'Client Intake Form v2.4',
        description: 'Standardized intake form for new immigration clients. Includes GDPR compliance section and updated family history fields.',
        type: 'pdf',
        category: 'LEGAL',
        date: 'Dec 24, 2024',
        action: 'download'
    },
    {
        id: 2,
        title: 'Welcome Email Sequence',
        description: 'A 5-part email series template designed to nurture new leads. Customizable fields for agency name and specific services.',
        type: 'doc',
        category: 'TEMPLATE',
        date: 'Dec 12, 2024',
        action: 'download'
    },
    {
        id: 3,
        title: 'Platform Navigation 101',
        description: 'Video walkthrough of the new dashboard features introduced in Q3. Learn how to manage client cases more efficiently.',
        type: 'video',
        category: 'TUTORIAL',
        date: 'Dec 05, 2024',
        action: 'watch'
    },
    {
        id: 4,
        title: 'Case Progress Tracker',
        description: 'Excel spreadsheet with built-in formulas to track the status of multiple client applications. Includes automated deadlines.',
        type: 'excel',
        category: 'CHECKLIST',
        date: 'Nov 28, 2024',
        action: 'download'
    },
    {
        id: 5,
        title: 'Consultant Ethics Code',
        description: 'The updated code of ethics for certified immigration consultants. Mandatory reading for annual recertification.',
        type: 'pdf',
        category: 'GUIDE',
        date: 'Nov 15, 2024',
        action: 'download'
    },
    {
        id: 6,
        title: 'Service Fee Proposal',
        description: 'Professional proposal template for corporate clients. Includes sections for scope of work, timeline, and fee structure.',
        type: 'doc',
        category: 'MARKETING',
        date: 'Nov 10, 2024',
        action: 'download'
    }
]

const categories = [
    { id: 'all', label: 'All Resources', icon: 'folder_open' },
    { id: 'legal', label: 'Legal Guides', icon: 'gavel' },
    { id: 'marketing', label: 'Marketing Templates', icon: 'campaign' },
    { id: 'howto', label: 'Platform How-Tos', icon: 'desktop_windows' },
    { id: 'forms', label: 'Forms & Checklists', icon: 'checklist' },
    { id: 'best', label: 'Best Practices', icon: 'lightbulb' }
]

const typeFilters = [
    { id: 'all', label: 'All Types' },
    { id: 'pdf', label: 'PDF Documents' },
    { id: 'excel', label: 'Spreadsheets' },
    { id: 'video', label: 'Videos' },
    { id: 'doc', label: 'Presentations' }
]

const typeConfig = {
    pdf: { icon: 'picture_as_pdf', bgColor: 'bg-red-50 dark:bg-red-900/20', textColor: 'text-red-600 dark:text-red-400' },
    doc: { icon: 'article', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
    video: { icon: 'play_circle', bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400' },
    excel: { icon: 'table_view', bgColor: 'bg-green-50 dark:bg-green-900/20', textColor: 'text-green-600 dark:text-green-400' }
}

export default function ResourceLibraryPage() {
    const { consultantType } = useOutletContext() || {}
    const [activeCategory, setActiveCategory] = useState('all')
    const [activeTypeFilter, setActiveTypeFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = activeTypeFilter === 'all' || r.type === activeTypeFilter
        return matchesSearch && matchesType
    })

    return (
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Sidebar - Categories */}
            <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                    <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">Browse Categories</p>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${activeCategory === cat.id
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-xl ${activeCategory === cat.id ? '' : 'text-slate-400'}`}>
                                {cat.icon}
                            </span>
                            <span className="text-sm font-medium">{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Help Box */}
                <Card className="mt-auto">
                    <div className="flex gap-2 items-center mb-2">
                        <span className="material-symbols-outlined text-primary">support_agent</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">Need help?</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                        Can't find the document you need? Contact our support team for assistance.
                    </p>
                    <button className="text-xs font-bold text-primary hover:underline">Contact Support</button>
                </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-end gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Resource Library</h1>
                        <p className="text-slate-500 dark:text-slate-400">Tools, guides, and forms to support your immigration practice</p>
                    </div>
                    <Button variant="outline" icon="upload_file">Submit Resource</Button>
                </div>

                {/* Search */}
                <div className="relative w-full">
                    <div className="flex w-full items-center rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 h-14 px-4 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                        <span className="material-symbols-outlined text-slate-400 text-2xl mr-3">search</span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for guides, forms, templates, or keywords..."
                            className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base focus:ring-0 px-0"
                        />
                        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700 ml-2">
                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap px-2">Sort by:</span>
                            <select className="bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer pr-8 py-0">
                                <option>Relevance</option>
                                <option>Date (Newest)</option>
                                <option>Alphabetical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Featured Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-900 min-h-[200px] flex items-end group shadow-lg">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(19, 109, 236, 0.9) 100%), url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200")'
                        }}
                    ></div>
                    <div className="relative z-10 p-6 md:p-8 w-full max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold mb-3">
                            <span className="material-symbols-outlined text-sm">star</span>
                            Featured
                        </div>
                        <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2">New: 2024 Visa Policy Update Guide</h2>
                        <p className="text-slate-100 text-sm md:text-base leading-relaxed mb-4 opacity-90 max-w-xl">
                            Comprehensive breakdown of the latest legislative changes affecting work permits and student visas for the upcoming fiscal year.
                        </p>
                        <button className="bg-white text-primary hover:bg-slate-50 font-bold py-2.5 px-5 rounded-lg text-sm inline-flex items-center gap-2 transition-colors">
                            <span>Read Guide</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Type Filters */}
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {typeFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveTypeFilter(filter.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTypeFilter === filter.id
                                    ? 'bg-primary text-white shadow-sm ring-1 ring-primary/20'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Resource Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredResources.map(resource => (
                        <Card key={resource.id} className="group flex flex-col hover:shadow-md hover:border-primary/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`size-12 rounded-lg ${typeConfig[resource.type].bgColor} flex items-center justify-center ${typeConfig[resource.type].textColor}`}>
                                    <span className="material-symbols-outlined text-2xl">{typeConfig[resource.type].icon}</span>
                                </div>
                                <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                    {resource.category}
                                </div>
                            </div>
                            <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                {resource.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">
                                {resource.description}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                <span className="text-xs text-slate-400 font-medium">{resource.date}</span>
                                <button className="text-primary hover:text-blue-700 dark:hover:text-blue-400 text-sm font-bold flex items-center gap-1">
                                    {resource.action === 'download' ? 'Download' : 'Watch Now'}
                                    <span className="material-symbols-outlined text-base">
                                        {resource.action === 'download' ? 'download' : 'open_in_new'}
                                    </span>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 mb-8">
                    <div className="flex gap-1">
                        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <span className="material-symbols-outlined text-base">chevron_left</span>
                        </button>
                        <button className="size-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shadow-md">1</button>
                        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm">2</button>
                        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm">3</button>
                        <span className="size-10 flex items-center justify-center text-slate-400">...</span>
                        <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
