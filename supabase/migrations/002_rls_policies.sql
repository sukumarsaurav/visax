-- ============================================
-- VISAX Immigration Marketplace - RLS Policies
-- Version: 1.0.0
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Lookup tables are public read
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE expertise_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Get current user's agency_id (for consultants/agency members)
CREATE OR REPLACE FUNCTION get_user_agency_id()
RETURNS UUID AS $$
    SELECT agency_id FROM consultant_profiles WHERE user_id = auth.uid()
    UNION
    SELECT agency_id FROM team_members WHERE user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT get_user_role() = 'admin';
$$ LANGUAGE sql SECURITY DEFINER;

-- Check if user is agency admin
CREATE OR REPLACE FUNCTION is_agency_admin()
RETURNS BOOLEAN AS $$
    SELECT get_user_role() = 'agency_admin';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

-- Admins can read all users
CREATE POLICY "users_admin_select" ON users
    FOR SELECT USING (is_admin());

-- Admins can update all users
CREATE POLICY "users_admin_update" ON users
    FOR UPDATE USING (is_admin());

-- Public profiles visible for consultants (for marketplace)
CREATE POLICY "users_public_consultants" ON users
    FOR SELECT USING (role IN ('consultant', 'agency_admin', 'agency_member'));

-- ============================================
-- CLIENT PROFILES POLICIES
-- ============================================

CREATE POLICY "client_profiles_select_own" ON client_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "client_profiles_insert_own" ON client_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "client_profiles_update_own" ON client_profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Consultants can view their client profiles
CREATE POLICY "client_profiles_consultant_view" ON client_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cases 
            WHERE cases.client_id = client_profiles.user_id 
            AND cases.consultant_id IN (
                SELECT id FROM consultant_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- ============================================
-- CONSULTANT PROFILES POLICIES
-- ============================================

-- Public read for marketplace
CREATE POLICY "consultant_profiles_public_read" ON consultant_profiles
    FOR SELECT USING (true);

-- Consultants can update own profile
CREATE POLICY "consultant_profiles_update_own" ON consultant_profiles
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "consultant_profiles_insert_own" ON consultant_profiles
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================
-- CONSULTANT LANGUAGES POLICIES
-- ============================================

CREATE POLICY "consultant_languages_public_read" ON consultant_languages
    FOR SELECT USING (true);

CREATE POLICY "consultant_languages_owner_manage" ON consultant_languages
    FOR ALL USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- CONSULTANT EXPERTISE POLICIES
-- ============================================

CREATE POLICY "consultant_expertise_public_read" ON consultant_expertise
    FOR SELECT USING (true);

CREATE POLICY "consultant_expertise_owner_manage" ON consultant_expertise
    FOR ALL USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- AGENCIES POLICIES
-- ============================================

-- Public read for marketplace
CREATE POLICY "agencies_public_read" ON agencies
    FOR SELECT USING (true);

-- Agency admins can update their agency
CREATE POLICY "agencies_admin_update" ON agencies
    FOR UPDATE USING (
        id = get_user_agency_id() AND is_agency_admin()
    );

-- Platform admins can manage all agencies
CREATE POLICY "agencies_platform_admin" ON agencies
    FOR ALL USING (is_admin());

-- ============================================
-- AGENCY LANGUAGES POLICIES
-- ============================================

CREATE POLICY "agency_languages_public_read" ON agency_languages
    FOR SELECT USING (true);

CREATE POLICY "agency_languages_admin_manage" ON agency_languages
    FOR ALL USING (
        agency_id = get_user_agency_id() AND is_agency_admin()
    );

-- ============================================
-- TEAM MEMBERS POLICIES
-- ============================================

-- Team members can see their own agency team
CREATE POLICY "team_members_agency_read" ON team_members
    FOR SELECT USING (agency_id = get_user_agency_id());

-- Agency admins can manage team
CREATE POLICY "team_members_admin_manage" ON team_members
    FOR ALL USING (
        agency_id = get_user_agency_id() AND is_agency_admin()
    );

-- Platform admins can see all
CREATE POLICY "team_members_platform_admin" ON team_members
    FOR SELECT USING (is_admin());

-- ============================================
-- CONSULTANT SERVICES POLICIES
-- ============================================

-- Public read for marketplace
CREATE POLICY "consultant_services_public_read" ON consultant_services
    FOR SELECT USING (is_visible = true);

-- Owners can manage their services
CREATE POLICY "consultant_services_owner_manage" ON consultant_services
    FOR ALL USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
        OR (agency_id = get_user_agency_id() AND is_agency_admin())
    );

-- ============================================
-- SERVICE COUNTRIES POLICIES
-- ============================================

CREATE POLICY "service_countries_public_read" ON service_countries
    FOR SELECT USING (true);

CREATE POLICY "service_countries_owner_manage" ON service_countries
    FOR ALL USING (
        service_id IN (
            SELECT id FROM consultant_services 
            WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            OR (agency_id = get_user_agency_id() AND is_agency_admin())
        )
    );

-- ============================================
-- CASES POLICIES
-- ============================================

-- Clients can see their own cases
CREATE POLICY "cases_client_read" ON cases
    FOR SELECT USING (client_id = auth.uid());

-- Consultants can see cases assigned to them
CREATE POLICY "cases_consultant_read" ON cases
    FOR SELECT USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- Agency members can see their agency cases
CREATE POLICY "cases_agency_read" ON cases
    FOR SELECT USING (agency_id = get_user_agency_id());

-- Consultants can update their cases
CREATE POLICY "cases_consultant_update" ON cases
    FOR UPDATE USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
        OR (agency_id = get_user_agency_id())
    );

-- Consultants can create cases
CREATE POLICY "cases_consultant_insert" ON cases
    FOR INSERT WITH CHECK (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
        OR (agency_id = get_user_agency_id())
    );

-- Admins can see all
CREATE POLICY "cases_admin_all" ON cases
    FOR ALL USING (is_admin());

-- ============================================
-- CASE DOCUMENTS POLICIES
-- ============================================

-- Users involved in case can see documents
CREATE POLICY "case_documents_party_read" ON case_documents
    FOR SELECT USING (
        case_id IN (
            SELECT id FROM cases WHERE client_id = auth.uid()
            UNION
            SELECT id FROM cases WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            UNION
            SELECT id FROM cases WHERE agency_id = get_user_agency_id()
        )
    );

-- Clients can upload documents
CREATE POLICY "case_documents_client_insert" ON case_documents
    FOR INSERT WITH CHECK (
        case_id IN (SELECT id FROM cases WHERE client_id = auth.uid())
    );

-- Consultants can manage documents
CREATE POLICY "case_documents_consultant_manage" ON case_documents
    FOR ALL USING (
        case_id IN (
            SELECT id FROM cases WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            UNION
            SELECT id FROM cases WHERE agency_id = get_user_agency_id()
        )
    );

-- ============================================
-- CASE ACTIVITIES POLICIES
-- ============================================

-- Parties can view activities
CREATE POLICY "case_activities_party_read" ON case_activities
    FOR SELECT USING (
        case_id IN (
            SELECT id FROM cases WHERE client_id = auth.uid()
            UNION
            SELECT id FROM cases WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            UNION
            SELECT id FROM cases WHERE agency_id = get_user_agency_id()
        )
    );

-- Consultants can add activities
CREATE POLICY "case_activities_consultant_insert" ON case_activities
    FOR INSERT WITH CHECK (
        case_id IN (
            SELECT id FROM cases WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            UNION
            SELECT id FROM cases WHERE agency_id = get_user_agency_id()
        )
    );

-- ============================================
-- CASE NOTES POLICIES
-- ============================================

-- Only consultants see internal notes
CREATE POLICY "case_notes_consultant_read" ON case_notes
    FOR SELECT USING (
        case_id IN (
            SELECT id FROM cases WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            UNION
            SELECT id FROM cases WHERE agency_id = get_user_agency_id()
        )
    );

-- Clients can only see non-internal notes
CREATE POLICY "case_notes_client_read" ON case_notes
    FOR SELECT USING (
        is_internal = false AND case_id IN (SELECT id FROM cases WHERE client_id = auth.uid())
    );

-- Consultants can manage notes
CREATE POLICY "case_notes_consultant_manage" ON case_notes
    FOR ALL USING (
        case_id IN (
            SELECT id FROM cases WHERE consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
            UNION
            SELECT id FROM cases WHERE agency_id = get_user_agency_id()
        )
    );

-- ============================================
-- APPOINTMENTS POLICIES
-- ============================================

-- Users can see their appointments
CREATE POLICY "appointments_participant_read" ON appointments
    FOR SELECT USING (
        client_id = auth.uid()
        OR consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
        OR agency_id = get_user_agency_id()
    );

-- Users can create appointments
CREATE POLICY "appointments_create" ON appointments
    FOR INSERT WITH CHECK (
        client_id = auth.uid()
        OR consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- Consultants can update appointments
CREATE POLICY "appointments_consultant_update" ON appointments
    FOR UPDATE USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
        OR agency_id = get_user_agency_id()
    );

-- ============================================
-- CONSULTANT AVAILABILITY POLICIES
-- ============================================

-- Public read
CREATE POLICY "consultant_availability_public_read" ON consultant_availability
    FOR SELECT USING (true);

-- Owners manage
CREATE POLICY "consultant_availability_owner_manage" ON consultant_availability
    FOR ALL USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- BLOCKED SLOTS POLICIES
-- ============================================

CREATE POLICY "blocked_slots_public_read" ON blocked_slots
    FOR SELECT USING (true);

CREATE POLICY "blocked_slots_owner_manage" ON blocked_slots
    FOR ALL USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- INVOICES POLICIES
-- ============================================

-- Clients see their invoices
CREATE POLICY "invoices_client_read" ON invoices
    FOR SELECT USING (client_id = auth.uid());

-- Consultants see their invoices
CREATE POLICY "invoices_consultant_read" ON invoices
    FOR SELECT USING (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- Consultants can create invoices
CREATE POLICY "invoices_consultant_create" ON invoices
    FOR INSERT WITH CHECK (
        consultant_id IN (SELECT id FROM consultant_profiles WHERE user_id = auth.uid())
    );

-- ============================================
-- PAYMENT TRANSACTIONS POLICIES
-- ============================================

-- Users see their own payments
CREATE POLICY "payment_transactions_own_read" ON payment_transactions
    FOR SELECT USING (user_id = auth.uid());

-- Admins see all
CREATE POLICY "payment_transactions_admin" ON payment_transactions
    FOR SELECT USING (is_admin());

-- ============================================
-- USER SUBSCRIPTIONS POLICIES
-- ============================================

CREATE POLICY "user_subscriptions_own_read" ON user_subscriptions
    FOR SELECT USING (
        user_id = auth.uid() OR agency_id = get_user_agency_id()
    );

CREATE POLICY "user_subscriptions_admin" ON user_subscriptions
    FOR ALL USING (is_admin());

-- ============================================
-- USAGE TRACKING POLICIES
-- ============================================

CREATE POLICY "usage_tracking_own_read" ON usage_tracking
    FOR SELECT USING (
        user_id = auth.uid() OR agency_id = get_user_agency_id()
    );

CREATE POLICY "usage_tracking_admin" ON usage_tracking
    FOR ALL USING (is_admin());

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

CREATE POLICY "conversations_participant_read" ON conversations
    FOR SELECT USING (
        participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    );

CREATE POLICY "conversations_create" ON conversations
    FOR INSERT WITH CHECK (
        participant_1_id = auth.uid() OR participant_2_id = auth.uid()
    );

-- ============================================
-- MESSAGES POLICIES
-- ============================================

CREATE POLICY "messages_participant_read" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
        )
    );

CREATE POLICY "messages_sender_insert" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND conversation_id IN (
            SELECT id FROM conversations 
            WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
        )
    );

CREATE POLICY "messages_recipient_update" ON messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE participant_1_id = auth.uid() OR participant_2_id = auth.uid()
        )
    );

-- ============================================
-- ANNOUNCEMENTS POLICIES
-- ============================================

-- Platform announcements visible to all
CREATE POLICY "announcements_platform_read" ON announcements
    FOR SELECT USING (agency_id IS NULL);

-- Agency announcements visible to agency members
CREATE POLICY "announcements_agency_read" ON announcements
    FOR SELECT USING (agency_id = get_user_agency_id());

-- Agency admins can manage announcements
CREATE POLICY "announcements_agency_manage" ON announcements
    FOR ALL USING (
        agency_id = get_user_agency_id() AND is_agency_admin()
    );

-- Platform admins can manage all
CREATE POLICY "announcements_admin_manage" ON announcements
    FOR ALL USING (is_admin());

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

CREATE POLICY "notifications_own_read" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_own_update" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Public read
CREATE POLICY "reviews_public_read" ON reviews
    FOR SELECT USING (true);

-- Clients can create reviews
CREATE POLICY "reviews_client_create" ON reviews
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- ============================================
-- WISHLISTS POLICIES
-- ============================================

CREATE POLICY "wishlists_own_manage" ON wishlists
    FOR ALL USING (user_id = auth.uid());

-- ============================================
-- RESOURCES POLICIES
-- ============================================

-- Public resources visible to all
CREATE POLICY "resources_public_read" ON resources
    FOR SELECT USING (is_public = true);

-- Agency resources visible to members
CREATE POLICY "resources_agency_read" ON resources
    FOR SELECT USING (agency_id = get_user_agency_id());

-- Agency admins can manage resources
CREATE POLICY "resources_agency_manage" ON resources
    FOR ALL USING (
        agency_id = get_user_agency_id() AND is_agency_admin()
    );

-- Platform admins can manage all
CREATE POLICY "resources_admin_manage" ON resources
    FOR ALL USING (is_admin());

-- ============================================
-- LOOKUP TABLES POLICIES (Public Read)
-- ============================================

CREATE POLICY "countries_public_read" ON countries
    FOR SELECT USING (true);

CREATE POLICY "visa_types_public_read" ON visa_types
    FOR SELECT USING (true);

CREATE POLICY "expertise_areas_public_read" ON expertise_areas
    FOR SELECT USING (true);

CREATE POLICY "service_types_public_read" ON service_types
    FOR SELECT USING (true);

CREATE POLICY "subscription_plans_public_read" ON subscription_plans
    FOR SELECT USING (true);

CREATE POLICY "promotions_active_read" ON promotions
    FOR SELECT USING (status = 'active');

-- Admin manages lookup tables
CREATE POLICY "countries_admin_manage" ON countries FOR ALL USING (is_admin());
CREATE POLICY "visa_types_admin_manage" ON visa_types FOR ALL USING (is_admin());
CREATE POLICY "expertise_areas_admin_manage" ON expertise_areas FOR ALL USING (is_admin());
CREATE POLICY "service_types_admin_manage" ON service_types FOR ALL USING (is_admin());
CREATE POLICY "subscription_plans_admin_manage" ON subscription_plans FOR ALL USING (is_admin());
CREATE POLICY "promotions_admin_manage" ON promotions FOR ALL USING (is_admin());
