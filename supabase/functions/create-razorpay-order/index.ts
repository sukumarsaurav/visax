// Create a Razorpay order for an agency subscription.
//
// Inputs (request body):
//   • planId          — 'starter' | 'growth' | 'enterprise'
//   • userId          — the authenticated user's id (must match JWT.sub)
//   • idempotencyKey  — UUIDv4 from the client; dedups order creation
//
// Output:
//   { success: true, order_id, amount, currency, key_id }
//   { success: false, error: '...' }
//
// Idempotency:
//   We look up payment_intents by (user_id, idempotency_key). If a row
//   already has provider_payment_id set, we return the existing order
//   instead of charging twice.
//
// Security:
//   • The JWT must be present and validated.
//   • The userId in the body must match the JWT subject.
//   • The plan price is authoritative on the server — we never trust the
//     client's `amount` value.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Plan prices in INR. MUST match the UI in two places:
//   • src/pages/landing/PricingPage.jsx → plans[].monthlyPrice
//   • src/pages/auth/ProfessionalRegisterPage.jsx → agencyPlans[].price
// A mismatch here would charge the user a different amount than the UI
// promises — silent overcharge / undercharge is unacceptable.
const PLANS: Record<string, { name: string; price_inr: number }> = {
  starter:    { name: 'Starter',    price_inr:  4_999 },
  growth:     { name: 'Growth',     price_inr:  8_999 },
  enterprise: { name: 'Enterprise', price_inr: 14_999 },
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST')    return jsonError('Method not allowed', 405)

  // Authenticate caller
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return jsonError('Missing bearer token', 401)
  const jwt = authHeader.slice('Bearer '.length)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const { data: userRes, error: userErr } = await admin.auth.getUser(jwt)
  if (userErr || !userRes?.user) return jsonError('Unauthorized', 401)
  const authUserId = userRes.user.id

  let body: any
  try {
    body = await req.json()
  } catch {
    return jsonError('Invalid JSON body')
  }

  const { planId, userId, idempotencyKey } = body || {}
  if (!planId || !PLANS[planId]) return jsonError('Invalid planId')
  if (!userId)         return jsonError('Missing userId')
  if (!idempotencyKey) return jsonError('Missing idempotencyKey')
  if (userId !== authUserId) return jsonError('User mismatch', 403)

  // Validate the UUID shape of idempotencyKey before any DB write.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return jsonError('Invalid idempotencyKey format')
  }

  const plan = PLANS[planId]
  const amountInPaise = plan.price_inr * 100

  // Idempotency check — if this exact key already produced an order, return it.
  const { data: existing } = await admin
    .from('payment_intents')
    .select('id, metadata, status')
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()

  if (existing?.metadata?.razorpay_order_id) {
    const keyId = Deno.env.get('RAZORPAY_KEY_ID') ||
                  (await getRazorpayCreds(admin))?.key_id
    return new Response(JSON.stringify({
      success: true,
      order_id: existing.metadata.razorpay_order_id,
      amount:   amountInPaise,
      currency: 'INR',
      key_id:   keyId,
      reused:   true,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  // Get Razorpay credentials
  const creds = await getRazorpayCreds(admin)
  if (!creds) return jsonError('Razorpay is not configured', 500)

  // Create the order on Razorpay
  const auth = btoa(`${creds.key_id}:${creds.key_secret}`)
  const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount:   amountInPaise,
      currency: 'INR',
      // Razorpay supports a `receipt` (≤40 chars) and our own notes for audit.
      receipt:  `imzy_${userId.slice(0, 8)}_${Date.now().toString(36)}`.slice(0, 40),
      notes: {
        user_id: userId,
        plan_id: planId,
        idempotency_key: idempotencyKey,
      },
    }),
  })

  const order = await orderRes.json()
  if (!orderRes.ok) {
    return jsonError(order?.error?.description || 'Razorpay order creation failed', 502)
  }

  // Persist the order_id on the intent for the verify step.
  await admin
    .from('payment_intents')
    .update({
      metadata: {
        ...(existing?.metadata || {}),
        razorpay_order_id: order.id,
        plan_id: planId,
      },
    })
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)

  return new Response(JSON.stringify({
    success: true,
    order_id: order.id,
    amount:   amountInPaise,
    currency: 'INR',
    key_id:   creds.key_id,
  }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
})

async function getRazorpayCreds(admin: any): Promise<{ key_id: string; key_secret: string } | null> {
  // Prefer env vars (best practice) over DB row (which is for admin UI display).
  const envId     = Deno.env.get('RAZORPAY_KEY_ID')
  const envSecret = Deno.env.get('RAZORPAY_KEY_SECRET')
  if (envId && envSecret) return { key_id: envId, key_secret: envSecret }

  const { data } = await admin
    .from('platform_settings')
    .select('value')
    .eq('key', 'integrations')
    .single()

  const rz = data?.value?.razorpay
  if (!rz?.enabled || !rz?.key_id || !rz?.key_secret) return null
  return { key_id: rz.key_id, key_secret: rz.key_secret }
}
