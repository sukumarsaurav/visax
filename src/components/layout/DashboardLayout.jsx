import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'
import { useAuth } from '../../contexts/AuthContext'

const routeTitles = {
    // Client
    '/client': 'Dashboard',
    '/client/cases': 'My Cases',
    '/client/appointments': 'Appointments',
    '/client/invoices': 'Invoices',
    '/client/services': 'Services',
    '/client/wishlist': 'Wishlist',
    '/client/compare': 'Compare Professionals',
    '/client/help-center': 'Help Center',
    '/client/documents': 'Documents',
    // Consultant (individual)
    '/consultant': 'Dashboard',
    '/consultant/appointments': 'Appointments',
    '/consultant/clients': 'Clients',
    '/consultant/cases': 'Cases',
    '/consultant/invite-client': 'Invite Client',
    '/consultant/resources': 'Resource Library',
    '/consultant/messages': 'Messages',
    '/consultant/services': 'Services',
    '/consultant/analytics': 'Analytics',
    '/consultant/availability': 'Availability',
    '/consultant/settings': 'Settings',
    '/consultant/notifications': 'Notifications',
    // Agency admin
    '/agency': 'Dashboard',
    '/agency/team': 'Team Management',
    '/agency/clients': 'Clients',
    '/agency/cases': 'Cases',
    '/agency/invite-client': 'Invite Client',
    '/agency/resources': 'Resources',
    '/agency/appointments': 'Appointments',
    '/agency/messages': 'Messages',
    '/agency/analytics': 'Analytics',
    '/agency/announcements': 'Announcements',
    '/agency/services': 'Services',
    '/agency/availability': 'Team Availability',
    '/agency/settings': 'Settings',
    '/agency/notifications': 'Notifications',
    // Team member
    '/team-member': 'Dashboard',
    '/team-member/clients': 'My Clients',
    '/team-member/cases': 'My Cases',
    '/team-member/appointments': 'Appointments',
    '/team-member/messages': 'Messages',
    '/team-member/availability': 'My Availability',
    '/team-member/resources': 'Resources',
    '/team-member/announcements': 'Announcements',
    '/team-member/settings': 'Settings',
    '/team-member/notifications': 'Notifications',
    // Admin
    '/admin': 'Dashboard',
    '/admin/user-management': 'User Management',
    '/admin/applications': 'Application Review',
    '/admin/audit-log': 'Audit Log',
    '/admin/communication-settings': 'Communication Settings',
    '/admin/content-management': 'Content Management',
    '/admin/announcements': 'Announcements',
    '/admin/localization': 'Localization',
    '/admin/payment-settings': 'Payment Settings',
    '/admin/platform-settings': 'Platform Settings',
    '/admin/marketing': 'Marketing',
    '/admin/referral-program': 'Referral Program',
    '/admin/resources': 'Resource Library',
    '/admin/sales-subscriptions': 'Sales & Subscriptions',
    '/admin/integrations': 'System Integrations',
    '/admin/analytics': 'Analytics',
}

export default function DashboardLayout({ userType = 'client', consultantType = null }) {
    const location = useLocation()
    const { profile } = useAuth()
    const title = routeTitles[location.pathname] || 'Dashboard'

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar userType={userType} consultantType={consultantType} user={profile} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title={title} />

                <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
                    <div className="mx-auto max-w-7xl">
                        <Outlet context={{ consultantType, profile }} />
                    </div>
                </main>
            </div>

            {/* Mobile bottom nav */}
            <MobileNav userType={userType} consultantType={consultantType} />
        </div>
    )
}
