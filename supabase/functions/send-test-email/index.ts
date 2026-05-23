// Send a test email via the platform's configured SMTP / provider.
// Used from Admin → Communication Settings to verify the email integration
// without sending a real transactional email.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

  // Authenticate caller and require admin role.
  const authHeader = req.headers.get('Authorization') || ''
  if (!authHeader.startsWith('Bearer ')) return jsonError('Missing bearer token', 401)
  const jwt = authHeader.slice('Bearer '.length)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const { data: userRes } = await admin.auth.getUser(jwt)
  if (!userRes?.user) return jsonError('Unauthorized', 401)

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userRes.user.id)
    .single()
  if (profile?.role !== 'admin') return jsonError('Admin only', 403)

  const { to } = await req.json().catch(() => ({}))
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return jsonError('Invalid recipient email')
  }

  // Read SMTP / provider settings from platform_settings
  const { data: row } = await admin
    .from('platform_settings')
    .select('value')
    .eq('key', 'integrations')
    .single()
  const email = row?.value?.email

  if (!email?.enabled) return jsonError('Email integration is not enabled')

  // Provider: Resend (preferred), SendGrid (fallback), or SMTP
  try {
    if (email.provider === 'resend' && email.resend_api_key) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${email.resend_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: email.from || 'Immizy <noreply@immizy.in>',
          to: [to],
          subject: 'Immizy — Test Email',
          html: `<p>This is a test email from your Immizy platform configuration.</p>
                 <p>If you received this, your email integration is working correctly.</p>`,
        }),
      })
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`)
    } else if (email.provider === 'sendgrid' && email.sendgrid_api_key) {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${email.sendgrid_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: email.from_email || 'noreply@immizy.in', name: email.from_name || 'Immizy' },
          subject: 'Immizy — Test Email',
          content: [{ type: 'text/html', value: '<p>Test email — your SendGrid configuration is working.</p>' }],
        }),
      })
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`)
    } else {
      return jsonError('No supported email provider configured')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return jsonError(`Failed to send: ${(err as Error).message}`, 502)
  }
})
