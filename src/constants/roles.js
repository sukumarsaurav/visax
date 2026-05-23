// Role identity helpers + allowed-role arrays used by ProtectedRoute.
// Dashboard-path / portal-type logic moved to rolePolicy.js — re-exported
// here for backward compatibility with existing imports.

import { ROLE_POLICY, getStaticDashboardPath, getNotificationsPath } from './rolePolicy'

// Allowed-role arrays for ProtectedRoute.
export const CLIENT = ['client']
export const PROFESSIONAL = ['individual', 'agency_admin', 'agency_member']
export const AGENCY_ADMIN = ['agency_admin']
export const AGENCY_STAFF = ['agency_admin', 'agency_member']
export const ADMIN = ['admin']

/** Static role → dashboard-path map (no profile-aware redirects). */
export const ROLE_DASHBOARD_PATHS = Object.fromEntries(
    Object.entries(ROLE_POLICY).map(([role, p]) => [role, p.dashboardPath])
)

/** @deprecated use getStaticDashboardPath from constants/rolePolicy */
export function getDashboardPathForRole(role) {
    return getStaticDashboardPath(role)
}

export { getNotificationsPath }

/**
 * True when the role provides consulting services (any flavour).
 * Use this instead of inlining `role === 'individual' || ...`.
 */
export function isConsultantRole(role) {
    return PROFESSIONAL.includes(role)
}

/** True when the role is a client (visa applicant). */
export function isClientRole(role) {
    return role === 'client'
}
