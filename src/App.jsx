import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { trackEvent } from './lib/integrations'

// Layouts
import DashboardLayout from './components/layout/DashboardLayout'
import AuthLayout from './components/layout/AuthLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ProfessionalRegisterPage from './pages/auth/ProfessionalRegisterPage'
import ProfessionalWelcomePage from './pages/auth/ProfessionalWelcomePage'
import ProfessionalSubmittedPage from './pages/auth/ProfessionalSubmittedPage'
import ProfessionalApprovedPage from './pages/auth/ProfessionalApprovedPage'

// Client Pages
import ClientDashboard from './pages/client/DashboardPage'
import ClientCases from './pages/client/CasesPage'
import ClientAppointments from './pages/client/AppointmentsPage'
import ClientInvoices from './pages/client/InvoicesPage'
import ClientServices from './pages/client/ServicesPage'
import OnboardingWelcomePage from './pages/client/OnboardingWelcomePage'
import ProfileSetupPage from './pages/client/ProfileSetupPage'
import WishlistPage from './pages/client/WishlistPage'
import HelpCenterPage from './pages/client/HelpCenterPage'
import MeetingConfirmationPage from './pages/client/MeetingConfirmationPage'
import FeedbackPage from './pages/client/FeedbackPage'
import CompareToolPage from './pages/client/CompareToolPage'
import DocumentsPage from './pages/client/DocumentsPage'

// Consultant Pages
import ConsultantDashboard from './pages/consultant/DashboardPage'
import ConsultantClients from './pages/consultant/ClientsPage'
import ConsultantCases from './pages/consultant/CasesPage'
import InviteClientPage from './pages/consultant/InviteClientPage'
import ResourceLibraryPage from './pages/consultant/ResourceLibraryPage'
import TeamManagementPage from './pages/consultant/TeamManagementPage'
import AnnouncementsPage from './pages/consultant/AnnouncementsPage'
import ConsultantServicesPage from './pages/consultant/ServicesPage'
import ConsultantMessagesPage from './pages/consultant/MessagesPage'
import ConsultantAvailabilityPage from './pages/consultant/AvailabilityPage'
import TeamAvailabilityPage from './pages/consultant/TeamAvailabilityPage'
import ConsultantSettingsPage from './pages/consultant/SettingsPage'
import ConsultantAppointmentsPage from './pages/consultant/AppointmentsPage'
import NotificationsPage from './pages/consultant/NotificationsPage'

// Admin Pages
import AdminDashboard from './pages/admin/DashboardPage'
import AdminAuditLog from './pages/admin/AuditLogPage'
import AdminCommunicationSettings from './pages/admin/CommunicationSettingsPage'
import AdminContentManagement from './pages/admin/ContentManagementPage'
import AdminInternalAnnouncements from './pages/admin/InternalAnnouncementsPage'
import AdminLocalizationManagement from './pages/admin/LocalizationManagementPage'
import AdminApplicationReview from './pages/admin/ApplicationReviewPage'
import AdminPaymentGatewaySettings from './pages/admin/PaymentGatewaySettingsPage'
import AdminPlatformSettings from './pages/admin/PlatformSettingsPage'
import AdminReferralProgram from './pages/admin/ReferralProgramPage'
import AdminMarketing from './pages/admin/MarketingPage'
import AdminResourceManagement from './pages/admin/ResourceManagementPage'
import AdminSalesSubscriptions from './pages/admin/SalesSubscriptionsPage'
import AdminSystemIntegrations from './pages/admin/SystemIntegrationsPage'
import AdminUserManagement from './pages/admin/UserManagementPage'

// Shared pages
import AnalyticsPage from './pages/analytics/AnalyticsPage'

// Landing Pages
import HomePage from './pages/landing/HomePage'
import FindProfessionalsPage from './pages/landing/FindProfessionalsPage'
import ConsultantProfilePage from './pages/landing/ConsultantProfilePage'
import AgencyProfilePage from './pages/landing/AgencyProfilePage'
import SupportPage from './pages/landing/SupportPage'
import PricingPage from './pages/landing/PricingPage'
import ServicesDirectoryPage from './pages/landing/ServicesDirectoryPage'
import ServiceDetailsPage from './pages/landing/ServiceDetailsPage'

// Misc
import NotFoundPage from './pages/NotFoundPage'

// GA4 auto-inject: loads gtag.js when Google Analytics is connected
function useGoogleAnalytics() {
    useEffect(() => {
        supabase.from('platform_settings').select('value').eq('key', 'integrations').single()
            .then(({ data }) => {
                const ga = data?.value?.analytics
                if (!ga?.enabled || !ga?.measurement_id) return
                const id = ga.measurement_id
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

// Role constants
const CLIENT = ['client']
const PROFESSIONAL = ['individual', 'agency_admin', 'agency_member']
const AGENCY_ADMIN = ['agency_admin']
const AGENCY_STAFF = ['agency_admin', 'agency_member']
const ADMIN = ['admin']

// Root redirect based on role
function RootRedirect() {
    const { isAuthenticated, getDashboardPath, loading } = useAuth()
    if (loading) return null
    if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />
    return <HomePage />
}

export default function App() {
    useGoogleAnalytics()
    return (
        <Router>
            <PageViewTracker />
            <Routes>

                {/* Public Landing */}
                <Route path="/" element={<RootRedirect />} />
                <Route path="/find-professionals" element={<FindProfessionalsPage />} />
                <Route path="/consultant/:id" element={<ConsultantProfilePage />} />
                <Route path="/agency/:id" element={<AgencyProfilePage />} />
                <Route path="/help" element={<SupportPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/services" element={<ServicesDirectoryPage />} />
                <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />

                {/* Auth — redirect to dashboard if already logged in */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                </Route>

                {/* Professional registration flow (standalone, two-panel design) */}
                <Route path="/professional-register" element={<ProfessionalWelcomePage />} />
                <Route path="/professional-register/form" element={<ProfessionalRegisterPage />} />

                {/* Professional post-registration pages */}
                <Route path="/professional-submitted" element={<ProfessionalSubmittedPage />} />
                <Route path="/professional-approved" element={<ProfessionalApprovedPage />} />

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
                </Route>

                {/* ── PLATFORM ADMIN PORTAL ── */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={ADMIN}>
                        <DashboardLayout userType="admin" />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="applications" element={<AdminApplicationReview />} />
                    <Route path="audit-log" element={<AdminAuditLog />} />
                    <Route path="communication-settings" element={<AdminCommunicationSettings />} />
                    <Route path="content-management" element={<AdminContentManagement />} />
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
        </Router>
    )
}
