import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Pre-built message templates for each event type
function buildMessage(event: string, payload: Record<string, unknown>): Record<string, unknown> {
  const base = { username: 'VisaX Admin', icon_emoji: ':shield:' }

  switch (event) {
    case 'application.approved':
      return {
        ...base,
        text: `✅ *Application Approved*`,
        attachments: [{
          color: '#22c55e',
          fields: [
            { title: 'Applicant', value: payload.name, short: true },
            { title: 'Role', value: payload.role, short: true },
            { title: 'Approved by', value: payload.approved_by || 'Admin', short: true },
            { title: 'Time', value: new Date().toLocaleString(), short: true },
          ],
        }],
      }

    case 'application.rejected':
      return {
        ...base,
        icon_emoji: ':x:',
        text: `❌ *Application Rejected*`,
        attachments: [{
          color: '#ef4444',
          fields: [
            { title: 'Applicant', value: payload.name, short: true },
            { title: 'Role', value: payload.role, short: true },
            { title: 'Reason', value: payload.note || 'No reason provided', short: false },
          ],
        }],
      }

    case 'user.suspended':
      return {
        ...base,
        icon_emoji: ':warning:',
        text: `⚠️ *User Suspended*`,
        attachments: [{
          color: '#f59e0b',
          fields: [
            { title: 'User', value: payload.name, short: true },
            { title: 'Email', value: payload.email, short: true },
          ],
        }],
      }

    case 'payment.received':
      return {
        ...base,
        icon_emoji: ':moneybag:',
        text: `💰 *Payment Received*`,
        attachments: [{
          color: '#6366f1',
          fields: [
            { title: 'Client', value: payload.client, short: true },
            { title: 'Amount', value: `$${payload.amount} ${payload.currency || 'USD'}`, short: true },
            { title: 'Invoice', value: payload.invoice_number || 'N/A', short: true },
          ],
        }],
      }

    case 'new.registration':
      return {
        ...base,
        icon_emoji: ':tada:',
        text: `🎉 *New User Registered*`,
        attachments: [{
          color: '#8b5cf6',
          fields: [
            { title: 'Name', value: payload.name, short: true },
            { title: 'Email', value: payload.email, short: true },
            { title: 'Role', value: payload.role, short: true },
          ],
        }],
      }

    case 'announcement.published':
      return {
        ...base,
        icon_emoji: ':mega:',
        text: `📢 *New Announcement Published*`,
        attachments: [{
          color: '#0ea5e9',
          fields: [
            { title: 'Title', value: payload.title, short: false },
            { title: 'Audience', value: payload.is_global ? 'All Users' : 'Agency Only', short: true },
          ],
        }],
      }

    default:
      return { ...base, text: `VisaX event: ${event}`, attachments: [{ fields: Object.entries(payload).map(([k, v]) => ({ title: k, value: String(v), short: true })) }] }
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { event, payload } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: row } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    const slackSettings = row?.value?.slack
    if (!slackSettings?.enabled || !slackSettings?.webhook_url) {
      return new Response(JSON.stringify({ skipped: true, reason: 'Slack not connected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const message = buildMessage(event, payload || {})
    const res = await fetch(slackSettings.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    const text = await res.text()
    if (text !== 'ok') throw new Error(`Slack error: ${text}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
