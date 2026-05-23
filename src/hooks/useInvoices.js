import { useAuth } from '../contexts/AuthContext'
import { useResource } from './useResource'
import * as invoicesRepo from '../data/invoicesRepo'

/** Paginated invoice list scoped by the caller's role. */
export function useInvoices({ limit } = {}) {
    const { user, profile } = useAuth()
    const role = profile?.role
    const userId = user?.id

    const resource = useResource(
        ({ page, pageSize, includeCount }) =>
            invoicesRepo.list({ role, userId, page, pageSize: limit || pageSize, includeCount }),
        [userId, role]
    )

    async function createInvoice(invoiceData) {
        const { data, error } = await invoicesRepo.create(invoiceData)
        if (!error) {
            resource.setData(prev => [data, ...prev])
            resource.setTotalCount(c => c + 1)
        }
        return { data, error }
    }

    return {
        invoices: resource.data,
        loading: resource.loading,
        loadingMore: resource.loadingMore,
        error: resource.error,
        totalCount: resource.totalCount,
        hasMore: resource.hasMore,
        refetch: resource.refetch,
        loadMore: resource.loadMore,
        createInvoice,
    }
}
