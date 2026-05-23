import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useResource } from './useResource'
import * as appointmentsRepo from '../data/appointmentsRepo'

/**
 * Paginated appointment list scoped by the caller's role.
 * Adds an `upcoming` slice (future + status='upcoming') for dashboards.
 */
export function useAppointments({ limit } = {}) {
    const { user, profile } = useAuth()
    const role = profile?.role
    const userId = user?.id

    const resource = useResource(
        ({ page, pageSize, includeCount }) =>
            appointmentsRepo.list({ role, userId, page, pageSize: limit || pageSize, includeCount }),
        [userId, role]
    )

    async function createAppointment(apptData) {
        const { data, error } = await appointmentsRepo.create(apptData)
        if (!error) {
            resource.setData(prev => [data, ...prev])
            resource.setTotalCount(c => c + 1)
        }
        return { data, error }
    }

    async function updateAppointment(id, updates) {
        const { data, error } = await appointmentsRepo.update(id, updates)
        if (!error) resource.setData(prev => prev.map(a => a.id === id ? data : a))
        return { data, error }
    }

    const upcoming = useMemo(
        () => resource.data.filter(
            a => a.status === 'upcoming' && new Date(a.scheduled_at) > new Date()
        ),
        [resource.data]
    )

    return {
        appointments: resource.data,
        upcoming,
        loading: resource.loading,
        loadingMore: resource.loadingMore,
        error: resource.error,
        totalCount: resource.totalCount,
        hasMore: resource.hasMore,
        refetch: resource.refetch,
        loadMore: resource.loadMore,
        createAppointment,
        updateAppointment,
    }
}
