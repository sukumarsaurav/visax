-- ============================================
-- VISAX - RLS Policies (matches live DB)
-- Applied via dashboard migrations 20260509192553
-- ============================================

-- Enable RLS
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies              ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications         ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist              ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources             ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_activities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invitations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions            ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS (JWT-cached for performance)
-- ============================================

-- Returns the current user's role. Reads JWT app_metadata claim first
-- (zero DB hit when Supabase Auth hook is configured), falls back to DB.
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
    v_role TEXT;
BEGIN
    BEGIN
        v_role := (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'user_role');
    EXCEPTION WHEN OTHERS THEN
        v_role := NULL;
    END;
    IF v_role IS NOT NULL THEN
        RETURN v_role::user_role;
    END IF;
    SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
    RETURN v_role::user_role;
END;
$$;

-- Returns the current user's agency_id. Same JWT-first pattern.
CREATE OR REPLACE FUNCTION get_my_agency_id()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public AS $$
DECLARE
    v_agency_id UUID;
    v_claim     TEXT;
BEGIN
    BEGIN
        v_claim := (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'agency_id');
    EXCEPTION WHEN OTHERS THEN
        v_claim := NULL;
    END;
    IF v_claim IS NOT NULL THEN
        RETURN v_claim::UUID;
    END IF;
    SELECT agency_id INTO v_agency_id
    FROM agency_members
    WHERE profile_id = auth.uid()
      AND status = 'active'
    LIMIT 1;
    RETURN v_agency_id;
END;
$$;

-- ============================================
-- PROFILES
-- ============================================

CREATE POLICY "Profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (get_my_role() = 'admin');

-- ============================================
-- AGENCIES
-- ============================================

CREATE POLICY "Agencies are viewable by authenticated users"
    ON agencies FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Agency admins can create agencies"
    ON agencies FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Agency owners can update their agency"
    ON agencies FOR UPDATE
    USING (auth.uid() = owner_id);

-- ============================================
-- AGENCY MEMBERS
-- ============================================

CREATE POLICY "Agency members visible to agency staff and admins"
    ON agency_members FOR SELECT
    USING (
        auth.uid() = profile_id
        OR agency_id = get_my_agency_id()
        OR get_my_role() = 'admin'
    );

CREATE POLICY "Agency admins can manage members"
    ON agency_members FOR ALL
    USING (
        get_my_role() = ANY (ARRAY['agency_admin'::user_role, 'admin'::user_role])
        AND (agency_id = get_my_agency_id() OR get_my_role() = 'admin')
    );

-- ============================================
-- SERVICES
-- ============================================

CREATE POLICY "Services are viewable by all authenticated users"
    ON services FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Providers can manage their own services"
    ON services FOR ALL
    USING (auth.uid() = provider_id OR get_my_role() = 'admin');

-- ============================================
-- CASES
-- ============================================

CREATE POLICY "Clients see their own cases"
    ON cases FOR SELECT
    USING (
        auth.uid() = client_id
        OR auth.uid() = consultant_id
        OR agency_id = get_my_agency_id()
        OR get_my_role() = 'admin'
    );

CREATE POLICY "Consultants can create cases"
    ON cases FOR INSERT
    WITH CHECK (
        get_my_role() = ANY (ARRAY['individual'::user_role, 'agency_admin'::user_role, 'agency_member'::user_role, 'admin'::user_role])
    );

CREATE POLICY "Consultants and admins can update cases"
    ON cases FOR UPDATE
    USING (
        auth.uid() = consultant_id
        OR agency_id = get_my_agency_id()
        OR get_my_role() = 'admin'
    );

-- ============================================
-- APPOINTMENTS
-- ============================================

CREATE POLICY "Users see their own appointments"
    ON appointments FOR SELECT
    USING (
        auth.uid() = client_id
        OR auth.uid() = consultant_id
        OR get_my_role() = 'admin'
    );

CREATE POLICY "Authenticated users can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Participants can update appointments"
    ON appointments FOR UPDATE
    USING (
        auth.uid() = client_id
        OR auth.uid() = consultant_id
        OR get_my_role() = 'admin'
    );

-- ============================================
-- INVOICES
-- ============================================

CREATE POLICY "Users see their own invoices"
    ON invoices FOR SELECT
    USING (
        auth.uid() = client_id
        OR auth.uid() = consultant_id
        OR agency_id = get_my_agency_id()
        OR get_my_role() = 'admin'
    );

CREATE POLICY "Consultants can create invoices"
    ON invoices FOR INSERT
    WITH CHECK (
        auth.uid() = consultant_id
        AND get_my_role() = ANY (ARRAY['individual'::user_role, 'agency_admin'::user_role, 'agency_member'::user_role, 'admin'::user_role])
    );

CREATE POLICY "Consultants can update invoices"
    ON invoices FOR UPDATE
    USING (auth.uid() = consultant_id OR get_my_role() = 'admin');

-- ============================================
-- MESSAGES
-- ============================================

CREATE POLICY "Users see their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages read"
    ON messages FOR UPDATE
    USING (auth.uid() = recipient_id);

-- ============================================
-- DOCUMENTS
-- ============================================

CREATE POLICY "Users see documents they uploaded or are on their case"
    ON documents FOR SELECT
    USING (
        auth.uid() = uploaded_by
        OR auth.uid() = client_id
        OR EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = documents.case_id
              AND (c.consultant_id = auth.uid() OR c.client_id = auth.uid())
        )
        OR get_my_role() = 'admin'
    );

CREATE POLICY "Authenticated users can upload documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================

CREATE POLICY "Agency announcements visible to agency members"
    ON announcements FOR SELECT
    USING (
        is_global = true
        OR agency_id = get_my_agency_id()
        OR auth.uid() = author_id
        OR get_my_role() = 'admin'
    );

CREATE POLICY "Agency admins can manage announcements"
    ON announcements FOR ALL
    USING (get_my_role() = ANY (ARRAY['agency_admin'::user_role, 'admin'::user_role]));

-- ============================================
-- REVIEWS
-- ============================================

CREATE POLICY "Reviews are publicly viewable"
    ON reviews FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Clients can write reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id AND get_my_role() = 'client');

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE POLICY "Users see their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- WISHLIST
-- ============================================

CREATE POLICY "Clients see their own wishlist"
    ON wishlist FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Clients manage their own wishlist"
    ON wishlist FOR ALL
    USING (auth.uid() = client_id);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE POLICY "Admins view audit logs"
    ON audit_logs FOR SELECT
    USING (get_my_role() = 'admin');

CREATE POLICY "System insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- RESOURCES
-- ============================================

CREATE POLICY "Authenticated see public resources"
    ON resources FOR SELECT
    USING (is_public = true AND auth.role() = 'authenticated');

CREATE POLICY "Admins manage resources"
    ON resources FOR ALL
    USING (get_my_role() = 'admin');

-- ============================================
-- PLATFORM SETTINGS
-- ============================================

CREATE POLICY "Admins manage platform settings"
    ON platform_settings FOR ALL
    USING (get_my_role() = 'admin');

-- ============================================
-- CONSULTANT AVAILABILITY
-- ============================================

CREATE POLICY "Anyone can view active availability"
    ON consultant_availability FOR SELECT
    USING (is_active = true);

CREATE POLICY "Consultants manage own availability"
    ON consultant_availability FOR ALL
    USING (consultant_id = auth.uid());

-- ============================================
-- CASE ACTIVITIES
-- ============================================

CREATE POLICY "Case participants can see activities"
    ON case_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM cases c
            WHERE c.id = case_activities.case_id
              AND (c.client_id = auth.uid() OR c.consultant_id = auth.uid())
        )
    );

CREATE POLICY "Consultants and clients can add activities"
    ON case_activities FOR INSERT
    WITH CHECK (author_id = auth.uid());

-- ============================================
-- CLIENT INVITATIONS
-- ============================================

CREATE POLICY "Consultants manage own invitations"
    ON client_invitations FOR ALL
    USING (consultant_id = auth.uid());

CREATE POLICY "Clients can view invitations sent to them"
    ON client_invitations FOR SELECT
    USING (
        client_id = auth.uid()
        OR client_email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

-- ============================================
-- PROMOTIONS
-- ============================================

CREATE POLICY "Authenticated see active promos"
    ON promotions FOR SELECT
    USING (status = 'active' AND auth.role() = 'authenticated');

CREATE POLICY "Admins manage promotions"
    ON promotions FOR ALL
    USING (get_my_role() = 'admin');
