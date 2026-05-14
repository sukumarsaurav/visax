import { Outlet, useLocation } from 'react-router-dom'
import { useMemo, useCallback, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'
import MobileDrawerNav from './MobileDrawerNav'
import RouteErrorBoundary from '../RouteErrorBoundary'
import { useAuth } from '../../contexts/AuthContext'
import { navItems } from '../../data/navConfig'

/**
 * Derive route → title mapping from navConfig automatically.
 * Falls back to 'Dashboard' for unknown routes.
 */
function buildRouteTitles() {
    const titles = {}
    for (const role of Object.keys(navItems)) {
        for (const item of navItems[role]) {
            titles[item.path] = item.label
        }
    }
    // Additional routes not in navConfig
    titles['/consultant/invite-client'] = 'Invite Client'
    titles['/agency/invite-client'] = 'Invite Client'
    titles['/team-member/invite-client'] = 'Invite Client'
    titles['/consultant/notifications'] = 'Notifications'
    titles['/agency/notifications'] = 'Notifications'
    titles['/team-member/notifications'] = 'Notifications'
    return titles
}

const routeTitles = buildRouteTitles()

export default function DashboardLayout({ userType = 'client', consultantType = null }) {
    const location = useLocation()
    const { profile } = useAuth()
    const title = routeTitles[location.pathname] || 'Dashboard'
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
    const outletContext = useMemo(() => ({ consultantType, profile }), [consultantType, profile])
    const openDrawer = useCallback(() => setMobileDrawerOpen(true), [])
    const closeDrawer = useCallback(() => setMobileDrawerOpen(false), [])

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar userType={userType} consultantType={consultantType} user={profile} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title={title} userType={userType} consultantType={consultantType} onDrawerOpen={openDrawer} />

                <main id="main-content" className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
                    <div className="mx-auto max-w-7xl">
                        <RouteErrorBoundary>
                            <Outlet context={outletContext} />
                        </RouteErrorBoundary>
                    </div>
                </main>
            </div>

            {/* Mobile bottom nav — "More" opens the drawer */}
            <MobileNav
                userType={userType}
                consultantType={consultantType}
                onMorePress={openDrawer}
            />

            {/* Shared mobile drawer — opened from bottom nav "More" or header hamburger */}
            <MobileDrawerNav
                open={mobileDrawerOpen}
                onClose={closeDrawer}
                userType={userType}
                consultantType={consultantType}
            />
        </div>
    )
}
