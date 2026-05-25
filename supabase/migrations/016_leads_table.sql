-- ============================================================
-- 016_leads_table.sql
--
-- Stores inbound leads captured from homepage wizard,
-- city pages, and destination pages — before users create
-- an account.
--
-- These are matched to consultants by the admin or
-- automatically based on destination + visa_type.
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone         TEXT NOT NULL,
    email         TEXT,
    full_name     TEXT,
    destination   TEXT,              -- 'canada', 'australia', etc.
    visa_type     TEXT,              -- 'pr', 'work', 'student', etc.
    source        TEXT,              -- 'homepage_wizard', 'city_page_mumbai', etc.
    metadata      JSONB DEFAULT '{}',
    status        TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'matched', 'converted', 'closed')),
    assigned_to   UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- consultant assigned
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status      ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_destination ON leads(destination);
CREATE INDEX IF NOT EXISTS idx_leads_created_at  ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_leads_updated_at();

-- RLS: Leads are public-insert (no auth needed to submit),
--      but only admins and assigned consultants can read them.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a lead (no account needed)
CREATE POLICY "leads_public_insert" ON leads
    FOR INSERT WITH CHECK (true);

-- Admins can read all leads
CREATE POLICY "leads_admin_read" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Assigned consultant can read their own leads
CREATE POLICY "leads_consultant_read" ON leads
    FOR SELECT USING (assigned_to = auth.uid());

-- Admins can update all leads (e.g., change status, assign)
CREATE POLICY "leads_admin_update" ON leads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

COMMENT ON TABLE leads IS 'Inbound leads captured from homepage wizard, city pages, and SEO landing pages — before account creation.';
COMMENT ON COLUMN leads.source IS 'Where the lead came from: homepage_wizard, city_page_mumbai, destination_page_canada, etc.';
COMMENT ON COLUMN leads.status IS 'Lead lifecycle: new → contacted → matched (consultant assigned) → converted (booked) or closed';
