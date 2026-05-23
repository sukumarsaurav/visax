// Single source of truth for role-keyed behaviour. When you add a new role
// or change its routing, edit one entry here instead of branching in
// AuthContext, Sidebar, ProtectedRoute, etc.
//
// `getDashboardPath(profile)` is the only function — it falls back to
// `dashboardPath` if the role doesn't need conditional routing (e.g. clients
// always land on /client; professionals route through onboarding states).

const PROFESSIONAL_DASHBOARDS = {
    individual:    '/consultant',
    agency_admin:  '/agency',
    agency_member: '/team-member',
}

function professionalRedirect(profile) {
    if (profile.application_status === 'pending_review') {
        return '/professional-submitted'
    }
    const approved = profile.application_status === 'approved' || profile.application_status === 'active'
    if (approved && profile.professional_onboarding_complete === false) {
        return '/professional-approved'
    }
    return PROFESSIONAL_DASHBOARDS[profile.role]
}

export const ROLE_POLICY = {
    client: {
        dashboardPath: '/client',
        portalType:    'client',
    },
    individual: {
        dashboardPath: '/consultant',
        portalType:    'consultant',
        getDashboardPath: professionalRedirect,
    },
    agency_admin: {
        dashboardPath: '/agency',
        portalType:    'consultant',
        consultantType: 'agency_admin',
        getDashboardPath: professionalRedirect,
    },
    agency_member: {
        dashboardPath: '/team-member',
        portalType:    'consultant',
        consultantType: 'agency_member',
    },
    admin: {
        dashboardPath: '/admin',
        portalType:    'admin',
    },
}

/** Profile-aware dashboard redirect. Returns '/' for unknown/missing roles. */
export function getDashboardPath(profile) {
    if (!profile) return '/'
    const policy = ROLE_POLICY[profile.role]
    if (!policy) return '/'
    return policy.getDashboardPath ? policy.getDashboardPath(profile) : policy.dashboardPath
}

/** Static dashboard path keyed by role string (no profile-aware redirects). */
export function getStaticDashboardPath(role) {
    return ROLE_POLICY[role]?.dashboardPath || '/'
}

export function getNotificationsPath(role) {
    const base = ROLE_POLICY[role]?.dashboardPath
    return base ? `${base}/notifications` : '/notifications'
}
