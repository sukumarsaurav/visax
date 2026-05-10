import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-slate-500">Loading VisaX…</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
        // Redirect to their correct portal
        const roleMap = {
            client: '/client',
            individual: '/consultant',
            agency_admin: '/agency',
            agency_member: '/team-member',
            admin: '/admin',
        }
        return <Navigate to={roleMap[profile.role] || '/'} replace />
    }

    return children
}
