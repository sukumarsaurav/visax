// Unified navigation configuration for all user roles
// All brand references use Immizy

export const navItems = {
    client: [
        { label: 'Dashboard',    icon: 'dashboard',        path: '/client' },
        { label: 'My Cases',     icon: 'work',             path: '/client/cases' },
        { label: 'Appointments', icon: 'calendar_month',   path: '/client/appointments' },
        { label: 'Services',     icon: 'design_services',  path: '/client/services' },
        { label: 'Invoices',     icon: 'receipt_long',     path: '/client/invoices' },
        { label: 'Documents',    icon: 'folder_open',      path: '/client/documents' },
        { label: 'Wishlist',     icon: 'favorite',         path: '/client/wishlist' },
        { label: 'Compare',      icon: 'compare',          path: '/client/compare' },
        { label: 'Help Center',  icon: 'help',             path: '/client/help-center' },
    ],

    individual: [
        { label: 'Dashboard',    icon: 'grid_view',        path: '/consultant' },
        { label: 'Cases',        icon: 'folder_shared',    path: '/consultant/cases' },
        { label: 'Clients',      icon: 'group',            path: '/consultant/clients' },
        { label: 'Appointments', icon: 'calendar_month',   path: '/consultant/appointments' },
        { label: 'Messages',     icon: 'chat_bubble',      path: '/consultant/messages', badge: true },
        { label: 'Availability', icon: 'schedule',         path: '/consultant/availability' },
        { label: 'Services',     icon: 'design_services',  path: '/consultant/services' },
        { label: 'Resources',    icon: 'library_books',    path: '/consultant/resources' },
        { label: 'Analytics',    icon: 'analytics',        path: '/consultant/analytics' },
        { label: 'Settings',     icon: 'settings',         path: '/consultant/settings' },
    ],

    agency_admin: [
        { label: 'Dashboard',        icon: 'grid_view',      path: '/agency' },
        { label: 'Team',             icon: 'groups',         path: '/agency/team' },
        { label: 'Cases',            icon: 'folder_shared',  path: '/agency/cases' },
        { label: 'Clients',          icon: 'group',          path: '/agency/clients' },
        { label: 'Appointments',     icon: 'calendar_month', path: '/agency/appointments' },
        { label: 'Messages',         icon: 'chat_bubble',    path: '/agency/messages', badge: true },
        { label: 'Team Availability',icon: 'schedule',       path: '/agency/availability' },
        { label: 'Announcements',    icon: 'campaign',       path: '/agency/announcements' },
        { label: 'Services',         icon: 'design_services',path: '/agency/services' },
        { label: 'Resources',        icon: 'library_books',  path: '/agency/resources' },
        { label: 'Analytics',        icon: 'analytics',      path: '/agency/analytics' },
        { label: 'Settings',         icon: 'settings',       path: '/agency/settings' },
    ],

    agency_member: [
        { label: 'Dashboard',    icon: 'grid_view',        path: '/team-member' },
        { label: 'My Cases',     icon: 'folder_shared',    path: '/team-member/cases' },
        { label: 'My Clients',   icon: 'group',            path: '/team-member/clients' },
        { label: 'Appointments', icon: 'calendar_month',   path: '/team-member/appointments' },
        { label: 'Messages',     icon: 'chat_bubble',      path: '/team-member/messages', badge: true },
        { label: 'Availability', icon: 'schedule',         path: '/team-member/availability' },
        { label: 'Announcements',icon: 'campaign',         path: '/team-member/announcements' },
        { label: 'Resources',    icon: 'library_books',    path: '/team-member/resources' },
        { label: 'Settings',     icon: 'settings',         path: '/team-member/settings' },
    ],

    admin: [
        { label: 'Dashboard',    icon: 'dashboard',        path: '/admin' },
        { group: 'Users & Access', items: [
            { label: 'Users',        icon: 'manage_accounts',  path: '/admin/user-management' },
            { label: 'Applications', icon: 'description',      path: '/admin/applications', badgeCount: 0 },
            { label: 'Unclaimed',    icon: 'person_add',       path: '/admin/unclaimed-profiles' },
            { label: 'Audit Log',    icon: 'verified_user',    path: '/admin/audit-log' },
        ]},
        { group: 'Content & Comms', items: [
            { label: 'Announcements',icon: 'campaign',         path: '/admin/announcements' },
            { label: 'Resources',    icon: 'library_books',    path: '/admin/resources' },
        ]},
        { group: 'Revenue', items: [
            { label: 'Analytics',    icon: 'analytics',        path: '/admin/analytics' },
            { label: 'Sales & Subs', icon: 'payments',         path: '/admin/sales-subscriptions' },
            { label: 'Marketing',    icon: 'campaign',         path: '/admin/marketing' },
            { label: 'Payments',     icon: 'credit_card',      path: '/admin/payment-settings' },
        ]},
        { group: 'System', items: [
            { label: 'Integrations', icon: 'extension',        path: '/admin/integrations' },
            { label: 'Settings',     icon: 'settings',         path: '/admin/platform-settings' },
        ]},
    ],
}
