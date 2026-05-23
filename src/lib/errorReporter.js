// ============================================================
// Immizy observability — error reporting + Core Web Vitals
//
// Zero runtime dependencies:
//   • Errors  → structured JSON envelope → VITE_SENTRY_DSN endpoint
//   • Vitals  → PerformanceObserver (LCP, CLS, INP, TTFB)
//   • Queue   → sendBeacon (fire-and-forget, survives page unloads)
//   • Rate    → max 50 reports / 60 s to prevent flood on logic loops
//
// When you're ready to graduate to the real Sentry SDK:
//   npm i @sentry/react @sentry/vite-plugin
//   Replace init/report/setUser with Sentry equivalents — call-sites don't change.
// ============================================================

const DSN = import.meta.env?.VITE_SENTRY_DSN
const ENV = import.meta.env?.MODE ?? 'development'
const RELEASE = import.meta.env?.VITE_RELEASE ?? 'unknown'

let initialized = false

// --- Rate limiter -------------------------------------------------
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 50
let _rateCount = 0
let _rateResetAt = Date.now() + RATE_WINDOW_MS

function _withinRate() {
    const now = Date.now()
    if (now > _rateResetAt) {
        _rateCount = 0
        _rateResetAt = now + RATE_WINDOW_MS
    }
    if (_rateCount >= RATE_MAX) return false
    _rateCount++
    return true
}

// --- User context -------------------------------------------------
let _user = null

/**
 * Tag all subsequent reports with user context.
 * Call this from AuthContext once the profile is loaded.
 *
 * @param {{ id: string, email?: string, role?: string }|null} user
 */
export function setUser(user) {
    _user = user
}

// --- Transport ----------------------------------------------------
function _send(payload) {
    if (!DSN || !_withinRate()) return
    try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        if (navigator.sendBeacon?.(DSN, blob)) return
        // Fallback for environments where sendBeacon isn't available (e.g. tests).
        fetch(DSN, { method: 'POST', body: blob, keepalive: true }).catch(() => {})
    } catch {
        // Reporter must never throw — swallow silently.
    }
}

function _envelope(type, data) {
    return {
        type,              // 'error' | 'message' | 'vital'
        ts: Date.now(),
        env: ENV,
        release: RELEASE,
        url: typeof window !== 'undefined' ? window.location.href : '',
        ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        user: _user,
        ...data,
    }
}

// --- Public API ---------------------------------------------------

/**
 * Report a caught error with optional structured context.
 *
 * @param {unknown} err
 * @param {object}  [extra]
 */
export function report(err, extra = {}) {
    if (ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[errorReporter]', err, extra)
    }
    _send(_envelope('error', {
        message: err instanceof Error ? err.message : String(err),
        stack:   err instanceof Error ? err.stack   : undefined,
        extra,
    }))
}

/**
 * Send a non-error message / breadcrumb (e.g. "user submitted form",
 * "payment initiated"). Useful for reconstructing event sequences.
 *
 * @param {string} message
 * @param {object} [extra]
 */
export function reportMessage(message, extra = {}) {
    _send(_envelope('message', { message, extra }))
}

// --- Initialisation -----------------------------------------------

/**
 * Call once at app boot (before first render).
 * Installs global error hooks and starts Web Vitals collection.
 */
export function initErrorReporter() {
    if (initialized) return
    initialized = true

    if (!DSN) {
        if (ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.info('[errorReporter] inactive — set VITE_SENTRY_DSN to enable')
        }
        return
    }

    // --- Global JS error hooks ------------------------------------
    window.addEventListener('error', (e) => {
        report(e.error ?? new Error(e.message), {
            source: 'window.onerror',
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
        })
    })
    window.addEventListener('unhandledrejection', (e) => {
        const err = e.reason instanceof Error ? e.reason : new Error(String(e.reason))
        report(err, { source: 'unhandledrejection' })
    })

    // --- Core Web Vitals via PerformanceObserver ------------------
    // We do NOT import `web-vitals` to keep the bundle lean. The
    // PerformanceObserver API covers the same signals.

    // LCP — Largest Contentful Paint
    _observeVital('largest-contentful-paint', (entries) => {
        const last = entries[entries.length - 1]
        _sendVital('LCP', last.startTime, last.element?.tagName)
    })

    // CLS — Cumulative Layout Shift (accumulate across all sessions)
    let _cls = 0
    _observeVital('layout-shift', (entries) => {
        for (const e of entries) {
            if (!e.hadRecentInput) _cls += e.value
        }
    })
    // Flush CLS on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            _sendVital('CLS', _cls)
        }
    }, { once: true })

    // INP — Interaction to Next Paint (Chrome 96+)
    _observeVital('event', (entries) => {
        for (const e of entries) {
            if (e.duration > 200) {
                _sendVital('INP', e.duration, e.target?.tagName)
            }
        }
    }, { durationThreshold: 16 })

    // TTFB — Time to First Byte
    const navEntries = performance.getEntriesByType('navigation')
    if (navEntries.length) {
        const nav = navEntries[0]
        _sendVital('TTFB', nav.responseStart - nav.requestStart)
    }
}

// Helper: safe PerformanceObserver wrapper
function _observeVital(type, cb, opts = {}) {
    try {
        const po = new PerformanceObserver((list) => cb(list.getEntries()))
        po.observe({ type, buffered: true, ...opts })
    } catch {
        // Browser doesn't support this entry type — silently skip.
    }
}

function _sendVital(name, value, target) {
    _send(_envelope('vital', { name, value: Math.round(value), target }))
}
