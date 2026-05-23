import { supabase } from './supabase'
import { report } from './errorReporter'

const BASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// ── Auth header ───────────────────────────────────────────────────────────────

async function getAuthHeader() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
        apikey: ANON_KEY,
    }
}

// ── Retry helper ──────────────────────────────────────────────────────────────
//
// Edge functions are billed per invocation, but also subject to cold-start
// latency and transient network errors. A simple exponential backoff handles
// the common case without hammering rate limits.
//
// Strategy:
//   - Retry only on network errors or 5xx responses (i.e. not 4xx — those are
//     caller errors and retrying won't help).
//   - Max 3 attempts with jittered delays: ~200 ms, ~600 ms, ~1200 ms.
//   - Always resolves with `{ success, error, ... }` — never throws.

const RETRY_DELAYS_MS = [200, 600, 1200]

function jitter(ms) {
    // ±20 % jitter to avoid thundering herd across concurrent tabs
    return ms + ms * 0.2 * (Math.random() - 0.5)
}

async function callFunctionWithRetry(name, body, { retryable = true } = {}) {
    const headers = await getAuthHeader()
    const url = `${BASE_URL}/functions/v1/${name}`
    let lastError

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            })

            // 4xx — caller error, no retry
            if (res.status >= 400 && res.status < 500) {
                const json = await res.json().catch(() => ({}))
                return { success: false, error: json.error ?? `HTTP ${res.status}`, status: res.status }
            }

            // 5xx — server error, retry if allowed
            if (res.status >= 500) {
                lastError = new Error(`HTTP ${res.status} from ${name}`)
                if (!retryable || attempt === RETRY_DELAYS_MS.length) break
                await new Promise(r => setTimeout(r, jitter(RETRY_DELAYS_MS[attempt])))
                continue
            }

            // 2xx — success
            const json = await res.json().catch(() => ({}))
            return { success: true, ...json }
        } catch (err) {
            // Network error (offline, DNS failure, etc.)
            lastError = err
            if (!retryable || attempt === RETRY_DELAYS_MS.length) break
            await new Promise(r => setTimeout(r, jitter(RETRY_DELAYS_MS[attempt])))
        }
    }

    // All attempts exhausted
    report(lastError ?? new Error(`callFunction: ${name} failed`), { fn: name, attempt: RETRY_DELAYS_MS.length })
    return { success: false, error: 'Service temporarily unavailable. Please try again.' }
}

// Convenience alias — fire-and-forget doesn't need retry semantics
async function callFunction(name, body) {
    return callFunctionWithRetry(name, body, { retryable: false })
}

// ── Public helpers ────────────────────────────────────────────────────────────

// Slack — fire-and-forget, never throws
export async function slackNotify(event, payload) {
    try {
        await callFunction('slack-notify', { event, payload })
    } catch {
        // silent — Slack notification failure should never break the UI
    }
}

// Stripe — create a payment link for an invoice
// idempotency_key is forwarded so the edge function can deduplicate on Stripe's side too.
export async function createStripePaymentLink({ invoice_id, amount, currency, description, customer_email, idempotency_key }) {
    return callFunctionWithRetry('stripe-payment-link', {
        invoice_id, amount, currency, description, customer_email, idempotency_key,
    })
}

// Zoom — create a meeting for a booking (retryable — cold starts are common)
export async function createZoomMeeting({ topic, start_time, duration_minutes, agenda, booking_id }) {
    return callFunctionWithRetry('zoom-create-meeting', {
        topic, start_time, duration_minutes, agenda, booking_id,
    })
}

// Razorpay — create an order (called from ProfessionalRegisterPage)
// Exposed so callers can use supabase.functions.invoke directly for streaming
// progress, but edge cases like network drops should use this helper.
export async function createRazorpayOrder(body) {
    return callFunctionWithRetry('create-razorpay-order', body)
}

// Mailchimp — sync a user to the audience
export async function mailchimpSync({ email, full_name, role, action = 'subscribe' }) {
    try {
        await callFunction('mailchimp-sync', { email, full_name, role, action })
    } catch {
        // silent — marketing sync failure should never break the UI
    }
}

// Google Analytics — track an event
export function trackEvent(eventName, params = {}) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params)
    }
}
