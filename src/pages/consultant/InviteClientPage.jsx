import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'

// Mock client data for search
const clients = [
    { id: '493-105', name: 'Maria Garcia', email: 'maria.garcia@example.com', caseType: 'Spousal Sponsorship', status: 'Active Client' },
    { id: '492-221', name: 'John Doe', email: 'john.doe@example.com', caseType: 'Express Entry - PR', status: 'Active Client' },
    { id: '490-882', name: 'Ahmed Khan', email: 'ahmed.khan@example.com', caseType: 'Study Permit', status: 'Active Client' },
]

const recentInvitations = [
    { id: 1, name: 'Ahmed Khan', status: 'accepted', method: 'Email', date: 'Dec 24' },
    { id: 2, name: 'John Doe', status: 'pending', method: 'Email', date: 'Dec 22' },
    { id: 3, name: 'Li Wei', status: 'expired', method: 'Link', date: 'Dec 15' },
]

const statusConfig = {
    accepted: { color: 'emerald', label: 'Accepted', icon: 'check_circle' },
    pending: { color: 'amber', label: 'Pending', icon: 'schedule' },
    expired: { color: 'red', label: 'Expired', icon: 'timer_off' }
}

const defaultPermissions = [
    { id: 'view_status', label: 'View Case Status', description: 'Allow client to see timeline and status updates.', checked: true },
    { id: 'upload_docs', label: 'Upload Documents', description: 'Enable file uploads for requested items.', checked: true },
    { id: 'messaging', label: 'Secure Messaging', description: 'Enable direct chat with the consultant.', checked: true },
    { id: 'sign_contracts', label: 'Sign Contracts', description: 'Allow digital signing of retainers.', checked: false },
]

export default function InviteClientPage() {
    const { consultantType } = useOutletContext() || {}
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClient, setSelectedClient] = useState(clients[0])
    const [permissions, setPermissions] = useState(defaultPermissions)
    const [inviteMethod, setInviteMethod] = useState('email')
    const [subject, setSubject] = useState('Action Required: Setup your ImmigrationPro Client Portal')
    const [message, setMessage] = useState(`Hi {{Client Name}},

Please accept this invitation to access your secure client portal. Here you will be able to track your application status, upload documents, and communicate with us directly.

Click the link below to get started:
{{Portal Link}}

Best regards,
Alex Morgan`)

    const togglePermission = (id) => {
        setPermissions(prev => prev.map(p =>
            p.id === id ? { ...p, checked: !p.checked } : p
        ))
    }

    const selectAllPermissions = () => {
        setPermissions(prev => prev.map(p => ({ ...p, checked: true })))
    }

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.includes(searchTerm)
    )

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Client Portal Access
                    </h1>
                    <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <span>Admin</span>
                        <span className="material-symbols-outlined text-base">chevron_right</span>
                        <span className="text-primary font-medium">Send Invitation</span>
                    </div>
                </div>
                <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-2 rounded-full transition-colors">
                    <span className="material-symbols-outlined">help</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form Section */}
                <div className="lg:col-span-8">
                    <Card className="overflow-hidden p-0">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send New Invitation</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Configure access permissions and send an invite link.</p>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">security</span>
                                Secure Link
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Select Client */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Select Client</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search client by name, ID, or email..."
                                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm font-medium text-slate-900 dark:text-white shadow-sm"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    )}
                                </div>

                                {/* Selected Client Display */}
                                {selectedClient && (
                                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <Avatar alt={selectedClient.name} size="md" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {selectedClient.name}
                                                <span className="text-xs font-normal text-slate-500 ml-1">#{selectedClient.id}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedClient.email} • {selectedClient.caseType}</p>
                                        </div>
                                        <Badge variant="emerald">{selectedClient.status}</Badge>
                                    </div>
                                )}
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Access Permissions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Initial Access Level</label>
                                    <button
                                        onClick={selectAllPermissions}
                                        className="text-xs text-primary font-bold hover:underline"
                                    >
                                        Select All
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {permissions.map(perm => (
                                        <label
                                            key={perm.id}
                                            className="relative flex items-start gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors bg-white dark:bg-slate-800"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={perm.checked}
                                                onChange={() => togglePermission(perm.id)}
                                                className="mt-1 size-4 rounded border-slate-300 text-primary focus:ring-primary bg-slate-100 dark:bg-slate-700 dark:border-slate-600"
                                            />
                                            <div>
                                                <span className="block text-sm font-bold text-slate-900 dark:text-white">{perm.label}</span>
                                                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{perm.description}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            {/* Invitation Method */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">Invitation Method</label>
                                    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg inline-flex">
                                        <button
                                            onClick={() => setInviteMethod('email')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${inviteMethod === 'email'
                                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            Email Invite
                                        </button>
                                        <button
                                            onClick={() => setInviteMethod('link')}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${inviteMethod === 'link'
                                                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white font-bold'
                                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            Generate Link
                                        </button>
                                    </div>
                                </div>

                                {inviteMethod === 'email' && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Subject Line</label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-end">
                                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Message Content</label>
                                                <div className="flex gap-2 mb-1">
                                                    <button className="text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 font-medium">+ Client Name</button>
                                                    <button className="text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-50 font-medium">+ Portal Link</button>
                                                </div>
                                            </div>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="w-full h-32 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                                            />
                                            <p className="text-right text-xs text-slate-400">Preview showing default template</p>
                                        </div>
                                    </div>
                                )}

                                {inviteMethod === 'link' && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                                            Generate a secure link that you can share with your client directly.
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value="https://portal.immigrationpro.com/invite/abc123..."
                                                readOnly
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-500 dark:text-slate-400"
                                            />
                                            <Button variant="outline" icon="content_copy">Copy</Button>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-2">Link expires in 7 days</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="outline">Save Draft</Button>
                            <Button icon="send">Send Invitation</Button>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="flex flex-col items-center justify-center text-center py-4">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">85%</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Acceptance Rate</span>
                        </Card>
                        <Card className="flex flex-col items-center justify-center text-center py-4">
                            <span className="text-2xl font-bold text-amber-500">3</span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Pending Invites</span>
                        </Card>
                    </div>

                    {/* Recent Invitations */}
                    <Card className="overflow-hidden p-0">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Invitations</h3>
                            <button className="text-xs text-primary font-bold hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentInvitations.map(invite => (
                                <div key={invite.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{invite.name}</p>
                                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${invite.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                invite.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
                                            }`}>
                                            <span className="material-symbols-outlined text-[10px]">{statusConfig[invite.status].icon}</span>
                                            {statusConfig[invite.status].label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Sent {invite.date} via {invite.method}</p>
                                        {invite.status !== 'accepted' && (
                                            <button className="text-[10px] font-bold text-primary hover:underline">
                                                {invite.status === 'pending' ? 'Resend' : 'New Link'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">info</span>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">About Permissions</h4>
                                <p className="text-xs text-blue-800/80 dark:text-blue-200/80 mt-1 leading-snug">
                                    Clients can always view their own profile information. Granting "Upload Documents" allows them to add files to active cases only.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
