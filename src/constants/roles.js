// Centralised role ↔ dashboard-path mapping
// Used by AuthContext, ProtectedRoute, Header, Sidebar, etc.

export const ROLE_DASHBOARD_PATHS = {
    client: '/client',
    individual: '/consultant',
    agency_admin: '/agency',
    agency_member: '/team-member',
    admin: '/admin',
}

// Allowed-role arrays used in ProtectedRoute
export const CLIENT = ['client']
export const PROFESSIONAL = ['individual', 'agency_admin', 'agency_member']
export const AGENCY_ADMIN = ['agency_admin']
export const AGENCY_STAFF = ['agency_admin', 'agency_member']
export const ADMIN = ['admin']

/**
 * Given a role string, return the base dashboard path
 */
export function getDashboardPathForRole(role) {
    return ROLE_DASHBOARD_PATHS[role] || '/'
}

/**
 * Given a role string, return the notifications path
 */
export function getNotificationsPath(role) {
    const base = ROLE_DASHBOARD_PATHS[role]
    return base ? `${base}/notifications` : '/notifications'
}
