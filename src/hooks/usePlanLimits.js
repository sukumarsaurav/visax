import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getPlanLimits } from '../lib/planLimits'

/**
 * Reads the current user's plan_id, fetches live usage counts, and
 * returns limit + usage + canAdd helpers.
 *
 * Return shape:
 *   planId          – e.g. 'solo_basic'
 *   planName        – e.g. 'Solo Basic'
 *   limits          – { maxCases, maxClients, maxMembers } (null = unlimited)
 *   usage           – { cases, clients, members }
 *   usageLoading    – true while the usage counts are being fetched
 *   canAddCase      – false when usage.cases >= limits.maxCases
 *   canAddClient    – false when usage.clients >= limits.maxClients
 *   canAddMember    – false when usage.members >= limits.maxMembers
 *   refetchUsage()  – call after a create/delete to sync counts
 */
export function usePlanLimits() {
    const { profile } = useAuth()
    const planId = profile?.plan_id || 'solo_basic'
    const limits = getPlanLimits(planId)

    const [usage, setUsage] = useState({ cases: 0, clients: 0, members: 0 })
    const [usageLoading, setUsageLoading] = useState(true)

    const fetchUsage = useCallback(async () => {
        if (!profile?.id) return
        setUsageLoading(true)

        // Cases and client invitations can be counted in parallel.
        const [casesRes, clientsRes] = await Promise.all([
            supabase
                .from('cases')
                .select('id', { count: 'exact', head: true })
                .eq('consultant_id', profile.id),
            supabase
                .from('client_invitations')
                .select('id', { count: 'exact', head: true })
                .eq('consultant_id', profile.id)
                .in('status', ['pending', 'accepted']),
        ])

        // Member count needs the agency_id first (agencies table → profile.id owner).
        let membersCount = 0
        if (profile.role === 'agency_admin') {
            const { data: agencyRow } = await supabase
                .from('agencies')
                .select('id')
                .eq('owner_id', profile.id)
                .single()

            if (agencyRow?.id) {
                const { count } = await supabase
                    .from('agency_members')
                    .select('id', { count: 'exact', head: true })
                    .eq('agency_id', agencyRow.id)
                    .neq('status', 'inactive')
                membersCount = count || 0
            }
        }

        setUsage({
            cases:   casesRes.count   || 0,
            clients: clientsRes.count || 0,
            members: membersCount,
        })
        setUsageLoading(false)
    }, [profile?.id, profile?.role])

    useEffect(() => { fetchUsage() }, [fetchUsage])

    return {
        planId,
        planName: limits.name,
        limits,
        usage,
        usageLoading,
        refetchUsage: fetchUsage,
        canAddCase:   limits.maxCases   === null || usage.cases   < limits.maxCases,
        canAddClient: limits.maxClients === null || usage.clients < limits.maxClients,
        canAddMember: limits.maxMembers === null || usage.members < limits.maxMembers,
    }
}
