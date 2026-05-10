import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { invoice_id, amount, currency = 'usd', description, customer_email } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get Stripe credentials
    const { data: row } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    const stripeSettings = row?.value?.stripe
    if (!stripeSettings?.enabled || !stripeSettings?.secret_key) {
      throw new Error('Stripe is not connected. Go to Admin → Integrations to connect Stripe.')
    }

    const secretKey = stripeSettings.secret_key

    // Create a Stripe Payment Link via the API
    // Step 1: Create a price (one-time)
    const priceRes = await fetch('https://api.stripe.com/v1/prices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        currency,
        unit_amount: String(Math.round(amount * 100)), // stripe uses cents
        'product_data[name]': description || `Invoice ${invoice_id}`,
      }),
    })
    if (!priceRes.ok) {
      const err = await priceRes.json()
      throw new Error(err.error?.message || 'Failed to create Stripe price')
    }
    const price = await priceRes.json()

    // Step 2: Create a Payment Link
    const linkRes = await fetch('https://api.stripe.com/v1/payment_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'line_items[0][price]': price.id,
        'line_items[0][quantity]': '1',
        ...(customer_email ? { 'customer_creation': 'always' } : {}),
        'metadata[invoice_id]': invoice_id || '',
      }),
    })
    if (!linkRes.ok) {
      const err = await linkRes.json()
      throw new Error(err.error?.message || 'Failed to create payment link')
    }
    const link = await linkRes.json()

    // Store the payment link URL back on the invoice
    if (invoice_id) {
      await supabase
        .from('invoices')
        .update({ payment_link: link.url })
        .eq('id', invoice_id)
    }

    return new Response(JSON.stringify({ success: true, url: link.url, payment_link_id: link.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
