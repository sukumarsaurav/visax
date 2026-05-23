// ============================================================
// Pure, dependency-free validators for forms and URL params.
//
// The goal is to fail fast on the client (with helpful messages) for
// things that would otherwise hit the database. RLS is the real
// authority — these are guard-rails, not security.
// ============================================================

// ── UUIDs ─────────────────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** True if the input looks like a v1-v5 UUID. */
export function isUuid(s) {
    return typeof s === 'string' && UUID_RE.test(s)
}

/**
 * Guard a route param. Returns the UUID if valid, else null.
 * Use in pages that take `:id` route params before any DB query:
 *
 *   const { id } = useParams()
 *   const safeId = requireUuid(id)
 *   if (!safeId) return <NotFound />
 */
export function requireUuid(s) {
    return isUuid(s) ? s : null
}

// ── Email ─────────────────────────────────────────────────────────────────────
// Pragmatic RFC 5322 subset — strict enough to catch typos, loose enough
// to accept anything an SMTP server would actually deliver to.

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export function isEmail(s) {
    return typeof s === 'string' && s.length <= 254 && EMAIL_RE.test(s)
}

// ── Phone ─────────────────────────────────────────────────────────────────────
// E.164 lite — between 7 and 15 digits after stripping non-digits.

export function isPhone(s) {
    if (typeof s !== 'string') return false
    const digits = s.replace(/\D/g, '')
    return digits.length >= 7 && digits.length <= 15
}

// ── URLs ──────────────────────────────────────────────────────────────────────

/**
 * True if `s` is an http(s) URL on a public host.
 * Rejects javascript:, data:, file:, and bare localhost.
 */
export function isHttpUrl(s) {
    if (typeof s !== 'string') return false
    try {
        const u = new URL(s)
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return false
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return false
        return true
    } catch {
        return false
    }
}

// ── Passwords ─────────────────────────────────────────────────────────────────

/**
 * Returns { ok: true } or { ok: false, error: string }.
 *
 * Policy:
 *   • At least 10 characters
 *   • Contains at least one of: lowercase, uppercase, digit, symbol
 *     (NIST 800-63B doesn't require character classes, but this keeps a
 *      modest entropy floor)
 *   • Not on the top-N most-breached passwords list (small embedded set;
 *     for stronger protection we'd hit haveibeenpwned via k-anonymity)
 *   • Not equal to / contained in the user's email local-part
 */
const COMMON_PASSWORDS = new Set([
    'password', 'password1', '12345678', '123456789', 'qwertyuiop',
    'qwerty123', 'letmein', 'iloveyou', 'admin123', 'welcome1',
    'monkey', 'dragon', 'sunshine', 'princess', 'football',
    'master123', 'shadow', 'baseball', 'abcdefgh', 'starwars',
    'whatever', 'trustno1', 'passw0rd', '123qweasd',
])

export function checkPassword(pw, { email } = {}) {
    if (typeof pw !== 'string' || pw.length < 10) {
        return { ok: false, error: 'Password must be at least 10 characters.' }
    }
    if (pw.length > 128) {
        return { ok: false, error: 'Password must be under 128 characters.' }
    }

    const classes =
        (/[a-z]/.test(pw) ? 1 : 0) +
        (/[A-Z]/.test(pw) ? 1 : 0) +
        (/[0-9]/.test(pw) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(pw) ? 1 : 0)
    if (classes < 3) {
        return {
            ok: false,
            error: 'Password must include at least 3 of: lowercase, uppercase, number, symbol.',
        }
    }

    if (COMMON_PASSWORDS.has(pw.toLowerCase())) {
        return { ok: false, error: 'This password is too common. Please choose another.' }
    }

    if (email) {
        const local = String(email).split('@')[0].toLowerCase()
        if (local && pw.toLowerCase().includes(local)) {
            return { ok: false, error: 'Password cannot contain your email address.' }
        }
    }

    return { ok: true }
}

/** Coarse 0–4 strength score for live UX (weak/fair/good/strong). */
export function passwordStrength(pw) {
    if (!pw) return 0
    let score = 0
    if (pw.length >= 10) score++
    if (pw.length >= 14) score++
    const classes =
        (/[a-z]/.test(pw) ? 1 : 0) +
        (/[A-Z]/.test(pw) ? 1 : 0) +
        (/[0-9]/.test(pw) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(pw) ? 1 : 0)
    if (classes >= 2) score++
    if (classes >= 4) score++
    if (COMMON_PASSWORDS.has(pw.toLowerCase())) score = Math.min(score, 1)
    return Math.min(4, score)
}

// ── Misc safety ───────────────────────────────────────────────────────────────

/**
 * True if `n` is a finite, non-negative number suitable for currency /
 * counts. NaN, Infinity, negatives, and non-numbers are rejected.
 */
export function isPositiveNumber(n) {
    return typeof n === 'number' && Number.isFinite(n) && n >= 0
}
