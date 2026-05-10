import { supabase } from './supabase'

const BASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function getAuthHeader() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
        apikey: ANON_KEY,
    }
}

async function callFunction(name, body) {
    const headers = await getAuthHeader()
    const res = await fetch(`${BASE_URL}/functions/v1/${name}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    })
    return res.json()
}

// Slack — fire-and-forget, never throws
export async function slackNotify(event, payload) {
    try {
        await callFunction('slack-notify', { event, payload })
    } catch {
        // silent — Slack notification failure should never break the UI
    }
}

// Stripe — create a payment link for an invoice
export async function createStripePaymentLink({ invoice_id, amount, currency, description, customer_email }) {
    return callFunction('stripe-payment-link', { invoice_id, amount, currency, description, customer_email })
}

// Zoom — create a meeting for a booking
export async function createZoomMeeting({ topic, start_time, duration_minutes, agenda, booking_id }) {
    return callFunction('zoom-create-meeting', { topic, start_time, duration_minutes, agenda, booking_id })
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
