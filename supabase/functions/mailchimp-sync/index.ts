import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, full_name, role, action = 'subscribe' } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: row } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    const mcSettings = row?.value?.mailchimp
    if (!mcSettings?.enabled || !mcSettings?.api_key) {
      return new Response(JSON.stringify({ skipped: true, reason: 'Mailchimp not connected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dc = mcSettings.api_key.split('-').pop()
    const listId = mcSettings.list_id
    if (!listId) throw new Error('No Mailchimp audience ID configured')

    const authHeader = 'Basic ' + btoa(`anystring:${mcSettings.api_key}`)
    const emailHash = await crypto.subtle.digest('MD5',
      new TextEncoder().encode(email.toLowerCase())
    ).then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''))

    const [firstName, ...lastParts] = (full_name || '').split(' ')
    const lastName = lastParts.join(' ')

    const body: Record<string, unknown> = {
      email_address: email,
      status_if_new: action === 'subscribe' ? 'subscribed' : 'unsubscribed',
      status: action === 'subscribe' ? 'subscribed' : 'unsubscribed',
      merge_fields: {
        FNAME: firstName || '',
        LNAME: lastName || '',
      },
      tags: [role || 'user', 'visax-platform'],
    }

    // PUT upserts — adds if new, updates if exists
    const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${emailHash}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail || err.title || 'Mailchimp sync failed')
    }

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, id: data.id, status: data.status }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
