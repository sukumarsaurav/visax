import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic paginated-list state machine. Removes the copy-pasted
 * loading/loadingMore/error/totalCount/hasMore/refetch/loadMore wiring from
 * useCases, useAppointments, useInvoices, etc.
 *
 * @param fetcher  ({ page, pageSize, includeCount }) => PromiseLike<{ data, error, count }>
 *                 The repo function that performs the actual query.
 * @param deps     Identity values that, when changed, trigger a fresh page-0 fetch.
 *                 Pass `[null, null]` to skip fetching until ready (e.g. before user is loaded).
 *
 * Callers can `setData` directly to do optimistic updates after a mutation.
 */
export function useResource(fetcher, deps = []) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState(null)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(0)

    // Hold the latest fetcher in a ref so consumers don't need to memoize it.
    const fetcherRef = useRef(fetcher)
    fetcherRef.current = fetcher

    const hasMore = data.length < totalCount

    const fetchPage = useCallback(async (pageNum, pageSize) => {
        if (pageNum === 0) setLoading(true)
        else setLoadingMore(true)

        const { data: rows, error: err, count } = await fetcherRef.current({
            page: pageNum,
            pageSize,
            includeCount: pageNum === 0,
        })

        if (err) {
            setError(err.message)
        } else {
            setData(prev => pageNum === 0 ? (rows || []) : [...prev, ...(rows || [])])
            if (count != null) setTotalCount(count)
            setError(null)
        }

        if (pageNum === 0) setLoading(false)
        else setLoadingMore(false)
        setPage(pageNum)
    }, [])

    // Re-fetch from page 0 whenever any dep changes. The `enabled` convention
    // (any dep falsy ⇒ skip) lets callers gate on "user loaded yet?".
    const enabled = deps.every(d => d != null)
    useEffect(() => {
        if (!enabled) return
        fetchPage(0, 50) // default page size; per-call override via loadMore
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...deps])

    const refetch = useCallback((pageSize = 50) => fetchPage(0, pageSize), [fetchPage])
    const loadMore = useCallback((pageSize = 50) => {
        if (loadingMore || !hasMore) return
        return fetchPage(page + 1, pageSize)
    }, [fetchPage, loadingMore, hasMore, page])

    return {
        data,
        setData,
        loading,
        loadingMore,
        error,
        totalCount,
        setTotalCount,
        hasMore,
        page,
        refetch,
        loadMore,
    }
}
