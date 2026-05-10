import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const clients = [
    {
        id: 'C-1024',
        name: 'Sarah Jenkins',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNEDi66eGzRJ4XdbSb5a3HA2J9t6UGn-vEqcA1wLAsBPoRYooBwozyCyiA-eHrygeQMRcf0akhdQmiiyjCYntidLRrfW3qI4P75FvDHXL2N7TsU4cPJrG9TWVhpkZh0FDiip7I4DkVXSa1acRdy2zIl1FA0CBuIjbw7Vgx0SE7TdMdE7L078lBkqEWrfV1i6v0jXleRSbF5YdXpO18UGg63kVHR5RsMOg9EIrOmiXYCran8jld4ZIDwmeJywWTLfQDhp15p4v5QVo',
        visaType: 'Student Visa',
        country: 'Canada',
        countryFlag: '🇨🇦',
        status: 'In Progress',
        statusColor: 'blue',
        lastActivity: 'Oct 24, 2023'
    },
    {
        id: 'C-1025',
        name: 'Michael Chen',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlAnchK3o6PZQArYdvZx9g4f21B3-qKwWvx99pxzfCYv196c50YJ1oCNLxIegLuMX-9WZF2LEjG-A0YGkajn5BhRPLjAYlD0N_O_volsg87sNjEdfcIjD8PqkpGks4fDHHR6Rfxl5ttopxAcbCZ6rmnyoaXcfnQ-msnGoyE70AetScJYNiLJ2eunPjy_CsG510CJvS6orNSA0BpKC2_T0lsRqc4HaT_qY_Gpc5b5VIikDfqW5FOzmrBUTH9oiKfqtrF2L5ckMG8u4',
        visaType: 'Skilled Worker',
        country: 'UK',
        countryFlag: '🇬🇧',
        status: 'Docs Pending',
        statusColor: 'amber',
        lastActivity: 'Oct 22, 2023'
    },
    {
        id: 'C-1030',
        name: 'David Smith',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDknjbKrqVgKLMzErVgV8hOgKRvUKE0UTjzC2QydgRXonWVQg86bmcOZ8w95IFKgWtH8KvtaNShQwj--d2AoFe5vlR9GbU8VmDAEEwLu6r576pInRdVxetouQ7L7YGNot1yqL_9xxtq4ipyl4sB8zuJ-KjzlMC9GYQWBmZn0liUblk9NM-AHnWjRSyspn8Euibtb3ogXdSITXBjIz5M2HxLF-OWIHw9vl7XYgeC38doDHA_MttbP90u22OmHj3aHkvDpBRRNPbh3PM',
        visaType: 'Family Sponsorship',
        country: 'Australia',
        countryFlag: '🇦🇺',
        status: 'Approved',
        statusColor: 'emerald',
        lastActivity: 'Oct 20, 2023'
    },
    {
        id: 'C-1042',
        name: 'Elena Rodriguez',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_QqhFD3qjUqZnVWfDZl5aq4DMMtmKK5sxBuGt4WcdeVfMxLHo3IrkZVEw5Uq6otKxGI5QQPXOg1cY3wSjIKWuWF1Xav-4RK7dwwJ5xTjTZmUsfku0gpBRO_z9VWzZStQQohIYfvpfwCVmSu-rGCK7YiFStrLS-NU8bIXqxBLf5MfoKBeIjkBMLdKcq2Q8_SecxViBKZba77p3eVd4Vp8_G-nq9krPfJvM5Z9GwGcWARQ0zIUwtW3Pi0TVqvYA9Mjl78glXOol-Fs',
        visaType: 'Start-up Visa',
        country: 'Canada',
        countryFlag: '🇨🇦',
        status: 'Action Required',
        statusColor: 'red',
        lastActivity: '2 hours ago'
    },
    {
        id: 'C-1055',
        name: 'James Wilson',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArTvHy8gxpFLLbaFnBJ0bkc_PCfJGlXvIAGmZ8-dr9ggk4YBsuCiyUmykNIQnSOYpnU9tsMVH6yc-b54saVk-2lWJOFJkhoTi-Q8aSN2XjKId2fvLH_p9wxIqTRYeely-u9NawrkQdeyFCb8dmlVvQwLFmqRe2a9q7pSn8G-rhV4SktlomgUk4puS7hUgepby2crmGxAR-GoLLPAihWG69eEv7tzqiFyyKvtQUXqKZ2R37OiKN29cLTbZCcQ3rDFdwmKOiBLCGXZ4',
        visaType: 'Consultation Only',
        country: null,
        isGlobal: true,
        status: 'Lead',
        statusColor: 'slate',
        lastActivity: 'Yesterday'
    }
]

const stats = {
    totalClients: 142,
    activeCases: 24,
    newCasesThisWeek: 2,
    requiresFollowup: 8,
    newThisMonth: 12
}

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [visaFilter, setVisaFilter] = useState('')

    const getStatusClasses = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
            slate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        }
        return colors[color] || colors.slate
    }

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.visaType.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = !statusFilter || client.status.toLowerCase().includes(statusFilter.toLowerCase())
        const matchesVisa = !visaFilter || client.visaType.toLowerCase().includes(visaFilter.toLowerCase())
        return matchesSearch && matchesStatus && matchesVisa
    })

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">
                        Client Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                        Manage your entire client roster, track case statuses, and access client details.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon="download">
                        <span className="hidden sm:inline">Export List</span>
                    </Button>
                    <Link to="/consultant/invite-client">
                        <Button icon="add">Add New Client</Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Clients</p>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">groups</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.totalClients}</p>
                        <span className="text-slate-500 text-xs font-normal">Active & Inactive</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Cases</p>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">folder_shared</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.activeCases}</p>
                        <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                            +{stats.newCasesThisWeek} this week
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Requires Follow-up</p>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">priority_high</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.requiresFollowup}</p>
                        <span className="text-red-600 text-xs font-semibold bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                            Urgent Actions
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">This Month</p>
                        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[20px]">person_add</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold">{stats.newThisMonth}</p>
                        <span className="text-slate-500 text-xs font-normal">New clients added</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search by client name, ID, or visa type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-3">
                    <div className="relative min-w-[160px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="">All Case Statuses</option>
                            <option value="progress">Active In Progress</option>
                            <option value="pending">Pending Documents</option>
                            <option value="approved">Approved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none">expand_more</span>
                    </div>
                    <div className="relative min-w-[160px]">
                        <select
                            value={visaFilter}
                            onChange={(e) => setVisaFilter(e.target.value)}
                            className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                        >
                            <option value="">All Visa Types</option>
                            <option value="student">Student Visa</option>
                            <option value="skilled">Skilled Worker</option>
                            <option value="family">Family Sponsorship</option>
                            <option value="tourist">Tourist Visa</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px] pointer-events-none">expand_more</span>
                    </div>
                    <button className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                    </button>
                </div>
            </div>

            {/* Clients Table */}
            <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">Client Name & ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Visa Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Activity</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredClients.map((client) => (
                                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <a href="#" className="flex items-center gap-3 group/link">
                                            <div
                                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-slate-200 dark:bg-slate-700"
                                                style={{ backgroundImage: `url("${client.avatar}")` }}
                                            ></div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/link:text-primary transition-colors">
                                                    {client.name}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">ID: #{client.id}</span>
                                            </div>
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{client.visaType}</span>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                {client.isGlobal ? (
                                                    <>
                                                        <span className="material-symbols-outlined text-[14px]">public</span>
                                                        Global
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-sm">{client.countryFlag}</span>
                                                        {client.country}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClasses(client.statusColor)}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {client.lastActivity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="Send Message"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">mail</span>
                                            </button>
                                            <button
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="Request Document"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                            </button>
                                            <button
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                                title="View Appointments"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                            </button>
                                            <button
                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing <span className="font-bold text-slate-900 dark:text-white">1-{filteredClients.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{stats.totalClients}</span> clients
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled
                            className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button className="px-3 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
