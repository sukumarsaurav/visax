import { useState } from 'react'

const announcements = [
    {
        id: 1,
        title: 'New Immigration Policy Compliance Standards for 2024',
        excerpt: 'We have updated our compliance requirements regarding document verification for all H-1B related cases. Please review the new guidelines to ensure your applications remain compliant with federal regulations.',
        category: 'Policy Changes',
        date: '2 hours ago',
        featured: true,
        read: false,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiUj3XbtyIpaXtmumSx3UzT2_bzQ-DCF-vegcxCj1zguYFqOPf6OUJDRkyZ-kyCc9Psupa4fRPjKJVz_FGH7D4SX5jodNcPmJ9QogPNgc4yzuq0AzA3oFuJigijpVI4z17VSRouGIRKADnh4JLdXNQqHnzcGCOpiWoIlbKYkcUqyEGB_yYy9--wqEhFjMb-2XNwSu_Xx6Gevi3qh93UQfgflqmKGNzIhCpIlRDvK5oB26b5Bkx0V9g0HxGed8la-sZrf36MJeEu2Y'
    },
    {
        id: 2,
        title: 'Updated Invoicing Cycles for Agency Accounts',
        excerpt: 'Starting next month, all agency accounts will be transitioned to a unified billing cycle. This change is designed to simplify your accounting process and reduce the number of invoices generated per month.',
        category: 'Billing',
        date: 'Oct 23, 2023',
        featured: false,
        read: false
    },
    {
        id: 3,
        title: 'Scheduled Downtime: Sunday, Oct 29th',
        excerpt: 'We will be performing essential database upgrades this coming Sunday from 2:00 AM to 6:00 AM EST. During this window, the My Cases portal will be temporarily unavailable.',
        category: 'Maintenance',
        date: 'Oct 22, 2023',
        featured: false,
        read: false
    },
    {
        id: 4,
        title: 'Introducing: Client Document Auto-Fill',
        excerpt: 'Save time on data entry with our new Auto-Fill feature. When uploading standardized government forms, our system now automatically extracts key client information to populate case fields.',
        category: 'Platform News',
        date: 'Oct 18, 2023',
        featured: false,
        read: true
    },
    {
        id: 5,
        title: 'Update on EB-2 Visa Processing Times',
        excerpt: 'The USCIS has released new guidance affecting the processing times for EB-2 visas. We\'ve compiled a summary of these changes and how they might impact your current case load.',
        category: 'Policy Changes',
        date: 'Oct 15, 2023',
        featured: false,
        read: true
    },
    {
        id: 6,
        title: 'Webinar: Navigating Fall 2023 Regulatory Shifts',
        excerpt: 'Join our expert panel next Friday for a deep dive into the upcoming regulatory changes expected this fall. Certificates of attendance will be provided for CE credits.',
        category: 'Events',
        date: 'Oct 10, 2023',
        featured: false,
        read: true
    }
]

const categories = ['All Updates', 'Platform News', 'Billing', 'Policy Changes', 'Maintenance', 'Events']

export default function AnnouncementsPage() {
    const [activeCategory, setActiveCategory] = useState('All Updates')
    const [searchQuery, setSearchQuery] = useState('')

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Billing':
                return 'text-primary'
            case 'Maintenance':
                return 'text-orange-600'
            case 'Policy Changes':
                return 'text-purple-600'
            case 'Platform News':
                return 'text-emerald-600'
            case 'Events':
                return 'text-pink-600'
            default:
                return 'text-slate-500'
        }
    }

    const featuredAnnouncement = announcements.find(a => a.featured)
    const regularAnnouncements = announcements.filter(a => !a.featured)

    const filteredAnnouncements = regularAnnouncements.filter(a => {
        const matchesCategory = activeCategory === 'All Updates' || a.category === activeCategory
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="flex flex-col gap-6">
            {/* Page Heading */}
            <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                    Announcements
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">
                    Stay updated with the latest news, policy changes, and platform updates.
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                {/* Search */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search announcements..."
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary text-sm font-medium"
                    />
                </div>
                {/* Category Chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`whitespace-nowrap h-9 px-4 rounded-lg text-sm font-medium transition-colors ${activeCategory === category
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Announcement */}
            {featuredAnnouncement && activeCategory === 'All Updates' && (
                <div className="relative w-full overflow-hidden rounded-xl shadow-md group cursor-pointer">
                    <div
                        className="bg-cover bg-center h-[320px] w-full transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage: `linear-gradient(180deg, rgba(16, 24, 34, 0.1) 0%, rgba(16, 24, 34, 0.9) 100%), url("${featuredAnnouncement.image}")`
                        }}
                    ></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">Featured</span>
                            <span className="text-slate-300 text-sm font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                {featuredAnnouncement.date}
                            </span>
                        </div>
                        <h2 className="text-white text-2xl md:text-3xl font-bold leading-tight mb-2 max-w-2xl">
                            {featuredAnnouncement.title}
                        </h2>
                        <p className="text-slate-200 text-sm md:text-base leading-relaxed max-w-2xl line-clamp-2 mb-6">
                            {featuredAnnouncement.excerpt}
                        </p>
                        <button className="flex items-center justify-center gap-2 h-11 px-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm font-bold transition-all w-fit group-hover:bg-primary group-hover:border-primary">
                            Read Full Article
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}

            {/* List Section Header */}
            <div className="flex items-center justify-between pt-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Updates</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
                    <button className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        Newest First <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </button>
                </div>
            </div>

            {/* Feed List */}
            <div className="flex flex-col gap-4">
                {filteredAnnouncements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">notifications_off</span>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No announcements found</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Try a different search or category</p>
                    </div>
                ) : (
                    filteredAnnouncements.map((announcement) => (
                        <div
                            key={announcement.id}
                            className={`group p-5 transition-all cursor-pointer ${announcement.read
                                    ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-l-4 border-l-primary border-y border-r border-slate-200 dark:border-slate-800 dark:border-l-primary rounded-r-lg shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                                <div className={`flex-1 flex flex-col gap-2 ${announcement.read ? 'opacity-80 group-hover:opacity-100 transition-opacity' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        {!announcement.read && (
                                            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                                        )}
                                        <span className={`text-xs font-bold uppercase tracking-wider ${announcement.read ? 'text-slate-500 dark:text-slate-400' : getCategoryColor(announcement.category)
                                            }`}>
                                            {announcement.category}
                                        </span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                                            {announcement.date}
                                        </span>
                                    </div>
                                    <h3 className={`text-lg font-bold group-hover:text-primary transition-colors ${announcement.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-900 dark:text-white'
                                        }`}>
                                        {announcement.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed line-clamp-2 ${announcement.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'
                                        }`}>
                                        {announcement.excerpt}
                                    </p>
                                </div>
                                <button className={`shrink-0 flex items-center text-sm font-bold hover:underline mt-2 md:mt-0 ${announcement.read ? 'text-slate-500 dark:text-slate-400 group-hover:text-primary' : 'text-primary'
                                    }`}>
                                    Read More
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Load More */}
            {filteredAnnouncements.length > 0 && (
                <div className="flex justify-center pt-6 pb-4">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors">
                        Load Older Announcements
                        <span className="material-symbols-outlined">expand_more</span>
                    </button>
                </div>
            )}
        </div>
    )
}
