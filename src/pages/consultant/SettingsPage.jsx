import { useState } from 'react'
import Button from '../../components/ui/Button'

const settingsTabs = [
    { id: 'profile', label: 'Profile Management', icon: 'person' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'security', label: 'Security & Privacy', icon: 'lock' },
    { id: 'billing', label: 'Billing & Payments', icon: 'credit_card' },
    { id: 'language', label: 'Language & Region', icon: 'language' },
    { id: 'danger', label: 'Account Actions', icon: 'warning' }
]

const billingHistory = [
    { id: 'INV-2023-001', date: 'Oct 24, 2023', amount: '$299.00', status: 'Paid' },
    { id: 'INV-2023-002', date: 'Sep 24, 2023', amount: '$299.00', status: 'Paid' }
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile')

    // Profile state
    const [profile, setProfile] = useState({
        firstName: 'Elena',
        lastName: 'Rodriguez',
        email: 'elena.r@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Immigration attorney with 10+ years of experience helping families navigate complex visa processes.',
        companyName: 'Rodriguez Legal Group',
        licenseNumber: 'BAR-9821-NY'
    })

    // Notification preferences
    const [notifications, setNotifications] = useState({
        caseUpdatesEmail: true,
        caseUpdatesPush: true,
        messagesEmail: true,
        messagesPush: false,
        marketingEmail: false
    })

    // Language settings
    const [language, setLanguage] = useState('English (US)')
    const [timezone, setTimezone] = useState('(GMT-05:00) Eastern Time (US & Canada)')

    const scrollToSection = (sectionId) => {
        setActiveTab(sectionId)
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="flex gap-8 min-h-[calc(100vh-8rem)] -m-4 lg:-m-8">
            {/* Settings Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sticky top-0 h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex flex-col gap-6">
                    {/* Account Section */}
                    <div>
                        <h3 className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                            Account
                        </h3>
                        <nav className="flex flex-col gap-1">
                            {settingsTabs.slice(0, 4).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => scrollToSection(tab.id)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors text-left ${activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Preferences Section */}
                    <div>
                        <h3 className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                            Preferences
                        </h3>
                        <nav className="flex flex-col gap-1">
                            {settingsTabs.slice(4).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => scrollToSection(tab.id)}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors text-left ${activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Sign Out */}
                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Manage your profile, preferences, and account security.
                        </p>
                    </div>

                    {/* Profile Section */}
                    <section id="profile" className="scroll-mt-24">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Management</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Update your photo and personal details.</p>
                            </div>
                            <div className="p-6">
                                {/* Avatar Row */}
                                <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center">
                                    <div
                                        className="size-24 rounded-full bg-cover bg-center ring-4 ring-slate-100 dark:ring-slate-800"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCTRd_kvJjSwDOnoAItw3nN4fQrlqjoBd1kHWFsqVzpPXq-Y3cXcChkOTLGvOrXSM3TpbfV3KDoCj-Kut_ons4o1EYxIcTP7u_1U3uuRZlvmIQEeEdyshnYNaqT_qmbq1efBA1R5gTEbwukNJGJBJnt2ay0p0pABXwyo90mX52MJkqnRNc2zv2rilbA-sif18N3XFS7DPAjsj80uP_I-UY-ygHN6wjkbVdSchTFV6ogsna-sT8EJnACxGr6XkUkWirWwp3Wh1n68X0')" }}
                                    ></div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-3">
                                            <Button>Change Avatar</Button>
                                            <Button variant="secondary">Delete</Button>
                                        </div>
                                        <p className="text-xs text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                                    </div>
                                </div>

                                {/* Inputs Grid */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">First Name</span>
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Last Name</span>
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Email Address</span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">mail</span>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                            />
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Phone Number</span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">call</span>
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                            />
                                        </div>
                                    </label>
                                    <label className="col-span-1 md:col-span-2 block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Bio</span>
                                        <textarea
                                            rows={3}
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Business Details */}
                            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6">
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Business Details</h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Agency / Company Name</span>
                                        <input
                                            type="text"
                                            value={profile.companyName}
                                            onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">License Number</span>
                                        <input
                                            type="text"
                                            value={profile.licenseNumber}
                                            onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                                            className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-6 py-4">
                                <button className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">
                                    Cancel
                                </button>
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    </section>

                    {/* Notifications Section */}
                    <section id="notifications" className="scroll-mt-24">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Choose how you want to be notified.</p>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {/* Case Updates */}
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">Case Updates</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">Receive updates when your case status changes.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.caseUpdatesEmail}
                                                onChange={(e) => setNotifications({ ...notifications, caseUpdatesEmail: e.target.checked })}
                                                className="form-checkbox h-5 w-5 rounded text-primary border-slate-300 focus:ring-primary"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Email</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.caseUpdatesPush}
                                                onChange={(e) => setNotifications({ ...notifications, caseUpdatesPush: e.target.checked })}
                                                className="form-checkbox h-5 w-5 rounded text-primary border-slate-300 focus:ring-primary"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Push</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">Messages</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">Notifications for new messages from clients.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.messagesEmail}
                                                onChange={(e) => setNotifications({ ...notifications, messagesEmail: e.target.checked })}
                                                className="form-checkbox h-5 w-5 rounded text-primary border-slate-300 focus:ring-primary"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Email</span>
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.messagesPush}
                                                onChange={(e) => setNotifications({ ...notifications, messagesPush: e.target.checked })}
                                                className="form-checkbox h-5 w-5 rounded text-primary border-slate-300 focus:ring-primary"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Push</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Marketing */}
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">Marketing & Newsletter</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">Tips, news, and updates from ImmigraLink.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.marketingEmail}
                                                onChange={(e) => setNotifications({ ...notifications, marketingEmail: e.target.checked })}
                                                className="form-checkbox h-5 w-5 rounded text-primary border-slate-300 focus:ring-primary"
                                            />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Email</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Security Section */}
                    <section id="security" className="scroll-mt-24">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Privacy</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and security settings.</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">Password</p>
                                        <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                                    </div>
                                    <Button variant="secondary">Change Password</Button>
                                </div>
                                <hr className="border-slate-200 dark:border-slate-800" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">Two-Factor Authentication</p>
                                        <p className="text-sm text-slate-500">Add an extra layer of security to your account.</p>
                                    </div>
                                    <Button variant="secondary">Enable 2FA</Button>
                                </div>
                                <hr className="border-slate-200 dark:border-slate-800" />
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-slate-200">Active Sessions</p>
                                        <p className="text-sm text-slate-500">Manage devices where you're logged in.</p>
                                    </div>
                                    <Button variant="secondary">View Sessions</Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Billing Section */}
                    <section id="billing" className="scroll-mt-24">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Billing & Payments</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your payment methods and billing history.</p>
                                </div>
                                <button className="text-sm font-semibold text-primary hover:text-blue-700">Add Payment Method</button>
                            </div>
                            <div className="p-6">
                                {/* Payment Cards */}
                                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-5">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex h-10 w-16 items-center justify-center rounded bg-white dark:bg-black/20">
                                                <span className="font-bold italic text-blue-800 dark:text-blue-400">VISA</span>
                                            </div>
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Default</span>
                                        </div>
                                        <p className="mb-1 text-lg font-bold text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>Expires 12/25</span>
                                            <button className="font-medium text-primary hover:underline">Edit</button>
                                        </div>
                                    </div>
                                    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 opacity-70 hover:opacity-100 transition-opacity">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="flex h-10 w-16 items-center justify-center rounded bg-slate-100 dark:bg-slate-800">
                                                <div className="flex -space-x-3">
                                                    <div className="size-6 rounded-full bg-red-500/80"></div>
                                                    <div className="size-6 rounded-full bg-yellow-500/80"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mb-1 text-lg font-bold text-slate-900 dark:text-white">•••• •••• •••• 8899</p>
                                        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>Expires 09/24</span>
                                            <button className="font-medium text-primary hover:underline">Edit</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing History */}
                                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">Billing History</h3>
                                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Invoice</th>
                                                <th className="px-4 py-3 font-medium">Date</th>
                                                <th className="px-4 py-3 font-medium">Amount</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                                            {billingHistory.map((invoice) => (
                                                <tr key={invoice.id}>
                                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{invoice.id}</td>
                                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{invoice.date}</td>
                                                    <td className="px-4 py-3 text-slate-900 dark:text-slate-200">{invoice.amount}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="text-slate-400 hover:text-primary">
                                                            <span className="material-symbols-outlined text-[20px]">download</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Language Section */}
                    <section id="language" className="scroll-mt-24">
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Language & Region</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Customize your regional settings.</p>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Language</span>
                                    <div className="relative">
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full appearance-none rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        >
                                            <option>English (US)</option>
                                            <option>Spanish (Español)</option>
                                            <option>French (Français)</option>
                                            <option>Mandarin (中文)</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">Time Zone</span>
                                    <div className="relative">
                                        <select
                                            value={timezone}
                                            onChange={(e) => setTimezone(e.target.value)}
                                            className="w-full appearance-none rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:border-primary focus:ring-primary"
                                        >
                                            <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                                            <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                                            <option>(GMT+00:00) London</option>
                                            <option>(GMT+05:30) India Standard Time</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section id="danger" className="scroll-mt-24">
                        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 overflow-hidden">
                            <div className="px-6 py-4">
                                <h2 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h2>
                                <p className="text-sm text-red-600/80 dark:text-red-400/70">Irreversible actions for your account.</p>
                            </div>
                            <div className="border-t border-red-200 dark:border-red-900/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-red-200">Deactivate Account</p>
                                    <p className="text-sm text-slate-500 dark:text-red-300/60">Hide your profile and data temporarily.</p>
                                </div>
                                <button className="whitespace-nowrap rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/40 transition-colors">
                                    Deactivate
                                </button>
                            </div>
                            <div className="border-t border-red-200 dark:border-red-900/30 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-red-200">Delete Account</p>
                                    <p className="text-sm text-slate-500 dark:text-red-300/60">Permanently delete your account and all data.</p>
                                </div>
                                <button className="whitespace-nowrap rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
