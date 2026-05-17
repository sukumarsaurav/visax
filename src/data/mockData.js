// Mock data for the Immigration Marketplace

export const currentUser = {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6pMwSLOzTsSFH7IMxYew2rvuj-bv03g6DnCYbnkiWIepW-NVLHY6GGcSV27aNlOea2JhEdN2oWm51Ox-KqLDwMYt8RGBCT0g6Zu56Kk4IOJZMGRnAZUoLAbyi5FeMcMdwVOYXTmzzuTSokfw-sI-bg9fgOLLxiWa73v-xEiTB1OqxwZps1JMwUxrgdWiC384_PYqaio3Q5SFOrW_ER8JRhhSl944PkYQOWYecA37XwoSCGgIybYDWnHTxNgTqSSCf1xnJsgLJPFY",
    role: "client"
};

export const consultants = [
    {
        id: 1,
        name: "Elena Rodriguez",
        title: "Immigration Attorney",
        rating: 4.9,
        reviews: 120,
        hourlyRate: 150,
        verified: true,
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsCW7sU5ce60gnVGSiVRrXnO3-lrWT1DRHOOxUwpHNxj7xjofBe6xF9tBVEDStMTlfgAXanBQFmBY-Y09_2qQ04wF4yW-vMWmdUYJfujrllg7zIuMAyUsWgOnFok2DNAOA_Fi82VV09i05CY3TlRobx2Ju9t5-xIkgwEPhrgvRVOWSHg-vsIZcna4GhzIqqARBLtXVCjy4YUaeb13Sr2pLsZKde9jBtOq15gtcW2jRR0MbyQEf3N2MiG4j8X5DRQMM-8GMUgCFW00"
    },
    {
        id: 2,
        name: "Atty. Jane Doe",
        title: "Senior Immigration Lawyer",
        rating: 4.8,
        reviews: 95,
        hourlyRate: 175,
        verified: true,
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6pMwSLOzTsSFH7IMxYew2rvuj-bv03g6DnCYbnkiWIepW-NVLHY6GGcSV27aNlOea2JhEdN2oWm51Ox-KqLDwMYt8RGBCT0g6Zu56Kk4IOJZMGRnAZUoLAbyi5FeMcMdwVOYXTmzzuTSokfw-sI-bg9fgOLLxiWa73v-xEiTB1OqxwZps1JMwUxrgdWiC384_PYqaio3Q5SFOrW_ER8JRhhSl944PkYQOWYecA37XwoSCGgIybYDWnHTxNgTqSSCf1xnJsgLJPFY"
    }
];

export const cases = [
    {
        id: "HB-2023-884",
        title: "H1-B Visa Application",
        status: "Under Review",
        progress: 75,
        updates: 2,
        icon: "description",
        statusColor: "blue"
    },
    {
        id: "GC-2023-102",
        title: "Green Card Sponsorship",
        status: "Action Required",
        progress: 25,
        updates: 0,
        message: "Document missing",
        icon: "folder_shared",
        statusColor: "orange"
    }
];

export const appointments = [
    {
        id: 1,
        title: "Consultation with Atty. J. Doe",
        date: "Oct 24, 2023",
        time: "10:00 AM",
        type: "Video",
        platform: "Zoom Meeting",
        icon: "videocam",
        canJoin: true
    },
    {
        id: 2,
        title: "Document Review Call",
        date: "Nov 02, 2023",
        time: "2:00 PM",
        type: "Phone",
        platform: "Phone",
        icon: "call",
        canJoin: false
    }
];

export const invoices = [
    {
        id: "INV-0023",
        dueDate: "Due Oct 25",
        amount: 500.00,
        status: "pending",
        icon: "attach_money"
    },
    {
        id: "INV-0021",
        dueDate: "Paid Oct 10",
        amount: 250.00,
        status: "paid",
        icon: "check"
    },
    {
        id: "INV-0019",
        dueDate: "Paid Sep 28",
        amount: 1200.00,
        status: "paid",
        icon: "check"
    }
];

export const clientStats = {
    activeCases: 2,
    pendingTasks: 4,
    nextAppointment: "Oct 24"
};

export const consultantStats = {
    totalClients: 24,
    pendingApplications: 8,
    upcomingMeetings: 5,
    unreadMessages: 3
};

export const adminStats = {
    totalRevenue: "$124,500",
    revenueGrowth: 12,
    activeSubscriptions: 842,
    subscriptionGrowth: 5,
    totalUsers: 3402,
    userGrowth: 3,
    pendingApplications: 14
};

export const clientCases = [
    {
        id: "C-1024",
        clientName: "Sarah Jenkins",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNEDi66eGzRJ4XdbSb5a3HA2J9t6UGn-vEqcA1wLAsBPoRYooBwozyCyiA-eHrygeQMRcf0akhdQmiiyjCYntidLRrfW3qI4P75FvDHXL2N7TsU4cPJrG9TWVhpkZh0FDiip7I4DkVXSa1acRdy2zIl1FA0CBuIjbw7Vgx0SE7TdMdE7L078lBkqEWrfV1i6v0jXleRSbF5YdXpO18UGg63kVHR5RsMOg9EIrOmiXYCran8jld4ZIDwmeJywWTLfQDhp15p4v5QVo",
        visaType: "Student Visa (Study Permit)",
        country: "Canada",
        countryFlag: "🇨🇦",
        status: "In Progress",
        statusColor: "blue"
    },
    {
        id: "C-1025",
        clientName: "Michael Chen",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlAnchK3o6PZQArYdvZx9g4f21B3-qKwWvx99pxzfCYv196c50YJ1oCNLxIegLuMX-9WZF2LEjG-A0YGkajn5BhRPLjAYlD0N_O_volsg87sNjEdfcIjD8PqkpGks4fDHHR6Rfxl5ttopxAcbCZ6rmnyoaXcfnQ-msnGoyE70AetScJYNiLJ2eunPjy_CsG510CJvS6orNSA0BpKC2_T0lsRqc4HaT_qY_Gpc5b5VIikDfqW5FOzmrBUTH9oiKfqtrF2L5ckMG8u4",
        visaType: "Skilled Worker Visa",
        country: "UK",
        countryFlag: "🇬🇧",
        status: "Docs Pending",
        statusColor: "amber"
    },
    {
        id: "C-1030",
        clientName: "David Smith",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDknjbKrqVgKLMzErVgV8hOgKRvUKE0UTjzC2QydgRXonWVQg86bmcOZ8w95IFKgWtH8KvtaNShQwj--d2AoFe5vlR9GbU8VmDAEEwLu6r576pInRdVxetouQ7L7YGNot1yqL_9xxtq4ipyl4sB8zuJ-KjzlMC9GYQWBmZn0liUblk9NM-AHnWjRSyspn8Euibtb3ogXdSITXBjIz5M2HxLF-OWIHw9vl7XYgeC38doDHA_MttbP90u22OmHj3aHkvDpBRRNPbh3PM",
        visaType: "Family Sponsorship",
        country: "Australia",
        countryFlag: "🇦🇺",
        status: "Approved",
        statusColor: "emerald"
    }
];

// Consultant Types
export const consultantTypes = {
    INDIVIDUAL: 'individual',
    AGENCY_ADMIN: 'agency_admin',
    AGENCY_MEMBER: 'agency_member'
};

// Team Members for Agency
export const teamMembers = [
    {
        id: 1,
        name: 'Sarah Jenkins',
        email: 'sarah.j@agency.com',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzflGvDX8UjjvIaUg2ieWAgrhMeXmgQGHMSHA-HX9WWfEs6RQay_xLw73vNyl4soKwuYNIwYlX_HUeK3viC58rbmHxMIuNOuTsttvd_j7vCIY8TY7r7E00dZQdSRgW9SMpX6y5qsSj8UlSOyJL4s6VsXvLJYvGa5Wz7naHLC7dVx0KlqKP2IvYfRHPgRFL27sPz0LAH1V5zNUILgr6uHWzx05RyjHgZ54KrRNx7NsBFC-XVe3WUd9-AvK5uz42EH9-gRBrJHdj148',
        role: 'Senior Consultant',
        specialty: 'Immigration Law',
        status: 'active',
        availability: 'available',
        activeCases: 12,
        completedCases: 45
    },
    {
        id: 2,
        name: 'Michael Chen',
        email: 'm.chen@agency.com',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvynNWB7WI6w_7_8Qg_RUwa7ovfhsg42wx4Mh5m5ejPjolE3XsHDZtzx6FznYUj0eF6bvKdswyVU0e30LbrixCt2uGQeT-y3FqSykuDEGEQImf956AQ7kXPtqc5jy-rYLNGQF1jpoZVdjDGD84SEHRi15rSpRtiVicZ498Wr0F6-s_rZvqiEWb0obKd1RluSuovkt7Jgos7R7RBnLaB94V6GZ77UBfBss9hVJzV2HKZLdgk-o37yO_hz21hy0YIl9L_UKkdTyIkAw',
        role: 'Case Manager',
        specialty: 'Visa Processing',
        status: 'active',
        availability: 'in_meeting',
        activeCases: 8,
        completedCases: 32
    },
    {
        id: 3,
        name: 'Robert Fox',
        email: 'robert.fox@gmail.com',
        avatar: null,
        initials: 'RF',
        role: 'Junior Consultant',
        specialty: 'General Inquiry',
        status: 'pending',
        availability: null,
        activeCases: 0,
        completedCases: 0
    },
    {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.d@agency.com',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8LuJUxyr8qo2r9ZiBROILrAwBZ14k9Qz5bOS96mI9OkKYbU0w2lawt4M4II5imCzjQSZvB07X270_uA-tvXom5WIN_xXbp1OYJBVNoU5U0PWs4ezP7kQKE8ykuWwIkhx7fkSZIAVQcLQmCF_ukwp35VJVEQGMTvFhgZR6kaXRsmoJlMglGkvv0ePaan4JnDRJjdrueBy8thBsJenhxa06cHya2ADLwwyLCHuqVbntfeEjmL1fYk4LdC_lLwU39UQa4wnJCMWZD5Q',
        role: 'Paralegal',
        specialty: 'Documentation',
        status: 'away',
        availability: 'on_leave',
        activeCases: 5,
        completedCases: 28
    }
];

// Agency Statistics
export const agencyStats = {
    totalMembers: 12,
    activeMembers: 10,
    activeCases: 45,
    pendingInvites: 2,
    monthlyRevenue: 45000,
    revenueGrowth: 15,
    teamPerformance: 87,
    casesThisWeek: 5
};

// Team Schedule
export const teamSchedule = [
    {
        id: 1,
        time: '09:00',
        period: 'AM',
        title: 'Daily Standup',
        description: 'All Members • Zoom',
        type: 'meeting',
        color: 'slate'
    },
    {
        id: 2,
        time: '11:30',
        period: 'AM',
        title: 'Client Onboarding',
        description: 'Michael Chen • Room A',
        type: 'onboarding',
        color: 'purple'
    },
    {
        id: 3,
        time: '02:00',
        period: 'PM',
        title: 'Case Review: H-1B',
        description: 'Sarah Jenkins • Room B',
        type: 'review',
        color: 'emerald'
    }
];

// Agency Announcements
export const agencyAnnouncements = [
    {
        id: 1,
        title: 'New Immigration Policy Update',
        content: 'Please review the updated H-1B processing guidelines effective from next month.',
        author: 'Alex Morgan',
        date: '2 hours ago',
        priority: 'high',
        icon: 'policy'
    },
    {
        id: 2,
        title: 'Team Meeting - Friday 3PM',
        content: 'Mandatory team meeting to discuss Q4 targets and new client acquisitions.',
        author: 'Alex Morgan',
        date: '1 day ago',
        priority: 'normal',
        icon: 'groups'
    },
    {
        id: 3,
        title: 'Holiday Schedule',
        content: 'Office will be closed from Dec 24-26. Please plan your cases accordingly.',
        author: 'HR Department',
        date: '3 days ago',
        priority: 'low',
        icon: 'event'
    }
];

export const navItems = {
    client: [
        { label: "Dashboard", icon: "dashboard", path: "/client" },
        { label: "My Cases", icon: "work", path: "/client/cases" },
        { label: "Appointments", icon: "calendar_month", path: "/client/appointments" },
        { label: "Services", icon: "design_services", path: "/client/services" },
        { label: "Invoices", icon: "receipt_long", path: "/client/invoices" },
        { label: "Wishlist", icon: "favorite", path: "/client/wishlist" },
        { label: "Compare", icon: "compare", path: "/client/compare" },
        { label: "Help Center", icon: "help", path: "/client/help-center" }
    ],
    consultant: [
        { label: "Dashboard", icon: "grid_view", path: "/consultant" },
        { label: "Appointments", icon: "calendar_month", path: "/consultant/appointments" },
        { label: "Clients", icon: "group", path: "/consultant/clients" },
        { label: "Messages", icon: "chat_bubble", path: "/consultant/messages", badge: true },
        { label: "Services", icon: "design_services", path: "/consultant/services" },
        { label: "Settings", icon: "settings", path: "/consultant/settings" }
    ],
    // Individual Professional - same as consultant
    individual: [
        { label: "Dashboard", icon: "grid_view", path: "/consultant" },
        { label: "Cases", icon: "folder_shared", path: "/consultant/cases" },
        { label: "Clients", icon: "group", path: "/consultant/clients" },
        { label: "Appointments", icon: "calendar_month", path: "/consultant/appointments" },
        { label: "Messages", icon: "chat_bubble", path: "/consultant/messages", badge: true },
        { label: "Availability", icon: "schedule", path: "/consultant/availability" },
        { label: "Resources", icon: "library_books", path: "/consultant/resources" },
        { label: "Services", icon: "design_services", path: "/consultant/services" },
        { label: "Analytics", icon: "analytics", path: "/consultant/analytics" },
        { label: "Settings", icon: "settings", path: "/consultant/settings" }
    ],
    // Agency Admin - additional team management features
    agency_admin: [
        { label: "Dashboard", icon: "grid_view", path: "/agency" },
        { label: "Team", icon: "groups", path: "/agency/team" },
        { label: "Cases", icon: "folder_shared", path: "/agency/cases" },
        { label: "Clients", icon: "group", path: "/agency/clients" },
        { label: "Appointments", icon: "calendar_month", path: "/agency/appointments" },
        { label: "Messages", icon: "chat_bubble", path: "/agency/messages", badge: true },
        { label: "Team Availability", icon: "schedule", path: "/agency/availability" },
        { label: "Resources", icon: "library_books", path: "/agency/resources" },
        { label: "Analytics", icon: "analytics", path: "/agency/analytics" },
        { label: "Announcements", icon: "campaign", path: "/agency/announcements" },
        { label: "Services", icon: "design_services", path: "/agency/services" },
        { label: "Settings", icon: "settings", path: "/agency/settings" }
    ],
    // Agency Team Member - sees announcements, limited management
    agency_member: [
        { label: "Dashboard", icon: "grid_view", path: "/team-member" },
        { label: "My Cases", icon: "folder_shared", path: "/team-member/cases" },
        { label: "My Clients", icon: "group", path: "/team-member/clients" },
        { label: "Appointments", icon: "calendar_month", path: "/team-member/appointments" },
        { label: "Messages", icon: "chat_bubble", path: "/team-member/messages", badge: true },
        { label: "My Availability", icon: "schedule", path: "/team-member/availability" },
        { label: "Resources", icon: "library_books", path: "/team-member/resources" },
        { label: "Announcements", icon: "campaign", path: "/team-member/announcements" },
        { label: "Settings", icon: "settings", path: "/team-member/settings" }
    ],
    admin: [
        { label: "Dashboard", icon: "dashboard", path: "/admin" },
        { label: "User Management", icon: "manage_accounts", path: "/admin/user-management" },
        { label: "Applications", icon: "description", path: "/admin/applications", badgeCount: 14 },
        { label: "Sales & Subs", icon: "payments", path: "/admin/sales-subscriptions" },
        { label: "Marketing", icon: "campaign", path: "/admin/marketing" },
        { label: "Resources", icon: "library_books", path: "/admin/resources" },
        { label: "Integrations", icon: "extension", path: "/admin/integrations" },
        { label: "Audit Log", icon: "verified_user", path: "/admin/audit-log" },
        { label: "Communication", icon: "mail", path: "/admin/communication-settings" },
        { label: "Announcements", icon: "campaign", path: "/admin/announcements" },
        { label: "Localization", icon: "language", path: "/admin/localization" },
        { label: "Payments", icon: "credit_card", path: "/admin/payment-settings" },
        { label: "Settings", icon: "settings", path: "/admin/platform-settings" }
    ]
};
