// Verify a Razorpay payment signature and activate the user's subscription.
//
// Inputs (request body):
//   • razorpay_payment_id
//   • razorpay_order_id
//   • razorpay_signature
//   • userId
//   • planId
//   • idempotencyKey  — the same key the client used in create-razorpay-order
//
// Output:
//   { success: true, intent_id }
//   { success: false, error: '...' }
//
// Signature verification (Razorpay docs):
//   expected = HMAC_SHA256(order_id + '|' + payment_id, key_secret)
//   if (expected === razorpay_signature) → payment is authentic.
//
// This is the SOURCE OF TRUTH for payment success. We:
//   1. Verify the HMAC.
//   2. Confirm the order_id matches the one stored on the intent.
//   3. Atomically mark the intent as 'succeeded' (only if still 'pending'
//      — protects against a webhook racing this call).
//   4. Activate the user's subscription / agency plan in the DB.
//
// If we ever return success: true, the client is allowed to navigate to
// the success page. If we return false, the client must NOT proceed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Web Crypto HMAC — built into Deno, no external import needed.
// The deno.land/std node/crypto polyfill was deprecated in favour of jsr:@std/*
// and ultimately the platform-native SubtleCrypto API.
async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    userId,
    planId,
    idempotencyKey,
  } = body || {}

  for (const [k, v] of Object.entries({
    razorpay_payment_id, razorpay_order_id, razorpay_signature,
    userId, planId, idempotencyKey,
  })) {
    if (!v || typeof v !== 'string') return jsonError(`Missing or invalid field: ${k}`)
  }

  if (userId !== authUserId) return jsonError('User mismatch', 403)

  // Get the key_secret to compute the HMAC
  const creds = await getRazorpayCreds(admin)
  if (!creds) return jsonError('Razorpay is not configured', 500)

  // HMAC verification — constant-time comparison.
  const expected = await hmacSha256Hex(
    creds.key_secret,
    `${razorpay_order_id}|${razorpay_payment_id}`,
  )

  if (!timingSafeEqualHex(expected, razorpay_signature)) {
    // Signature mismatch = tampered request. Log and refuse.
    console.error('[verify-razorpay-payment] HMAC mismatch', {
      userId, planId, razorpay_order_id,
    })
    return jsonError('Payment signature is invalid', 400)
  }

  // Confirm the order_id matches the one we created for this intent.
  const { data: intent } = await admin
    .from('payment_intents')
    .select('id, status, metadata')
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle()

  if (!intent) return jsonError('Payment intent not found', 404)
  if (intent.metadata?.razorpay_order_id &&
      intent.metadata.razorpay_order_id !== razorpay_order_id) {
    return jsonError('Order ID mismatch', 400)
  }

  // Idempotent activation — only if still pending.
  // If the webhook already marked it 'succeeded', we still return success.
  if (intent.status === 'pending') {
    const { error: updateErr } = await admin
      .from('payment_intents')
      .update({
        status: 'succeeded',
        provider_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', intent.id)
      .eq('status', 'pending')

    if (updateErr) {
      // Another process beat us to it — re-read state to decide.
      const { data: fresh } = await admin
        .from('payment_intents')
        .select('status')
        .eq('id', intent.id)
        .single()
      if (fresh?.status !== 'succeeded') {
        return jsonError(`Could not mark intent: ${updateErr.message}`, 500)
      }
    }
  } else if (intent.status !== 'succeeded') {
    // 'failed' or 'cancelled' — refuse to flip back.
    return jsonError(`Intent is ${intent.status}; cannot verify`, 409)
  }

  // Activate the subscription — update the agency plan on the profile.
  await admin
    .from('profiles')
    .update({
      subscription_plan: planId,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
    })
    .eq('id', userId)

  return new Response(JSON.stringify({ success: true, intent_id: intent.id }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

async function getRazorpayCreds(admin: any): Promise<{ key_id: string; key_secret: string } | null> {
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
