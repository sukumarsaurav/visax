import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function testStripe(creds: Record<string, string>) {
  const res = await fetch('https://api.stripe.com/v1/account', {
    headers: { Authorization: `Bearer ${creds.secret_key}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Invalid API key')
  }
  const data = await res.json()
  return {
    account_name: data.settings?.dashboard?.display_name || data.display_name || 'Stripe Account',
    mode: data.livemode ? 'Live' : 'Test',
    country: data.country,
    email: data.email,
  }
}

async function testHubSpot(creds: Record<string, string>) {
  const res = await fetch('https://api.hubapi.com/account-info/v3/details', {
    headers: { Authorization: `Bearer ${creds.api_key}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Invalid API key')
  }
  const data = await res.json()
  return {
    account_name: data.companyName || 'HubSpot Account',
    portal_id: data.portalId,
    time_zone: data.timeZone,
    currency: data.companyCurrency,
  }
}

async function testZoom(creds: Record<string, string>) {
  // Zoom uses Server-to-Server OAuth with Account ID + Client ID + Client Secret
  const tokenRes = await fetch('https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' + creds.account_id, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${creds.api_key}:${creds.api_secret}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  if (!tokenRes.ok) throw new Error('Invalid Zoom credentials')
  const token = await tokenRes.json()

  const userRes = await fetch('https://api.zoom.us/v2/users/me', {
    headers: { Authorization: `Bearer ${token.access_token}` },
  })
  if (!userRes.ok) throw new Error('Could not fetch Zoom user info')
  const user = await userRes.json()
  return {
    account_name: `${user.first_name} ${user.last_name}`.trim() || 'Zoom Account',
    email: user.email,
    account_type: user.type === 1 ? 'Basic' : user.type === 2 ? 'Pro' : 'Business',
  }
}

async function testMailchimp(creds: Record<string, string>) {
  // Mailchimp API key format: {key}-{dc}
  const dc = creds.api_key?.split('-').pop()
  if (!dc) throw new Error('Invalid Mailchimp API key format. Expected: key-dc (e.g. abc123-us1)')

  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/`, {
    headers: {
      Authorization: 'Basic ' + btoa(`anystring:${creds.api_key}`),
    },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || 'Invalid API key')
  }
  const data = await res.json()

  const listsRes = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists?count=1`, {
    headers: { Authorization: 'Basic ' + btoa(`anystring:${creds.api_key}`) },
  })
  const lists = listsRes.ok ? await listsRes.json() : null

  return {
    account_name: data.account_name,
    email: data.email,
    total_subscribers: data.total_subscribers || 0,
    lists_count: lists?.total_items || 0,
    data_center: dc,
  }
}

async function testSlack(creds: Record<string, string>) {
  if (!creds.webhook_url?.startsWith('https://hooks.slack.com/')) {
    throw new Error('Invalid Slack webhook URL. Must start with https://hooks.slack.com/')
  }
  const res = await fetch(creds.webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '✅ VisaX admin panel connected successfully to Slack.' }),
  })
  if (!res.ok && res.status !== 200) throw new Error('Webhook URL is invalid or inactive')
  const text = await res.text()
  if (text !== 'ok') throw new Error(`Slack returned: ${text}`)
  return { account_name: 'Slack Workspace', webhook_url: creds.webhook_url }
}

async function testGoogleAnalytics(creds: Record<string, string>) {
  const id = creds.measurement_id?.trim()
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) {
    throw new Error('Invalid Measurement ID format. Expected: G-XXXXXXXXXX')
  }
  // GA4 Data API validation requires OAuth — we validate the format and store
  return {
    account_name: 'Google Analytics',
    measurement_id: id,
    note: 'Measurement ID format valid. Data API requires OAuth for deeper validation.',
  }
}

const TESTERS: Record<string, (c: Record<string, string>) => Promise<Record<string, unknown>>> = {
  stripe: testStripe,
  hubspot: testHubSpot,
  zoom: testZoom,
  mailchimp: testMailchimp,
  slack: testSlack,
  analytics: testGoogleAnalytics,
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { integration_id } = await req.json()
    if (!integration_id || !TESTERS[integration_id]) {
      return new Response(JSON.stringify({ error: 'Unknown integration' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Read credentials from platform_settings using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: row } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    const creds = row?.value?.[integration_id] || {}

    const result = await TESTERS[integration_id](creds)

    // Store the connection info back
    const updatedIntegrations = {
      ...(row?.value || {}),
      [integration_id]: {
        ...creds,
        enabled: true,
        connected_info: result,
        last_verified: new Date().toISOString(),
      },
    }
    await supabase
      .from('platform_settings')
      .upsert({ key: 'integrations', value: updatedIntegrations }, { onConflict: 'key' })

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
