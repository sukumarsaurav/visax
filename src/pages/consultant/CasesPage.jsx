import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'

// Mock case data
const cases = [
    {
        id: '492-221',
        clientName: 'John Doe',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIsyilI4NDHswKlN46ZxVGlCTuuTZEMrlh0qk5n_eRRjNveDUqA9__UbeYVhAcGrWzxLfGh-Ni5tFI-aDwgAYGX4mzOix2-8lDYU4mffty3xV2dj0H-YinInTjKIHad-LQKsgqQ3LzTiV-bTGuzvQMPwY9o_Ws-wGT6NpwHGoDsX0Hxm6O-BRFzrXIaiYcu70gqAt7dZD-funXd25hEHpST4M5XkB0HzpxZc_lN6iLHyhQt5--r6rrcNWc0eHVg_sEIvkpihFzky0',
        applicationType: 'Express Entry - PR',
        subType: 'Federal Skilled Worker',
        status: 'Action Required',
        statusColor: 'amber',
        lastUpdate: 'Dec 28, 2024',
        progress: 45,
        location: 'Toronto, Canada',
        email: 'john.doe@example.com'
    },
    {
        id: '493-105',
        clientName: 'Maria Garcia',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW9b2s1cV0V7yXQuIeEx1KpHQXidX3zbYN1nzSz1-1mysunG0TsVVBIKy7DCN3iUZou2XKeLTlaDSdyOtZck8mjXANO0wX7RYqLFPoN1VGNGOf9AqYGL7mA9YEFibPCpkQxlNyFcNcuuG9SnU57kq33KvUTByn2r4qjw5gh7EkwjHYkxbuK7rj3LaRdkNQmAmQFmW5wrsqSg-e_OI_81DYmCmur0JD2sKLBdaBS-e7YSk5YrQ1OPAtHby2G_DGx3fyK8Sxe58XiWY',
        applicationType: 'Spousal Sponsorship',
        subType: 'Inland Application',
        status: 'Submitted',
        statusColor: 'purple',
        lastUpdate: 'Dec 25, 2024',
        progress: 90,
        location: 'Vancouver, Canada',
        email: 'maria.garcia@example.com'
    },
    {
        id: '490-882',
        clientName: 'Ahmed Khan',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0pa81f0AKVU7dhAvTY-GWeyQDqIEVSiWJkKxm8xgjABiIG7fgrKCJit7QkUDyl5RiQ2xBJJSi8JCutNSxWmQy-Hpt01or0ShaF59WZg9e0nc8Zxs0tmpqgNonyWEcHceVrsFxsMNBauqrZFnfcXZjoub5kys_GZnZsiLIBJ9G8F85SbzRFK1frcGsGzkArtsVbsk2t3av_Iq8vnMnlIrOsKQtZoAR26WmhrJhK6hKS706R-94fv2z37_8BHqGFdVSrGX-QlnbN9I',
        applicationType: 'Study Permit',
        subType: 'University of Toronto',
        status: 'Interview Set',
        statusColor: 'blue',
        lastUpdate: 'Dec 20, 2024',
        progress: 60,
        location: 'Dubai, UAE',
        email: 'ahmed.khan@example.com'
    },
    {
        id: '488-339',
        clientName: 'Li Wei',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiifMPtC-JT8jR6Z9PoDchfQrkVdkN3wHRX-rNt3L64ck4BgwNDDk9hTB62jrbbYEMfgOKZsuGcOJmLuB5TVuXP18J8DLNYKIe5ipLnwDmmD2yvXs1ioaCx1e1d9MsSq9DWL8ImYx5279Z2UjWc_iWMSx4ctgiXBVaxt1ucZRDzsXQAjk0xR_-FqjRN32rPbP4FrO-C-hDv_6TzhwWJk-CfAICCDle81gNq3wQXZTL68REurf3slNZ5ozdtTkXQB69_VOWeg81IVc',
        applicationType: 'Work Permit Ext.',
        subType: 'LMIA Exempt',
        status: 'Approved',
        statusColor: 'emerald',
        lastUpdate: 'Dec 15, 2024',
        progress: 100,
        location: 'Shanghai, China',
        email: 'li.wei@example.com'
    }
]

const documents = [
    { id: 1, name: 'Passport Scan', status: 'received', date: 'Dec 22' },
    { id: 2, name: 'Medical Exam Results', status: 'pending', date: null },
    { id: 3, name: 'Police Certificate', status: 'not_requested', date: null }
]

const activities = [
    { id: 1, time: 'Today, 10:23 AM', text: 'System sent automated reminder for Medical Exam.' },
    { id: 2, time: 'Dec 24, 2:00 PM', text: 'John Doe uploaded 1 document.', highlight: true, file: 'Passport_Scan_Main.pdf' },
    { id: 3, time: 'Dec 20, 9:15 AM', text: 'Case status changed to Collecting Documents.' }
]

const filterTabs = [
    { id: 'all', label: 'All Cases', icon: 'view_list', color: null },
    { id: 'pending', label: 'Pending Action', icon: 'pending_actions', color: 'text-yellow-500', count: 3 },
    { id: 'review', label: 'Under Review', icon: 'reviews', color: 'text-purple-500' }
]

export default function CasesPage() {
    const { consultantType } = useOutletContext() || {}
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedCase, setSelectedCase] = useState(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.includes(searchTerm) ||
            c.applicationType.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeFilter === 'pending') return matchesSearch && c.status === 'Action Required'
        if (activeFilter === 'review') return matchesSearch && (c.status === 'Submitted' || c.status === 'Interview Set')
        return matchesSearch
    })

    const handleCaseSelect = (caseItem) => {
        setSelectedCase(caseItem)
        setIsPanelOpen(true)
    }

    const handleClosePanel = () => {
        setIsPanelOpen(false)
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                        Case Management
                    </h1>
                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700"></div>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span>All Clients</span>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                        <span className="text-primary font-medium">Active Cases</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search clients, file #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary w-64 placeholder-slate-400"
                        />
                    </div>
                    <Button icon="add">New Client</Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {filterTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === tab.id
                            ? 'bg-primary text-white shadow-sm shadow-blue-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-base ${activeFilter !== tab.id && tab.color ? tab.color : ''}`}>
                            {tab.icon}
                        </span>
                        {tab.label}
                        {tab.count && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${activeFilter === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 ml-auto">
                    <span className="material-symbols-outlined text-base">filter_list</span>
                    Filter
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Cases Table */}
                <div className="flex-1 min-w-0">
                    <Card className="h-full overflow-hidden p-0 flex flex-col">
                        <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800/50 z-10">
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Client Name</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Application Type</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Last Update</th>
                                        <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {filteredCases.map(c => (
                                        <tr
                                            key={c.id}
                                            onClick={() => handleCaseSelect(c)}
                                            className={`cursor-pointer transition-colors border-l-4 ${selectedCase?.id === c.id && isPanelOpen
                                                ? 'bg-blue-50/60 dark:bg-blue-900/10 border-l-primary'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-transparent'
                                                }`}
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={c.avatar} alt={c.clientName} size="sm" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{c.clientName}</p>
                                                        <p className="text-xs text-slate-500">ID: #{c.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{c.applicationType}</p>
                                                <p className="text-xs text-slate-500">{c.subType}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge variant={c.statusColor}>{c.status}</Badge>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-sm text-slate-600 dark:text-slate-300">{c.lastUpdate}</p>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${c.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`}
                                                            style={{ width: `${c.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.progress}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Case Detail Panel - Slide In */}
                {selectedCase && (
                    <React.Fragment>
                        {/* Overlay */}
                        <div
                            className={`fixed inset-0 bg-black/20 z-30 transition-opacity xl:hidden ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={handleClosePanel}
                        />
                        {/* Panel */}
                        <div className={`fixed right-0 top-0 h-full w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl z-40 flex flex-col transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            {/* Case Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={selectedCase.avatar} alt={selectedCase.clientName} size="lg" />
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedCase.clientName}</h3>
                                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {selectedCase.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <span className="material-symbols-outlined">more_horiz</span>
                                        </button>
                                        <button
                                            onClick={handleClosePanel}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">{selectedCase.applicationType}</span>
                                        <Badge variant={selectedCase.statusColor} size="sm">{selectedCase.status}</Badge>
                                    </div>
                                    <div className="relative">
                                        <div className="overflow-hidden h-2 flex rounded bg-slate-100 dark:bg-slate-700">
                                            <div className="bg-primary" style={{ width: `${selectedCase.progress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                                            <span>Initiated</span>
                                            <span className={selectedCase.progress >= 30 ? 'text-primary' : ''}>Collecting Docs</span>
                                            <span className={selectedCase.progress >= 60 ? 'text-primary' : ''}>Review</span>
                                            <span className={selectedCase.progress >= 90 ? 'text-primary' : ''}>Submission</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex items-center gap-1 mt-6 border-b border-slate-100 dark:border-slate-800">
                                    <button className="px-4 py-2 text-sm font-bold text-primary border-b-2 border-primary">Overview</button>
                                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400">Documents</button>
                                    <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400">Notes</button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-bold transition-colors">
                                        <span className="material-symbols-outlined text-lg">upload_file</span>
                                        Request Doc
                                    </button>
                                    <button className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors">
                                        <span className="material-symbols-outlined text-lg">schedule</span>
                                        Book Meeting
                                    </button>
                                </div>

                                {/* Document Checklist */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Required Documents</h4>
                                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                                            {documents.filter(d => d.status === 'pending').length} Pending
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700 space-y-3">
                                        {documents.map(doc => (
                                            <div key={doc.id} className={`flex items-start gap-3 ${doc.status === 'not_requested' ? 'opacity-60' : ''}`}>
                                                <div className={`mt-0.5 p-1 rounded-full ${doc.status === 'received' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                    doc.status === 'pending' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse' :
                                                        'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-base block">
                                                        {doc.status === 'received' ? 'check' : doc.status === 'pending' ? 'hourglass_empty' : 'radio_button_unchecked'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{doc.name}</p>
                                                    <p className={`text-xs ${doc.status === 'pending' ? 'text-amber-600 dark:text-amber-500 font-medium' : 'text-slate-400'}`}>
                                                        {doc.status === 'received' ? `Received ${doc.date}` :
                                                            doc.status === 'pending' ? 'Pending Client Upload' : 'Not yet requested'}
                                                    </p>
                                                </div>
                                                <button className="text-primary text-xs font-bold hover:underline">
                                                    {doc.status === 'pending' ? 'Remind' : doc.status === 'not_requested' ? 'Request' : ''}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Activity Timeline */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h4>
                                    <div className="relative pl-4 space-y-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                                        {activities.map(activity => (
                                            <div key={activity.id} className="relative pl-4">
                                                <div className={`absolute left-[-4px] top-1 size-2.5 rounded-full border-2 border-white dark:border-slate-900 ${activity.highlight ? 'bg-primary shadow shadow-blue-500/50' : 'bg-slate-300 dark:bg-slate-600'
                                                    }`}></div>
                                                <p className="text-xs text-slate-400 mb-0.5">{activity.time}</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-200">{activity.text}</p>
                                                {activity.file && (
                                                    <div className="mt-2 flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-red-500 text-xl">picture_as_pdf</span>
                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{activity.file}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        placeholder={`Type a message to ${selectedCase.clientName.split(' ')[0]}...`}
                                        className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary"
                                    />
                                    <button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-xl block">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}
