import { useAuth } from '../contexts/AuthContext'
import { useResource } from './useResource'
import * as casesRepo from '../data/casesRepo'

/**
 * Paginated case list scoped by the caller's role. Thin shim over
 * useResource + casesRepo so the heavy lifting (pagination, errors,
 * total counts, refetch, loadMore) lives in one place.
 *
 * Return shape is preserved for backward compatibility with existing
 * consumers (cases / loading / loadingMore / refetch / loadMore /
 * createCase / updateCase).
 */
export function useCases({ limit } = {}) {
    const { user, profile } = useAuth()
    const role = profile?.role
    const userId = user?.id

    const resource = useResource(
        ({ page, pageSize, includeCount }) =>
            casesRepo.list({ role, userId, page, pageSize: limit || pageSize, includeCount }),
        [userId, role]
    )

    async function createCase(caseData) {
        const { data, error } = await casesRepo.create(caseData)
        if (!error) {
            resource.setData(prev => [data, ...prev])
            resource.setTotalCount(c => c + 1)
        }
        return { data, error }
    }

    async function updateCase(id, updates) {
        const { data, error } = await casesRepo.update(id, updates)
        if (!error) resource.setData(prev => prev.map(c => c.id === id ? data : c))
        return { data, error }
    }

    return {
        cases: resource.data,
        loading: resource.loading,
        loadingMore: resource.loadingMore,
        error: resource.error,
        totalCount: resource.totalCount,
        hasMore: resource.hasMore,
        refetch: resource.refetch,
        loadMore: resource.loadMore,
        createCase,
        updateCase,
    }
}
