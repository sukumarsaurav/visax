/**
 * Trial Reminder Email Function
 *
 * Sends email reminders to users nearing the end of their trial:
 *   • Day 10: "You have 5 days left in your trial"
 *   • Day 15 (or less): "Your trial ends tomorrow" / "Your trial ends today"
 *
 * This function is designed to be called by a scheduled job (e.g., daily).
 * Each day it identifies users in their trial who are on day 10 or day 15,
 * and sends them a reminder email (if not already sent).
 *
 * Inputs (optional request body):
 *   • test_email    — (string, optional) Send a test email to this address instead of processing
 *
 * Output:
 *   { success: true, sent: number, errors: number }
 *   { success: false, error: '...' }
 *
 * Security:
 *   • This function requires the Supabase service role key (cannot be called from client)
 *   • Should be protected by an API key or only callable from internal services
 */

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

async function sendEmail(
  admin: any,
  to: string,
  subject: string,
  html: string,
  platformSettings: any
): Promise<boolean> {
  const email = platformSettings?.integrations?.email

  if (!email?.enabled) {
    console.error('Email integration is not enabled')
    return false
  }

  try {
    // Provider: Resend (preferred), SendGrid (fallback)
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
          subject,
          html,
        }),
      })
      if (!res.ok) {
        console.error(`Resend error: ${await res.text()}`)
        return false
      }
      return true
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
          subject,
          content: [{ type: 'text/html', value: html }],
        }),
      })
      if (!res.ok) {
        console.error(`SendGrid error: ${await res.text()}`)
        return false
      }
      return true
    } else {
      console.error('No supported email provider configured')
      return false
    }
  } catch (err) {
    console.error(`Error sending email: ${(err as Error).message}`)
    return false
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonError('Method not allowed', 405)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let body: any = {}
  try {
    const text = await req.text()
    if (text) body = JSON.parse(text)
  } catch {
    // Empty body is OK
  }

  // Test mode: send a test email and exit
  if (body.test_email) {
    const { data: settings } = await admin
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    const testHtml = `
      <h2>Immizy Trial Reminder — Test Email</h2>
      <p>This is a test email to verify your trial reminder system is working.</p>
      <p>If you received this, your email integration is configured correctly.</p>
    `

    const success = await sendEmail(
      admin,
      body.test_email,
      'Immizy Trial Reminder — Test',
      testHtml,
      settings?.value
    )

    return new Response(
      JSON.stringify({ success, message: success ? 'Test email sent' : 'Failed to send test email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Production mode: find users in trial and send reminders
  try {
    // Get platform email settings
    const { data: settings } = await admin
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    // Find users on day 10 of trial (5 days remaining)
    const now = new Date()
    const day10Cutoff = new Date(now)
    day10Cutoff.setDate(day10Cutoff.getDate() - 10)
    day10Cutoff.setHours(0, 0, 0, 0)

    const day10End = new Date(day10Cutoff)
    day10End.setDate(day10End.getDate() + 1)

    const { data: day10Users } = await admin
      .from('profiles')
      .select('id, email, full_name, trial_starts_at, trial_ends_at')
      .eq('role', 'individual')
      .eq('trial_expired', false)
      .gte('trial_starts_at', day10Cutoff.toISOString())
      .lt('trial_starts_at', day10End.toISOString())

    // Find users on day 15 of trial (0-1 days remaining)
    const day15Cutoff = new Date(now)
    day15Cutoff.setDate(day15Cutoff.getDate() - 15)
    day15Cutoff.setHours(0, 0, 0, 0)

    const day15End = new Date(day15Cutoff)
    day15End.setDate(day15End.getDate() + 1)

    const { data: day15Users } = await admin
      .from('profiles')
      .select('id, email, full_name, trial_starts_at, trial_ends_at')
      .eq('role', 'individual')
      .eq('trial_expired', false)
      .gte('trial_starts_at', day15Cutoff.toISOString())
      .lt('trial_starts_at', day15End.toISOString())

    let sent = 0
    let errors = 0

    // Process day 10 reminders
    for (const user of day10Users || []) {
      // Check if we already sent a day10 reminder
      const { data: existing } = await admin
        .from('trial_events')
        .select('id')
        .eq('profile_id', user.id)
        .eq('event_type', 'trial_day10_reminder_sent')
        .single()

      if (!existing) {
        const html = `
          <h2>Hi ${user.full_name || 'there'}!</h2>
          <p>You have <strong>5 days left</strong> in your Immizy free trial.</p>
          <p>To continue using Immizy after your trial ends, upgrade to one of our plans:</p>
          <ul>
            <li><strong>Solo Basic</strong> — Perfect for getting started (₹499/month)</li>
            <li><strong>Solo Pro</strong> — Our most popular plan (₹999/month)</li>
          </ul>
          <p>
            <a href="https://immizy.in/pricing" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Plans
            </a>
          </p>
          <p>Questions? <a href="https://immizy.in/support">Contact support</a></p>
        `

        const success = await sendEmail(
          admin,
          user.email,
          'Immizy Trial Reminder: 5 Days Left',
          html,
          settings?.value
        )

        if (success) {
          // Log the event
          await admin
            .from('trial_events')
            .insert({
              profile_id: user.id,
              event_type: 'trial_day10_reminder_sent',
              metadata: { sent_at: new Date().toISOString() },
            })
          sent++
        } else {
          errors++
        }
      }
    }

    // Process day 15 reminders
    for (const user of day15Users || []) {
      // Check if we already sent a day15 reminder
      const { data: existing } = await admin
        .from('trial_events')
        .select('id')
        .eq('profile_id', user.id)
        .eq('event_type', 'trial_day15_warning_sent')
        .single()

      if (!existing) {
        const daysLeft = Math.ceil(
          (new Date(user.trial_ends_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        let message = 'Your trial ends tomorrow'
        if (daysLeft === 0) message = 'Your trial ends today'
        else if (daysLeft < 0) continue // Already expired, skip

        const html = `
          <h2>Final Reminder: ${message}</h2>
          <p>Hi ${user.full_name || 'there'},</p>
          <p>${message}. Your Immizy free trial will expire at ${new Date(user.trial_ends_at).toLocaleDateString()}.</p>
          <p>
            <a href="https://immizy.in/pricing" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Upgrade Now
            </a>
          </p>
          <p>If you have any questions or need assistance, <a href="https://immizy.in/support">reach out to our support team</a>.</p>
        `

        const success = await sendEmail(
          admin,
          user.email,
          `Immizy Trial Reminder: ${message}`,
          html,
          settings?.value
        )

        if (success) {
          // Log the event
          await admin
            .from('trial_events')
            .insert({
              profile_id: user.id,
              event_type: 'trial_day15_warning_sent',
              metadata: { sent_at: new Date().toISOString(), days_left: daysLeft },
            })
          sent++
        } else {
          errors++
        }
      }
    }

    console.log(`Trial reminders: ${sent} sent, ${errors} errors`)

    return new Response(
      JSON.stringify({ success: true, sent, errors }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (err) {
    console.error('Error processing trial reminders:', err)
    return jsonError(`Processing error: ${(err as Error).message}`, 500)
  }
})
