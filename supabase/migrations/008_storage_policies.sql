-- ============================================
-- VISAX — Storage bucket policies (mig 008)
-- Buckets are created in the Supabase dashboard; this migration just
-- pins their visibility + RLS. Safe to re-apply.
--
-- After applying, verify in dashboard:
--   - avatars:         public = TRUE
--   - documents:       public = FALSE
--   - account-exports: public = FALSE  (created on first export)
-- ============================================

-- ============================================
-- 1. BUCKET VISIBILITY
--    `public` here flips whether the URL pattern works without a signed
--    token. Avatars are intended for public consumption (marketplace
--    cards); documents and exports must always go through signed URLs.
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars',         'avatars',         TRUE),
    ('documents',       'documents',       FALSE),
    ('account-exports', 'account-exports', FALSE)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ============================================
-- 2. AVATARS BUCKET — public read, owner write
--    Object path convention: `${userId}/avatar.${ext}` (see storage.js).
--    Public can read; only the owner can write/delete their avatar.
-- ============================================

DROP POLICY IF EXISTS "Avatar files are publicly readable"     ON storage.objects;
DROP POLICY IF EXISTS "Users upload own avatar"                 ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar"                 ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar"                 ON storage.objects;

CREATE POLICY "Avatar files are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- 3. DOCUMENTS BUCKET — private, signed URLs only
--    Object path convention: `${userId}/${timestamp}-${name}`.
--    Read access: uploader + admins. Frontend must use createSignedUrl();
--    bare public URLs return 400.
-- ============================================

DROP POLICY IF EXISTS "Users read own documents"           ON storage.objects;
DROP POLICY IF EXISTS "Admins read every document"         ON storage.objects;
DROP POLICY IF EXISTS "Users upload own documents"         ON storage.objects;
DROP POLICY IF EXISTS "Users delete own documents"         ON storage.objects;

CREATE POLICY "Users read own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Admins read every document"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND get_my_role() = 'admin'
    );

CREATE POLICY "Users upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users delete own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Legal/platform documents live under `legal/*` in the documents bucket.
-- Admin-only — UI uses uploadLegalDoc() which prefixes the path.
CREATE POLICY "Admins manage legal documents"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'documents'
        AND name LIKE 'legal/%'
        AND get_my_role() = 'admin'
    )
    WITH CHECK (
        bucket_id = 'documents'
        AND name LIKE 'legal/%'
        AND get_my_role() = 'admin'
    );

-- Legal documents are publicly readable so footer links resolve without
-- auth — they're meant to be public anyway.
CREATE POLICY "Legal documents are publicly readable"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND name LIKE 'legal/%'
    );

-- ============================================
-- 4. ACCOUNT-EXPORTS BUCKET — owner read via signed URLs
--    Path convention: `${userId}/export-${timestamp}.zip`. Edge function
--    creates exports with service_role; users access via short-TTL signed
--    URL.
-- ============================================

DROP POLICY IF EXISTS "Users read own exports" ON storage.objects;

CREATE POLICY "Users read own exports"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'account-exports'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- INSERT/UPDATE/DELETE intentionally not granted — only service_role
-- (edge functions) can write exports.
