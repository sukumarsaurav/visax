/**
 * Plan limit constants — single source of truth shared by the
 * usePlanLimits hook, UI components, and the DB migration
 * (014_plan_limits.sql mirrors these values in a PL/pgSQL helper).
 *
 * null = unlimited / not applicable for that plan.
 */
export const PLAN_LIMITS = {
    solo_basic:        { name: 'Solo Basic',       maxCases: 10,  maxClients: 10,  maxMembers: null },
    solo_pro:          { name: 'Solo Pro',          maxCases: 30,  maxClients: 30,  maxMembers: null },
    agency_starter:    { name: 'Agency Starter',    maxCases: 50,  maxClients: 50,  maxMembers: 3    },
    agency_growth:     { name: 'Agency Growth',     maxCases: 200, maxClients: 200, maxMembers: 10   },
    agency_enterprise: { name: 'Agency Enterprise', maxCases: null, maxClients: null, maxMembers: null },
}

/** Returns the limit object for a plan ID, defaulting to solo_basic. */
export function getPlanLimits(planId) {
    return PLAN_LIMITS[planId] ?? PLAN_LIMITS.solo_basic
}

/**
 * Human-readable limit: converts null → '∞', numbers → locale string.
 * e.g. formatLimit(200) → '200', formatLimit(null) → '∞'
 */
export function formatLimit(value) {
    return value === null ? '∞' : value.toLocaleString()
}

/**
 * Returns an upgrade plan ID for the given plan, or null if already
 * on the top tier. Used in upgrade prompts.
 */
export function getNextPlan(planId) {
    const order = ['solo_basic', 'solo_pro', 'agency_starter', 'agency_growth', 'agency_enterprise']
    const idx = order.indexOf(planId)
    if (idx === -1 || idx === order.length - 1) return null
    return order[idx + 1]
}
