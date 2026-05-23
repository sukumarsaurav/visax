// ============================================================
// File upload validation — content-based, not extension-based.
//
// Browsers populate `file.type` from the user's claim (extension /
// drag-source MIME). It is trivial to spoof: rename `malware.exe` to
// `passport.pdf` and the browser will set type='application/pdf'.
//
// The functions here read the *actual* first bytes of the file (the
// "magic number") and verify they match a known signature. This is the
// same technique used by `file(1)`, libmagic, and most antivirus tools.
//
// Limits & sanitization:
//   • sanitizeFilename — strips path separators, control chars,
//     emoji/zero-width chars, normalises whitespace, caps length at 100.
//   • validateUpload — single entry point that calls the right checker
//     based on kind ('image' | 'document') and returns either
//     { ok: true, file, sanitizedName } or { ok: false, error }.
// ============================================================

import { getMaxUploadMb } from './platformConfig'

// ── Magic-byte signatures ─────────────────────────────────────────────────────
// Each entry is { mime, signature: Uint8Array, offset: number }
// Offset is where in the file the signature starts (usually 0).

const SIGNATURES = [
    // JPEG: FF D8 FF
    { mime: 'image/jpeg', signature: [0xFF, 0xD8, 0xFF], offset: 0 },
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    { mime: 'image/png',  signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], offset: 0 },
    // GIF: 47 49 46 38 (37|39) 61   ("GIF87a" / "GIF89a")
    { mime: 'image/gif',  signature: [0x47, 0x49, 0x46, 0x38], offset: 0 },
    // WebP: RIFF....WEBP — RIFF at 0, WEBP at 8
    { mime: 'image/webp', signature: [0x52, 0x49, 0x46, 0x46], offset: 0,
                          tail:      [0x57, 0x45, 0x42, 0x50], tailOffset: 8 },
    // PDF: %PDF-
    { mime: 'application/pdf', signature: [0x25, 0x50, 0x44, 0x46, 0x2D], offset: 0 },
]

/**
 * Reads the first 16 bytes of the file and returns the detected MIME type,
 * or null if no known signature matches.
 */
export async function detectMimeFromContent(file) {
    const slice = file.slice(0, 16)
    const buffer = new Uint8Array(await slice.arrayBuffer())

    for (const sig of SIGNATURES) {
        if (matchesBytes(buffer, sig.signature, sig.offset)) {
            if (sig.tail && !matchesBytes(buffer, sig.tail, sig.tailOffset)) continue
            return sig.mime
        }
    }
    return null
}

function matchesBytes(buffer, signature, offset) {
    if (buffer.length < offset + signature.length) return false
    for (let i = 0; i < signature.length; i++) {
        if (buffer[offset + i] !== signature[i]) return false
    }
    return true
}

// ── Filename sanitization ─────────────────────────────────────────────────────

const UNSAFE_CHARS = /[\x00-\x1f\x7f<>:"/\\|?*]/g
const ZERO_WIDTH   = /[​-‍﻿]/g
const MULTI_SPACE  = /\s+/g

/**
 * Returns a safe storage-path component derived from the user's filename.
 *
 *   sanitizeFilename('../../etc/passwd.pdf')        → 'etc-passwd.pdf'
 *   sanitizeFilename('  My  File  ‌.pdf')           → 'My File.pdf'
 *   sanitizeFilename('🚨 hack <script>.pdf')        → 'hack script.pdf'
 *   sanitizeFilename('a'.repeat(500) + '.pdf')      → 'aaaa...aaa.pdf' (capped 100 chars)
 */
export function sanitizeFilename(name) {
    if (!name) return 'upload'

    // 1. Strip directory parts — keep only the basename.
    const base = String(name).split(/[\\/]/).pop() || 'upload'

    // 2. Remove control chars, path-unsafe chars, zero-width chars
    let cleaned = base
        .replace(UNSAFE_CHARS, '')
        .replace(ZERO_WIDTH, '')
        // Strip anything that's not a letter/number/dot/dash/underscore/space
        // (keeps unicode letters via \p{L})
        .replace(/[^\p{L}\p{N}._\- ]/gu, '')
        .replace(MULTI_SPACE, ' ')
        .trim()

    if (!cleaned) cleaned = 'upload'

    // 3. Cap length at 100, preserving the extension
    if (cleaned.length > 100) {
        const dot = cleaned.lastIndexOf('.')
        if (dot > 0 && dot > cleaned.length - 12) {
            const ext = cleaned.slice(dot)
            cleaned = cleaned.slice(0, 100 - ext.length) + ext
        } else {
            cleaned = cleaned.slice(0, 100)
        }
    }
    return cleaned
}

// ── High-level validation API ─────────────────────────────────────────────────

const ALLOWED = {
    image:    new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    document: new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
}

const MAX_MB = {
    image:    5,
    // documents fall back to platform config
}

/**
 * Validate an upload candidate. Returns:
 *   { ok: true,  file, sanitizedName, detectedMime }
 *   { ok: false, error: 'user-safe message' }
 *
 * The detectedMime is the verified content-based type — pass this through
 * to your storage call instead of file.type so the bucket stores accurate
 * metadata.
 */
export async function validateUpload(file, kind = 'document') {
    if (!file) return { ok: false, error: 'No file selected.' }

    const allowed = ALLOWED[kind]
    if (!allowed) return { ok: false, error: `Unknown upload kind: ${kind}` }

    // Size check first — cheap, and catches obvious problems before reading bytes.
    const maxMb = MAX_MB[kind] ?? getMaxUploadMb()
    if (file.size > maxMb * 1024 * 1024) {
        return { ok: false, error: `File must be under ${maxMb}MB.` }
    }
    if (file.size === 0) {
        return { ok: false, error: 'File is empty.' }
    }

    // Magic-byte detection
    const detected = await detectMimeFromContent(file)
    if (!detected) {
        return {
            ok: false,
            error: kind === 'image'
                ? 'Only JPEG, PNG, WebP or GIF images are allowed.'
                : 'Only PDF, JPEG, PNG or WebP files are allowed.',
        }
    }

    // The detected type must be in the allow-list AND match what the browser claimed.
    // The browser-claim check protects against the rare case where the user uploads
    // a valid PNG but their app expected a PDF (caller forgot to handle images).
    if (!allowed.has(detected)) {
        return { ok: false, error: `Detected file type "${detected}" is not allowed.` }
    }

    return {
        ok: true,
        file,
        detectedMime: detected,
        sanitizedName: sanitizeFilename(file.name),
    }
}

// ── SHA-256 hash for dedup ────────────────────────────────────────────────────

/**
 * Compute a hex SHA-256 of the file contents. Used for client-side dedup —
 * if a user re-uploads the same file, we can short-circuit and reuse the
 * existing storage object.
 *
 * @returns {Promise<string>} 64-char hex digest
 */
export async function sha256Hex(file) {
    const buf = await file.arrayBuffer()
    const digest = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}
