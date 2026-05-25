-- ============================================================
-- 017_profile_slugs.sql
--
-- Auto-generate SEO-friendly slugs for consultant profiles.
-- Format: firstname-lastname-city  (e.g. "priya-sharma-mumbai")
-- Slugs are unique — a numeric suffix is appended when needed.
-- ============================================================

-- ── Helper: build a base slug from full_name + city ──────────
CREATE OR REPLACE FUNCTION profile_slug_base(p_name TEXT, p_city TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_raw  TEXT;
    v_slug TEXT;
BEGIN
    -- Combine name and city, lower-case
    v_raw := lower(
        coalesce(trim(p_name), '') ||
        CASE WHEN coalesce(trim(p_city), '') <> '' THEN '-' || trim(p_city) ELSE '' END
    );

    -- Strip anything that is not a-z, 0-9, space, or hyphen
    v_slug := regexp_replace(v_raw, '[^a-z0-9 \-]', '', 'g');

    -- Collapse runs of spaces/hyphens into a single hyphen
    v_slug := regexp_replace(v_slug, '[\s\-]+', '-', 'g');

    -- Trim leading/trailing hyphens
    v_slug := trim(both '-' from v_slug);

    RETURN v_slug;
END;
$$;

-- ── Main: generate a unique slug, appending -2/-3/... if needed ─
CREATE OR REPLACE FUNCTION generate_unique_profile_slug(
    p_profile_id UUID,
    p_name       TEXT,
    p_city       TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_base    TEXT;
    v_slug    TEXT;
    v_suffix  INT := 1;
BEGIN
    v_base := profile_slug_base(p_name, p_city);

    IF v_base = '' OR v_base IS NULL THEN
        -- Fallback to partial UUID when name is blank
        RETURN 'consultant-' || left(p_profile_id::TEXT, 8);
    END IF;

    v_slug := v_base;

    -- Find a slug not in use by another profile
    WHILE EXISTS (
        SELECT 1 FROM profiles
        WHERE slug = v_slug
          AND id <> p_profile_id
    ) LOOP
        v_suffix := v_suffix + 1;
        v_slug   := v_base || '-' || v_suffix;
    END LOOP;

    RETURN v_slug;
END;
$$;

-- ── Trigger function: set slug on approved profiles ───────────
CREATE OR REPLACE FUNCTION set_profile_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only generate for professionals (not client accounts)
    IF NEW.role NOT IN ('individual', 'agency_admin', 'agency_member') THEN
        RETURN NEW;
    END IF;

    -- Re-generate when name / city changes OR when newly approved
    IF (
        TG_OP = 'INSERT' OR
        OLD.full_name IS DISTINCT FROM NEW.full_name OR
        OLD.city      IS DISTINCT FROM NEW.city      OR
        (OLD.application_status IS DISTINCT FROM NEW.application_status
         AND NEW.application_status = 'approved')
    ) THEN
        NEW.slug := generate_unique_profile_slug(NEW.id, NEW.full_name, NEW.city);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_slug ON profiles;
CREATE TRIGGER profiles_set_slug
    BEFORE INSERT OR UPDATE OF full_name, city, application_status
    ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_profile_slug();

-- ── Backfill: populate slug for all approved professionals ────
UPDATE profiles
SET slug = generate_unique_profile_slug(id, full_name, city)
WHERE role IN ('individual', 'agency_admin', 'agency_member')
  AND (slug IS NULL OR slug = '');

-- ── Index ─────────────────────────────────────────────────────
-- slug column already has UNIQUE declared in 001 migration.
-- Ensure btree index exists for fast lookups by slug.
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(slug);

COMMENT ON COLUMN profiles.slug IS
    'SEO-friendly URL segment: firstname-lastname-city (auto-generated, unique). '
    'Used for /consultant/:slug canonical URLs.';
