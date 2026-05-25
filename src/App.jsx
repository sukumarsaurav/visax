import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useEffect, useState, lazy, Suspense } from 'react'
import { trackEvent } from './lib/integrations'
import { loadPlatformConfig, getMaintenanceMode, getMaintenanceMessage } from './lib/platformConfig'
import { CLIENT, AGENCY_ADMIN, ADMIN } from './constants/roles'
import { useDocumentLang } from './hooks/useDocumentLang'
import { UserChannelProvider } from './contexts/UserChannelContext'
import * as platformSettingsRepo from './data/platformSettingsRepo'

// Layouts — kept eager since they're needed immediately
import DashboardLayout from './components/layout/DashboardLayout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// ─── LAZY-LOADED PAGES ───────────────────────────────────────────────────────

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ProfessionalRegisterPage = lazy(() => import('./pages/auth/ProfessionalRegisterPage'))
const ProfessionalWelcomePage = lazy(() => import('./pages/auth/ProfessionalWelcomePage'))
const RegistrationOnboardingPage = lazy(() => import('./pages/auth/RegistrationOnboardingPage'))
const ProfessionalSubmittedPage = lazy(() => import('./pages/auth/ProfessionalSubmittedPage'))
const ProfessionalApprovedPage = lazy(() => import('./pages/auth/ProfessionalApprovedPage'))

// Client Pages
const ClientDashboard = lazy(() => import('./pages/client/DashboardPage'))
const ClientCases = lazy(() => import('./pages/client/CasesPage'))
const ClientAppointments = lazy(() => import('./pages/client/AppointmentsPage'))
const ClientInvoices = lazy(() => import('./pages/client/InvoicesPage'))
const ClientServices = lazy(() => import('./pages/client/ServicesPage'))
const OnboardingWelcomePage = lazy(() => import('./pages/client/OnboardingWelcomePage'))
const ProfileSetupPage = lazy(() => import('./pages/client/ProfileSetupPage'))
const WishlistPage = lazy(() => import('./pages/client/WishlistPage'))
const HelpCenterPage = lazy(() => import('./pages/client/HelpCenterPage'))
const MeetingConfirmationPage = lazy(() => import('./pages/client/MeetingConfirmationPage'))
const FeedbackPage = lazy(() => import('./pages/client/FeedbackPage'))
const CompareToolPage = lazy(() => import('./pages/client/CompareToolPage'))
const DocumentsPage = lazy(() => import('./pages/client/DocumentsPage'))

// Consultant Pages
const ConsultantDashboard = lazy(() => import('./pages/consultant/DashboardPage'))
const ConsultantClients = lazy(() => import('./pages/consultant/ClientsPage'))
const ConsultantCases = lazy(() => import('./pages/consultant/CasesPage'))
const InviteClientPage = lazy(() => import('./pages/consultant/InviteClientPage'))
const ResourceLibraryPage = lazy(() => import('./pages/consultant/ResourceLibraryPage'))
const TeamManagementPage = lazy(() => import('./pages/consultant/TeamManagementPage'))
const AnnouncementsPage = lazy(() => import('./pages/consultant/AnnouncementsPage'))
const ConsultantServicesPage = lazy(() => import('./pages/consultant/ServicesPage'))
const ConsultantMessagesPage = lazy(() => import('./pages/consultant/MessagesPage'))
const ConsultantAvailabilityPage = lazy(() => import('./pages/consultant/AvailabilityPage'))
const TeamAvailabilityPage = lazy(() => import('./pages/consultant/TeamAvailabilityPage'))
const ConsultantSettingsPage = lazy(() => import('./pages/consultant/SettingsPage'))
const ConsultantAppointmentsPage = lazy(() => import('./pages/consultant/AppointmentsPage'))
const NotificationsPage = lazy(() => import('./pages/consultant/NotificationsPage'))
const UpgradePlanPage = lazy(() => import('./pages/consultant/UpgradePlanPage'))

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'))
const AdminAuditLog = lazy(() => import('./pages/admin/AuditLogPage'))
const AdminCommunicationSettings = lazy(() => import('./pages/admin/CommunicationSettingsPage'))
const AdminInternalAnnouncements = lazy(() => import('./pages/admin/InternalAnnouncementsPage'))
const AdminLocalizationManagement = lazy(() => import('./pages/admin/LocalizationManagementPage'))
const AdminApplicationReview = lazy(() => import('./pages/admin/ApplicationReviewPage'))
const AdminPaymentGatewaySettings = lazy(() => import('./pages/admin/PaymentGatewaySettingsPage'))
const AdminPlatformSettings = lazy(() => import('./pages/admin/PlatformSettingsPage'))
const AdminReferralProgram = lazy(() => import('./pages/admin/ReferralProgramPage'))
const AdminMarketing = lazy(() => import('./pages/admin/MarketingPage'))
const AdminResourceManagement = lazy(() => import('./pages/admin/ResourceManagementPage'))
const AdminSalesSubscriptions = lazy(() => import('./pages/admin/SalesSubscriptionsPage'))
const AdminSystemIntegrations = lazy(() => import('./pages/admin/SystemIntegrationsPage'))
const AdminUserManagement = lazy(() => import('./pages/admin/UserManagementPage'))

// Shared pages
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'))

// Landing Pages
const HomePage = lazy(() => import('./pages/landing/HomePage'))
const FindProfessionalsPage = lazy(() => import('./pages/landing/FindProfessionalsPage'))
const ConsultantProfilePage = lazy(() => import('./pages/landing/ConsultantProfilePage'))
const AgencyProfilePage = lazy(() => import('./pages/landing/AgencyProfilePage'))
const SupportPage = lazy(() => import('./pages/landing/SupportPage'))
const PricingPage = lazy(() => import('./pages/landing/PricingPage'))
const ServicesDirectoryPage = lazy(() => import('./pages/landing/ServicesDirectoryPage'))
const ServiceDetailsPage = lazy(() => import('./pages/landing/ServiceDetailsPage'))
const AboutPage = lazy(() => import('./pages/landing/AboutPage'))
const PrivacyPage = lazy(() => import('./pages/landing/PrivacyPage'))
const TermsPage = lazy(() => import('./pages/landing/TermsPage'))
const CityLandingPage = lazy(() => import('./pages/landing/CityLandingPage'))
const DestinationPage = lazy(() => import('./pages/landing/DestinationPage'))
const ImmigrationRouter = lazy(() => import('./pages/landing/ImmigrationRouter'))
const ComparisonPage = lazy(() => import('./pages/landing/ComparisonPage'))
const BlogIndexPage = lazy(() => import('./pages/landing/BlogIndexPage'))
const BlogPostPage = lazy(() => import('./pages/landing/BlogPostPage'))
const UnclaimedProfilePage = lazy(() => import('./pages/landing/UnclaimedProfilePage'))
const ForProfessionalsPage = lazy(() => import('./pages/landing/ForProfessionalsPage'))

// Auth pages (additional)
const ClaimProfilePage = lazy(() => import('./pages/auth/ClaimProfilePage'))
const AcceptInvitePage = lazy(() => import('./pages/auth/AcceptInvitePage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))

// Admin pages (additional)
const AdminUnclaimedProfiles = lazy(() => import('./pages/admin/UnclaimedProfilesPage'))

// Account / GDPR
const AccountDataPage = lazy(() => import('./pages/account/AccountDataPage'))

// Misc
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'))

// ─── SUSPENSE FALLBACK ───────────────────────────────────────────────────────

function PageLoader() {
    return (
        <div className="flex h-full min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-white animate-pulse shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined material-filled text-2xl">flight_takeoff</span>
                </div>
                <div className="w-32 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full w-1/2 bg-primary rounded-full animate-shimmer" />
                </div>
            </div>
        </div>
    )
}

// ─── GA4 ─────────────────────────────────────────────────────────────────────

// GA4 auto-inject: loads gtag.js when Google Analytics is connected
function useGoogleAnalytics() {
    useEffect(() => {
        platformSettingsRepo.getValue('integrations')
            .then(({ value }) => {
                const ga = value?.analytics
                if (!ga?.enabled || !ga?.measurement_id) return
                const id = ga.measurement_id
                // Validate GA4 ID format before any DOM injection to prevent script injection
                if (!/^G-[A-Z0-9]{4,}$/.test(id)) return
                if (document.getElementById('gtag-script')) return // already loaded
                const script = document.createElement('script')
                script.id = 'gtag-script'
                script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
                script.async = true
                document.head.appendChild(script)
                window.dataLayer = window.dataLayer || []
                window.gtag = function () { window.dataLayer.push(arguments) }
                window.gtag('js', new Date())
                window.gtag('config', id, { send_page_view: false })
            })
    }, [])
}

// Track page views on every route change
function PageViewTracker() {
    const location = useLocation()
    useEffect(() => {
        trackEvent('page_view', { page_path: location.pathname })
    }, [location.pathname])
    return null
}

// Root redirect based on role
function RootRedirect() {
    const { isAuthenticated, getDashboardPath, loading } = useAuth()
    if (loading) return null
    if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />
    return (
        <Suspense fallback={<PageLoader />}>
            <HomePage />
        </Suspense>
    )
}

// Renders the maintenance page when maintenance_mode is enabled, except for
// admins and the /login route. Optimistically renders children first and
// swaps in MaintenancePage if the config call says we're down — this avoids
// a blank screen while we wait for the platform_settings round-trip.
function MaintenanceGate({ children }) {
    const { profile } = useAuth()
    const location = useLocation()
    const [maintenance, setMaintenance] = useState(false)

    useEffect(() => {
        loadPlatformConfig().then(() => {
            setMaintenance(getMaintenanceMode())
        })
    }, [])

    const isAdmin = profile?.role === 'admin'
    const isLoginPage = location.pathname === '/login'

    if (maintenance && !isAdmin && !isLoginPage) {
        return (
            <Suspense fallback={null}>
                <MaintenancePage />
            </Suspense>
        )
    }

    return children
}

export default function App() {
    useGoogleAnalytics()
    useDocumentLang()
    return (
        <Router>
            <PageViewTracker />
            <UserChannelProvider>
            <MaintenanceGate>
            <Suspense fallback={<PageLoader />}>
                <Routes>

                    {/* Public Landing */}
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/find-professionals" element={<FindProfessionalsPage />} />
                    <Route path="/consultant/:id" element={<ConsultantProfilePage />} />
                    <Route path="/consultant/unclaimed/:id" element={<UnclaimedProfilePage />} />
                    <Route path="/claim-profile" element={<ClaimProfilePage />} />
                    <Route path="/accept-invite" element={<AcceptInvitePage />} />
                    <Route path="/agency/:id" element={<AgencyProfilePage />} />
                    <Route path="/help" element={<Navigate to="/support" replace />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    {/* GDPR — requires auth so the page self-protects via useAuth */}
                    <Route path="/account/data" element={<AccountDataPage />} />
                    <Route path="/for-professionals" element={<ForProfessionalsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/services" element={<ServicesDirectoryPage />} />
                    <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
                    {/* City SEO pages — /immigration-consultant-delhi, -mumbai, etc. */}
                    <Route path="/immigration-consultant-:city" element={<CityLandingPage />} />
                    {/* Destination + Occupation pages share /immigration/:destination via dispatcher */}
                    {/* — destination: /immigration/canada-pr */}
                    {/* — occupation:  /immigration/canada-pr-for-software-engineer */}
                    <Route path="/immigration/:destination" element={<ImmigrationRouter />} />
                    {/* Country-vs-country comparison pages (high mid-funnel intent) */}
                    <Route path="/compare/:slug" element={<ComparisonPage />} />
                    {/* Blog content hub — long-form informational posts */}
                    <Route path="/blog" element={<BlogIndexPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />

                    {/* Auth — redirect to dashboard if already logged in */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    </Route>

                    {/* Reset password — intentionally outside AuthLayout.
                        Supabase appends #access_token=...&type=recovery to this URL and
                        immediately establishes a recovery session, so isAuthenticated
                        becomes true. AuthLayout would redirect to dashboard — bypassed here
                        by using AuthLayout-style shell directly in the page component. */}
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Professional registration flow (standalone, two-panel design) */}
                    <Route path="/professional-register" element={<ProfessionalWelcomePage />} />
                    <Route path="/professional-register/form" element={<ProfessionalRegisterPage />} />

                    {/* Post-registration onboarding — requires auth */}
                    <Route path="/onboarding" element={
                        <ProtectedRoute allowedRoles={['individual', 'agency_admin']}>
                            <RegistrationOnboardingPage />
                        </ProtectedRoute>
                    } />

                    {/* Professional post-registration pages — require auth */}
                    <Route path="/professional-submitted" element={
                        <ProtectedRoute allowedRoles={['individual', 'agency_admin']}>
                            <ProfessionalSubmittedPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/professional-approved" element={
                        <ProtectedRoute allowedRoles={['individual', 'agency_admin']}>
                            <ProfessionalApprovedPage />
                        </ProtectedRoute>
                    } />

                    {/* Client Onboarding (protected, no sidebar) */}
                    <Route path="/client/onboarding" element={
                        <ProtectedRoute allowedRoles={CLIENT}><OnboardingWelcomePage /></ProtectedRoute>
                    } />
                    <Route path="/client/profile-setup" element={
                        <ProtectedRoute allowedRoles={CLIENT}><ProfileSetupPage /></ProtectedRoute>
                    } />

                    {/* ── CLIENT PORTAL ── */}
                    <Route path="/client" element={
                        <ProtectedRoute allowedRoles={CLIENT}>
                            <DashboardLayout userType="client" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<ClientDashboard />} />
                        <Route path="cases" element={<ClientCases />} />
                        <Route path="appointments" element={<ClientAppointments />} />
                        <Route path="invoices" element={<ClientInvoices />} />
                        <Route path="services" element={<ClientServices />} />
                        <Route path="documents" element={<DocumentsPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                        <Route path="compare" element={<CompareToolPage />} />
                        <Route path="help-center" element={<HelpCenterPage />} />
                        <Route path="meeting-confirmation/:id" element={<MeetingConfirmationPage />} />
                        <Route path="feedback/:appointmentId" element={<FeedbackPage />} />
                    </Route>

                    {/* ── INDIVIDUAL CONSULTANT PORTAL ── */}
                    <Route path="/consultant" element={
                        <ProtectedRoute allowedRoles={['individual']}>
                            <DashboardLayout userType="consultant" consultantType="individual" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<ConsultantDashboard />} />
                        <Route path="clients" element={<ConsultantClients />} />
                        <Route path="cases" element={<ConsultantCases />} />
                        <Route path="invite-client" element={<InviteClientPage />} />
                        <Route path="resources" element={<ResourceLibraryPage />} />
                        <Route path="services" element={<ConsultantServicesPage />} />
                        <Route path="messages" element={<ConsultantMessagesPage />} />
                        <Route path="availability" element={<ConsultantAvailabilityPage />} />
                        <Route path="settings" element={<ConsultantSettingsPage />} />
                        <Route path="appointments" element={<ConsultantAppointmentsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="upgrade-plan" element={<UpgradePlanPage />} />
                    </Route>

                    {/* ── AGENCY ADMIN PORTAL ── */}
                    <Route path="/agency" element={
                        <ProtectedRoute allowedRoles={AGENCY_ADMIN}>
                            <DashboardLayout userType="consultant" consultantType="agency_admin" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<ConsultantDashboard />} />
                        <Route path="team" element={<TeamManagementPage />} />
                        <Route path="clients" element={<ConsultantClients />} />
                        <Route path="cases" element={<ConsultantCases />} />
                        <Route path="invite-client" element={<InviteClientPage />} />
                        <Route path="resources" element={<ResourceLibraryPage />} />
                        <Route path="services" element={<ConsultantServicesPage />} />
                        <Route path="messages" element={<ConsultantMessagesPage />} />
                        <Route path="availability" element={<TeamAvailabilityPage />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="settings" element={<ConsultantSettingsPage />} />
                        <Route path="appointments" element={<ConsultantAppointmentsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                        <Route path="upgrade-plan" element={<UpgradePlanPage />} />
                    </Route>

                    {/* ── AGENCY TEAM MEMBER PORTAL ── */}
                    <Route path="/team-member" element={
                        <ProtectedRoute allowedRoles={['agency_member']}>
                            <DashboardLayout userType="consultant" consultantType="agency_member" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<ConsultantDashboard />} />
                        <Route path="clients" element={<ConsultantClients />} />
                        <Route path="cases" element={<ConsultantCases />} />
                        <Route path="invite-client" element={<InviteClientPage />} />
                        <Route path="resources" element={<ResourceLibraryPage />} />
                        <Route path="services" element={<ConsultantServicesPage />} />
                        <Route path="messages" element={<ConsultantMessagesPage />} />
                        <Route path="availability" element={<ConsultantAvailabilityPage />} />
                        <Route path="announcements" element={<AnnouncementsPage />} />
                        <Route path="settings" element={<ConsultantSettingsPage />} />
                        <Route path="appointments" element={<ConsultantAppointmentsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="upgrade-plan" element={<UpgradePlanPage />} />
                    </Route>

                    {/* ── PLATFORM ADMIN PORTAL ── */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={ADMIN}>
                            <DashboardLayout userType="admin" />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="applications" element={<AdminApplicationReview />} />
                        <Route path="unclaimed-profiles" element={<AdminUnclaimedProfiles />} />
                        <Route path="audit-log" element={<AdminAuditLog />} />
                        <Route path="communication-settings" element={<AdminCommunicationSettings />} />
                        <Route path="announcements" element={<AdminInternalAnnouncements />} />
                        <Route path="localization" element={<AdminLocalizationManagement />} />
                        <Route path="payment-settings" element={<AdminPaymentGatewaySettings />} />
                        <Route path="platform-settings" element={<AdminPlatformSettings />} />
                        <Route path="marketing" element={<AdminMarketing />} />
                        <Route path="referral-program" element={<AdminReferralProgram />} />
                        <Route path="resources" element={<AdminResourceManagement />} />
                        <Route path="sales-subscriptions" element={<AdminSalesSubscriptions />} />
                        <Route path="integrations" element={<AdminSystemIntegrations />} />
                        <Route path="user-management" element={<AdminUserManagement />} />
                        <Route path="analytics" element={<AnalyticsPage />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
            </MaintenanceGate>
            </UserChannelProvider>
        </Router>
    )
}
