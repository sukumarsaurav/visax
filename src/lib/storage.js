// ============================================================
// Storage operations — uploads, downloads, deletes.
//
// All upload paths:
//   1. Validate via fileValidation (magic-byte + size + sanitize).
//   2. Use sanitised filenames in the storage path.
//   3. Are atomic: if a downstream step fails (DB write, etc.), the
//      uploaded blob is removed so we never leak orphaned files.
//   4. Return the *storage path*, not a URL — private buckets use
//      getSignedUrl at render time.
// ============================================================

import { supabase } from './supabase'
import { validateUpload, sanitizeFilename } from './fileValidation'

// ── Avatars (public bucket) ───────────────────────────────────────────────────

/**
 * Upload an avatar image and persist its URL on the profile.
 * Returns the public URL. If the profile UPDATE fails, the storage
 * object is rolled back so we never leave orphaned avatars.
 */
export async function uploadAvatar(file, userId) {
    const v = await validateUpload(file, 'image')
    if (!v.ok) throw new Error(v.error)

    // Stable filename so re-uploads overwrite the previous avatar.
    const ext = v.detectedMime.split('/')[1] || 'jpg'
    const path = `${userId}/avatar.${ext}`

    const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: v.detectedMime })
    if (upErr) throw upErr

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = data.publicUrl

    const { error: dbErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

    if (dbErr) {
        // Rollback the storage upload so we don't leak files.
        await supabase.storage.from('avatars').remove([path]).catch(() => {})
        throw dbErr
    }
    return publicUrl
}

// ── Documents (private bucket) ────────────────────────────────────────────────
//
// The `documents` bucket is private — never use getPublicUrl() on it.
// All file access must go through time-limited signed URLs (getSignedUrl).

/**
 * Upload a document file and return its storage path.
 *
 * @param {File} file
 * @param {string} userId
 * @param {object} [opts]
 * @param {(p:number)=>void} [opts.onProgress] — 0..1, fired during upload
 * @param {AbortSignal} [opts.signal] — abort the upload (component unmount)
 * @returns {Promise<{path: string, mime: string, name: string, size: number}>}
 */
export async function uploadDocument(file, userId, opts = {}) {
    const v = await validateUpload(file, 'document')
    if (!v.ok) throw new Error(v.error)

    const path = `${userId}/${Date.now()}-${v.sanitizedName}`

    // Supabase SDK doesn't expose progress, but we can fall back to a manual
    // fetch with XHR when onProgress is provided. For now we use the SDK and
    // only fire progress 0 → 1 around the call.
    opts.onProgress?.(0)
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const { error } = await supabase.storage
        .from('documents')
        .upload(path, file, {
            upsert: false,
            contentType: v.detectedMime,
        })

    if (opts.signal?.aborted) {
        // If we were aborted after the upload completed, clean up.
        await supabase.storage.from('documents').remove([path]).catch(() => {})
        throw new DOMException('Aborted', 'AbortError')
    }

    if (error) throw error
    opts.onProgress?.(1)

    return {
        path,
        mime: v.detectedMime,
        name: v.sanitizedName,
        size: file.size,
    }
}

/**
 * Backwards-compatible wrapper that returns only the path.
 * Prefer `uploadDocument` directly — it returns the full metadata bundle.
 */
export async function uploadDocumentToPath(file, userId, opts) {
    const result = await uploadDocument(file, userId, opts)
    return result.path
}

/**
 * Generate a time-limited signed URL for a private document.
 *
 * @param {string} path          Storage path as stored in the DB
 * @param {number} [expiresIn]   Lifetime in seconds (default: 3 600 = 1 hour)
 * @returns {Promise<string>}    Signed URL
 */
export async function getSignedUrl(path, expiresIn = 3600) {
    const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, expiresIn)
    if (error) throw error
    return data.signedUrl
}

/** Hard-delete a document file from storage. */
export async function removeDocumentFile(path) {
    const { error } = await supabase.storage.from('documents').remove([path])
    if (error) throw error
}

/**
 * Upload a platform legal doc (Terms / Privacy) to a fixed key — overwrites
 * any previous version. Returns the public URL.
 * Legal docs are served via the public `legal/*` policy (migration 008).
 *
 * Admin-only; the RLS policy enforces this.
 */
export async function uploadLegalDoc(file, key) {
    const v = await validateUpload(file, 'document')
    if (!v.ok) throw new Error(v.error)
    if (v.detectedMime !== 'application/pdf') {
        throw new Error('Legal documents must be PDF files.')
    }

    // Sanitise the key to prevent path injection (e.g. key = '../public/index.html')
    const safeKey = sanitizeFilename(key).replace(/[^a-zA-Z0-9-]/g, '-')
    const path = `legal/${safeKey}-${Date.now()}.pdf`

    const { error } = await supabase.storage
        .from('documents')
        .upload(path, file, { upsert: true, contentType: 'application/pdf' })
    if (error) throw error

    const { data } = supabase.storage.from('documents').getPublicUrl(path)
    return data.publicUrl
}

// ── Legacy validators (kept for callers that don't use validateUpload yet) ────

import { getMaxUploadMb } from './platformConfig'

const ALLOWED_DOC_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_IMG_SIZE_MB = 5

/** @deprecated Use validateUpload(file, 'document') from lib/fileValidation. */
export function validateDocFile(file) {
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
        return 'Only PDF, JPEG, PNG or WebP files are allowed.'
    }
    const maxMb = getMaxUploadMb()
    if (file.size > maxMb * 1024 * 1024) {
        return `File must be under ${maxMb}MB.`
    }
    return null
}

/** @deprecated Use validateUpload(file, 'image') from lib/fileValidation. */
export function validateImageFile(file) {
    if (!ALLOWED_IMG_TYPES.includes(file.type)) {
        return 'Only JPEG, PNG, WebP or GIF images are allowed.'
    }
    if (file.size > MAX_IMG_SIZE_MB * 1024 * 1024) {
        return `Image must be under ${MAX_IMG_SIZE_MB}MB.`
    }
    return null
}
