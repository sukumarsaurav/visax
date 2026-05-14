-- ============================================
-- VISAX - Initial Schema (matches live DB)
-- Supabase project: ylraewihqxurhwexnanr
-- Applied via dashboard migrations starting 20260509192518
-- ============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM (
    'client',
    'individual',
    'agency_admin',
    'agency_member',
    'admin'
);

CREATE TYPE member_status AS ENUM (
    'active',
    'pending',
    'inactive',
    'away'
);

CREATE TYPE case_status AS ENUM (
    'draft',
    'in_progress',
    'under_review',
    'docs_pending',
    'action_required',
    'approved',
    'rejected',
    'closed'
);

CREATE TYPE appointment_type AS ENUM (
    'video',
    'phone',
    'in_person'
);

CREATE TYPE appointment_status AS ENUM (
    'upcoming',
    'completed',
    'cancelled',
    'no_show'
);

CREATE TYPE invoice_status AS ENUM (
    'draft',
    'pending',
    'paid',
    'overdue',
    'cancelled'
);

CREATE TYPE notification_type AS ENUM (
    'case_update',
    'appointment',
    'invoice',
    'message',
    'announcement',
    'system'
);

-- ============================================
-- SEQUENCES
-- ============================================

CREATE SEQUENCE IF NOT EXISTS case_number_seq    START 1000 INCREMENT 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000 INCREMENT 1;

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles (linked to Supabase Auth users)
CREATE TABLE profiles (
    id                              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email                           TEXT NOT NULL,
    full_name                       TEXT,
    avatar_url                      TEXT,
    phone                           TEXT,
    role                            user_role NOT NULL DEFAULT 'client',
    is_verified                     BOOLEAN DEFAULT FALSE,
    bio                             TEXT,
    country                         TEXT,
    timezone                        TEXT DEFAULT 'UTC',
    onboarding_completed            BOOLEAN DEFAULT FALSE,
    professional_onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    application_status              TEXT NOT NULL DEFAULT 'active'
                                        CHECK (application_status IN ('pending_review','approved','rejected','active')),
    languages                       TEXT[] DEFAULT '{}',
    years_experience                INTEGER DEFAULT 0,
    specializations                 TEXT[] DEFAULT '{}',
    notification_preferences        JSONB DEFAULT '{"push_all":true,"email_messages":true,"email_invoices":true,"email_appointments":true}',
    created_at                      TIMESTAMPTZ DEFAULT NOW(),
    updated_at                      TIMESTAMPTZ DEFAULT NOW()
);

-- Agencies
CREATE TABLE agencies (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL,
    slug              TEXT UNIQUE,
    logo_url          TEXT,
    description       TEXT,
    website           TEXT,
    phone             TEXT,
    email             TEXT,
    country           TEXT,
    is_verified       BOOLEAN DEFAULT FALSE,
    owner_id          UUID REFERENCES profiles(id),
    subscription_tier TEXT DEFAULT 'free',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Agency Members
CREATE TABLE agency_members (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id  UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role       TEXT DEFAULT 'member',
    specialty  TEXT,
    status     member_status DEFAULT 'pending',
    invited_by UUID REFERENCES profiles(id),
    joined_at  TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (agency_id, profile_id)
);

-- Services
CREATE TABLE services (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    agency_id        UUID REFERENCES agencies(id) ON DELETE SET NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    category         TEXT,
    price            NUMERIC,
    duration_minutes INTEGER DEFAULT 60,
    is_active        BOOLEAN DEFAULT TRUE,
    expertise_areas  TEXT[] DEFAULT '{}',
    target_countries TEXT[] DEFAULT '{}',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Cases
CREATE TABLE cases (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number         TEXT UNIQUE,
    title               TEXT NOT NULL,
    description         TEXT,
    visa_type           TEXT,
    destination_country TEXT,
    status              case_status DEFAULT 'draft',
    progress            INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority            TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    client_id           UUID NOT NULL REFERENCES profiles(id),
    consultant_id       UUID REFERENCES profiles(id),
    agency_id           UUID REFERENCES agencies(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title            TEXT NOT NULL,
    client_id        UUID NOT NULL REFERENCES profiles(id),
    consultant_id    UUID NOT NULL REFERENCES profiles(id),
    case_id          UUID REFERENCES cases(id),
    service_id       UUID REFERENCES services(id),
    type             appointment_type DEFAULT 'video',
    status           appointment_status DEFAULT 'upcoming',
    scheduled_at     TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link     TEXT,
    notes            TEXT,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number          TEXT UNIQUE,
    client_id               UUID NOT NULL REFERENCES profiles(id),
    consultant_id           UUID NOT NULL REFERENCES profiles(id),
    agency_id               UUID REFERENCES agencies(id),
    case_id                 UUID REFERENCES cases(id),
    service_id              UUID REFERENCES services(id),
    amount                  NUMERIC NOT NULL,
    currency                TEXT DEFAULT 'USD',
    status                  invoice_status DEFAULT 'draft',
    due_date                DATE,
    paid_at                 TIMESTAMPTZ,
    description             TEXT,
    payment_link            TEXT,
    stripe_payment_link_id  TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (direct sender/recipient — no conversations table)
CREATE TABLE messages (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id    UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID NOT NULL REFERENCES profiles(id),
    case_id      UUID REFERENCES cases(id),
    content      TEXT NOT NULL,
    is_read      BOOLEAN DEFAULT FALSE,
    read_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    file_path   TEXT NOT NULL,
    file_size   INTEGER,
    mime_type   TEXT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    case_id     UUID REFERENCES cases(id),
    client_id   UUID REFERENCES profiles(id),
    is_shared   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    priority   TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high')),
    author_id  UUID NOT NULL REFERENCES profiles(id),
    agency_id  UUID REFERENCES agencies(id),
    is_global  BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id    UUID NOT NULL REFERENCES profiles(id),
    consultant_id  UUID NOT NULL REFERENCES profiles(id),
    appointment_id UUID REFERENCES appointments(id),
    rating         INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (reviewer_id, appointment_id)
);

-- Notifications
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES profiles(id),
    type       notification_type DEFAULT 'system',
    title      TEXT NOT NULL,
    body       TEXT,
    is_read    BOOLEAN DEFAULT FALSE,
    link       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wishlist
CREATE TABLE wishlist (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id     UUID NOT NULL REFERENCES profiles(id),
    consultant_id UUID NOT NULL REFERENCES profiles(id),
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (client_id, consultant_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES profiles(id),
    action      TEXT NOT NULL,
    entity_type TEXT,
    entity_id   UUID,
    details     JSONB DEFAULT '{}',
    ip_address  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Resources
CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT DEFAULT 'General',
    file_url        TEXT,
    file_type       TEXT DEFAULT 'PDF',
    file_size_label TEXT,
    is_public       BOOLEAN DEFAULT TRUE,
    status          TEXT DEFAULT 'published' CHECK (status IN ('published','draft')),
    created_by      UUID REFERENCES profiles(id),
    download_count  INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Settings
CREATE TABLE platform_settings (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key         TEXT UNIQUE NOT NULL,
    value       JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_by  UUID REFERENCES profiles(id)
);

-- Consultant Availability (weekly schedule)
CREATE TABLE consultant_availability (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    weekday           SMALLINT NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
    start_time        TIME NOT NULL,
    end_time          TIME NOT NULL,
    consultation_type TEXT DEFAULT 'video' CHECK (consultation_type IN ('video','phone','in_person','any')),
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (consultant_id, weekday, start_time)
);

-- Case Activities (timeline)
CREATE TABLE case_activities (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id   UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    type      TEXT DEFAULT 'note'
                  CHECK (type IN ('note','status_change','document_uploaded','appointment_scheduled','message')),
    content   TEXT NOT NULL,
    metadata  JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Invitations
CREATE TABLE client_invitations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES profiles(id),
    client_email  TEXT NOT NULL,
    client_id     UUID REFERENCES profiles(id),
    case_id       UUID REFERENCES cases(id),
    status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired','revoked')),
    permissions   JSONB DEFAULT '{"view_status":true,"messaging":true,"upload_docs":true,"sign_contracts":false}',
    token         TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    message       TEXT,
    expires_at    TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Promotions
CREATE TABLE promotions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code             TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    description      TEXT,
    status           TEXT DEFAULT 'active' CHECK (status IN ('active','expiring_soon','expired','paused')),
    valid_months     INTEGER DEFAULT 1,
    redemption_count INTEGER DEFAULT 0,
    max_redemptions  INTEGER,
    expires_at       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRIGGERS: updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at     BEFORE UPDATE ON profiles     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at     BEFORE UPDATE ON agencies     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at     BEFORE UPDATE ON services     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at        BEFORE UPDATE ON cases        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at     BEFORE UPDATE ON invoices     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS: auto-generated numbers
-- ============================================

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.case_number := 'C-' || nextval('case_number_seq')::TEXT;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_case_number
    BEFORE INSERT ON cases
    FOR EACH ROW
    WHEN (NEW.case_number IS NULL)
    EXECUTE FUNCTION generate_case_number();

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION generate_invoice_number();

-- ============================================
-- TRIGGER: new auth user → profile
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role       user_role;
    v_app_status TEXT;
BEGIN
    v_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'client'::user_role
    );

    IF v_role IN ('individual', 'agency_admin') THEN
        v_app_status := 'pending_review';
    ELSE
        v_app_status := 'active';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, avatar_url, role, application_status, professional_onboarding_complete)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        v_role,
        v_app_status,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth hook trigger is created in Supabase dashboard on auth.users

-- ============================================
-- REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE case_activities;
