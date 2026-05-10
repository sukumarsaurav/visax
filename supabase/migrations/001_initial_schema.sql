-- ============================================
-- VISAX Immigration Marketplace - Supabase Schema
-- Version: 1.0.0
-- Date: 2026-01-19
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM (
    'client', 
    'consultant', 
    'agency_admin', 
    'agency_member', 
    'admin'
);

CREATE TYPE user_status AS ENUM (
    'active', 
    'inactive', 
    'pending_review', 
    'suspended'
);

CREATE TYPE language_proficiency AS ENUM (
    'native', 
    'fluent', 
    'conversational'
);

CREATE TYPE subscription_status AS ENUM (
    'active', 
    'past_due', 
    'cancelled', 
    'trialing'
);

CREATE TYPE plan_type AS ENUM (
    'individual', 
    'agency'
);

CREATE TYPE billing_period AS ENUM (
    'monthly', 
    'yearly'
);

CREATE TYPE team_member_status AS ENUM (
    'active', 
    'pending', 
    'away'
);

CREATE TYPE team_member_availability AS ENUM (
    'available', 
    'in_meeting', 
    'on_leave'
);

CREATE TYPE case_status AS ENUM (
    'initiated', 
    'collecting_docs', 
    'under_review', 
    'action_required', 
    'submitted', 
    'interview_set', 
    'approved', 
    'rejected'
);

CREATE TYPE document_status AS ENUM (
    'not_requested', 
    'pending', 
    'received'
);

CREATE TYPE activity_type AS ENUM (
    'status_change', 
    'document_upload', 
    'reminder_sent', 
    'note_added', 
    'message_sent'
);

CREATE TYPE appointment_mode AS ENUM (
    'video', 
    'in_person', 
    'phone'
);

CREATE TYPE appointment_status AS ENUM (
    'pending', 
    'confirmed', 
    'upcoming', 
    'completed', 
    'cancelled', 
    'no_show'
);

CREATE TYPE invoice_status AS ENUM (
    'pending', 
    'paid', 
    'overdue', 
    'cancelled'
);

CREATE TYPE payment_status AS ENUM (
    'pending', 
    'succeeded', 
    'failed', 
    'refunded'
);

CREATE TYPE promo_status AS ENUM (
    'active', 
    'expiring_soon', 
    'expired'
);

CREATE TYPE announcement_priority AS ENUM (
    'low', 
    'normal', 
    'high'
);

-- ============================================
-- 1. CORE USER TABLES
-- ============================================

-- Users (linked to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    phone_code TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'client',
    status user_status NOT NULL DEFAULT 'pending_review',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- ============================================
-- 2. LOOKUP TABLES (Create early for FKs)
-- ============================================

-- Countries
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    flag_emoji TEXT,
    phone_code TEXT,
    is_origin BOOLEAN DEFAULT TRUE,
    is_destination BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Visa Types
CREATE TABLE visa_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(country_id, code)
);

-- Expertise Areas
CREATE TABLE expertise_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Service Types
CREATE TABLE service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 3. SUBSCRIPTION PLANS (Create early for FKs)
-- ============================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan_type plan_type NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_period billing_period DEFAULT 'monthly',
    features JSONB DEFAULT '[]',
    max_cases_per_month INTEGER DEFAULT 5,
    max_team_members INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. AGENCY TABLES
-- ============================================

CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    registration_number TEXT,
    logo_url TEXT,
    website_url TEXT,
    phone TEXT,
    about TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    location_display TEXT,
    verified BOOLEAN DEFAULT FALSE,
    consultant_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    hourly_rate_from DECIMAL(10,2),
    subscription_plan_id UUID REFERENCES subscription_plans(id),
    subscription_status subscription_status DEFAULT 'trialing',
    renewal_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Agency Languages
CREATE TABLE agency_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    flag_emoji TEXT,
    UNIQUE(agency_id, language)
);

-- ============================================
-- 5. CONSULTANT PROFILES
-- ============================================

CREATE TABLE consultant_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    title TEXT,
    bio TEXT,
    years_experience TEXT,
    hourly_rate DECIMAL(10,2),
    website_url TEXT,
    linkedin_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    is_fast_responder BOOLEAN DEFAULT FALSE,
    response_time_hours INTEGER,
    rating_overall DECIMAL(3,2) DEFAULT 0,
    rating_quality DECIMAL(3,2) DEFAULT 0,
    rating_service DECIMAL(3,2) DEFAULT 0,
    rating_value DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    success_rate INTEGER DEFAULT 0,
    cases_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultant Languages
CREATE TABLE consultant_languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    language TEXT NOT NULL,
    proficiency language_proficiency DEFAULT 'conversational',
    flag_emoji TEXT,
    UNIQUE(consultant_id, language)
);

-- Consultant Expertise (many-to-many)
CREATE TABLE consultant_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    expertise_area_id UUID NOT NULL REFERENCES expertise_areas(id) ON DELETE CASCADE,
    UNIQUE(consultant_id, expertise_area_id)
);

-- ============================================
-- 6. CLIENT PROFILES
-- ============================================

CREATE TABLE client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    origin_country_id UUID REFERENCES countries(id),
    destination_country_id UUID REFERENCES countries(id),
    service_preferences TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. TEAM MEMBERS
-- ============================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT,
    specialty TEXT,
    status team_member_status DEFAULT 'pending',
    availability team_member_availability DEFAULT 'available',
    active_cases_count INTEGER DEFAULT 0,
    completed_cases_count INTEGER DEFAULT 0,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(agency_id, user_id)
);

-- ============================================
-- 8. SERVICES
-- ============================================

CREATE TABLE consultant_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    icon_color TEXT,
    category TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    is_global BOOLEAN DEFAULT FALSE,
    pricing_model TEXT,
    pricing_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (consultant_id IS NOT NULL OR agency_id IS NOT NULL)
);

-- Service Countries (many-to-many)
CREATE TABLE service_countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES consultant_services(id) ON DELETE CASCADE,
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    UNIQUE(service_id, country_id)
);

-- ============================================
-- 9. CASES
-- ============================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES users(id),
    consultant_id UUID REFERENCES consultant_profiles(id),
    agency_id UUID REFERENCES agencies(id),
    visa_type_id UUID REFERENCES visa_types(id),
    application_type TEXT NOT NULL,
    sub_type TEXT,
    target_country_id UUID REFERENCES countries(id),
    status case_status DEFAULT 'initiated',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    client_location TEXT,
    last_update_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Documents
CREATE TABLE case_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status document_status DEFAULT 'not_requested',
    file_url TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Activities (Timeline)
CREATE TABLE case_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    description TEXT,
    file_name TEXT,
    is_highlight BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Case Notes (Internal)
CREATE TABLE case_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- ============================================
-- 10. APPOINTMENTS
-- ============================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    consultant_id UUID REFERENCES consultant_profiles(id),
    agency_id UUID REFERENCES agencies(id),
    case_id UUID REFERENCES cases(id),
    appointment_type TEXT NOT NULL,
    case_type TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    mode appointment_mode DEFAULT 'video',
    status appointment_status DEFAULT 'pending',
    meeting_link TEXT,
    notes TEXT,
    is_free_intro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultant Availability (Weekly Schedule)
CREATE TABLE consultant_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE(consultant_id, day_of_week, start_time)
);

-- Blocked Slots (Specific dates)
CREATE TABLE blocked_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. FINANCIAL TABLES
-- ============================================

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES users(id),
    consultant_id UUID REFERENCES consultant_profiles(id),
    case_id UUID REFERENCES cases(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status invoice_status DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    stripe_payment_id TEXT,
    status payment_status DEFAULT 'pending',
    failure_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status subscription_status DEFAULT 'trialing',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    stripe_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR agency_id IS NOT NULL)
);

-- Usage Tracking
CREATE TABLE usage_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cases_created INTEGER DEFAULT 0,
    cases_limit INTEGER DEFAULT 5,
    team_members_count INTEGER DEFAULT 0,
    team_members_limit INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (user_id IS NOT NULL OR agency_id IS NOT NULL),
    UNIQUE(user_id, period_start),
    UNIQUE(agency_id, period_start)
);

-- Promotions
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    description TEXT,
    status promo_status DEFAULT 'active',
    valid_months INTEGER DEFAULT 1,
    redemption_count INTEGER DEFAULT 0,
    max_redemptions INTEGER,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. COMMUNICATION TABLES
-- ============================================

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID NOT NULL REFERENCES users(id),
    participant_2_id UUID NOT NULL REFERENCES users(id),
    case_id UUID REFERENCES cases(id),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id, case_id)
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    author_id UUID REFERENCES users(id),
    priority announcement_priority DEFAULT 'normal',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. REVIEWS & WISHLISTS
-- ============================================

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    consultant_id UUID REFERENCES consultant_profiles(id),
    agency_id UUID REFERENCES agencies(id),
    case_id UUID REFERENCES cases(id),
    service_type TEXT,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlists
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES consultant_profiles(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (consultant_id IS NOT NULL OR agency_id IS NOT NULL),
    UNIQUE(user_id, consultant_id),
    UNIQUE(user_id, agency_id)
);

-- ============================================
-- 14. ADMIN & PLATFORM TABLES
-- ============================================

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    is_public BOOLEAN DEFAULT TRUE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Platform Settings
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Agencies
CREATE INDEX idx_agencies_name ON agencies USING gin(name gin_trgm_ops);
CREATE INDEX idx_agencies_verified ON agencies(verified);
CREATE INDEX idx_agencies_rating ON agencies(rating DESC);

-- Consultant Profiles
CREATE INDEX idx_consultant_profiles_user_id ON consultant_profiles(user_id);
CREATE INDEX idx_consultant_profiles_agency_id ON consultant_profiles(agency_id);
CREATE INDEX idx_consultant_profiles_verified ON consultant_profiles(verified);
CREATE INDEX idx_consultant_profiles_rating ON consultant_profiles(rating_overall DESC);

-- Cases
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_cases_consultant_id ON cases(consultant_id);
CREATE INDEX idx_cases_agency_id ON cases(agency_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_number ON cases(case_number);

-- Appointments
CREATE INDEX idx_appointments_client_id ON appointments(client_id);
CREATE INDEX idx_appointments_consultant_id ON appointments(consultant_id);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Reviews
CREATE INDEX idx_reviews_consultant_id ON reviews(consultant_id);
CREATE INDEX idx_reviews_agency_id ON reviews(agency_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update last_update_at for cases
CREATE OR REPLACE FUNCTION update_case_last_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cases SET last_update_at = NOW() WHERE id = NEW.case_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update case timestamp on activity
CREATE TRIGGER tr_case_activity_update
AFTER INSERT ON case_activities
FOR EACH ROW EXECUTE FUNCTION update_case_last_update();

-- Trigger: Update case timestamp on document change
CREATE TRIGGER tr_case_document_update
AFTER INSERT OR UPDATE ON case_documents
FOR EACH ROW EXECUTE FUNCTION update_case_last_update();

-- Function: Update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET last_message_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update conversation on new message
CREATE TRIGGER tr_message_update_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Function: Update agency consultant count
CREATE OR REPLACE FUNCTION update_agency_consultant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE agencies SET consultant_count = consultant_count + 1 WHERE id = NEW.agency_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE agencies SET consultant_count = consultant_count - 1 WHERE id = OLD.agency_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update agency count on team member changes
CREATE TRIGGER tr_team_member_count
AFTER INSERT OR DELETE ON team_members
FOR EACH ROW EXECUTE FUNCTION update_agency_consultant_count();

-- Function: Update consultant ratings from reviews
CREATE OR REPLACE FUNCTION update_consultant_ratings()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE consultant_profiles SET
        rating_overall = (SELECT AVG(rating) FROM reviews WHERE consultant_id = NEW.consultant_id),
        review_count = (SELECT COUNT(*) FROM reviews WHERE consultant_id = NEW.consultant_id)
    WHERE id = NEW.consultant_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update ratings on new review
CREATE TRIGGER tr_review_update_ratings
AFTER INSERT ON reviews
FOR EACH ROW 
WHEN (NEW.consultant_id IS NOT NULL)
EXECUTE FUNCTION update_consultant_ratings();

-- Function: Generate case number
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(case_number, '-', 2) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM cases
    WHERE SPLIT_PART(case_number, '-', 1) = TO_CHAR(NOW(), 'YY');
    
    NEW.case_number := TO_CHAR(NOW(), 'YY') || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate case number
CREATE TRIGGER tr_generate_case_number
BEFORE INSERT ON cases
FOR EACH ROW
WHEN (NEW.case_number IS NULL)
EXECUTE FUNCTION generate_case_number();

-- Function: Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM invoices;
    
    NEW.invoice_number := 'INV-' || LPAD(seq_num::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate invoice number
CREATE TRIGGER tr_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE case_activities;
