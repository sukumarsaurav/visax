import { Navigate, useLocation } from 'react-router-dom'

// /services is now the "Browse Services" tab inside FindProfessionalsPage.
// This redirect keeps old bookmarks and external links working.
// Any ?q= search param is forwarded so deep-links still land correctly.

export default function ServicesDirectoryPage() {
    const { search } = useLocation()
    const params = new URLSearchParams(search)
    const q = params.get('q')

    const dest = q
        ? `/find-professionals?tab=services&q=${encodeURIComponent(q)}`
        : '/find-professionals?tab=services'

    return <Navigate to={dest} replace />
}
