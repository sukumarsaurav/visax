import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://immizy.in'

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, consultantName, message, token, expiresAt } = await req.json()

        if (!to || !token) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const inviteUrl = `${SITE_URL}/accept-invite?token=${token}`
        const expireDate = new Date(expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited to Immizy</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <tr>
          <td style="background:#4F46E5;padding:32px 40px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:12px 16px;">
                  <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">I</span>
                </td>
                <td style="padding-left:12px;">
                  <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Immizy</p>
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.75);font-weight:500;">Client Portal</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">You've been invited!</h1>
            <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
              <strong style="color:#334155;">${consultantName}</strong> has invited you to access your immigration case through the Immizy Client Portal.
            </p>

            ${message ? `
            <!-- Personal message -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#f8fafc;border-left:3px solid #4F46E5;border-radius:0 8px 8px 0;padding:16px 20px;">
                  <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;font-style:italic;">"${message}"</p>
                  <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;font-weight:600;">— ${consultantName}</p>
                </td>
              </tr>
            </table>
            ` : ''}

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="${inviteUrl}" style="display:inline-block;background:#4F46E5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;">
                    Accept Invitation &rarr;
                  </a>
                </td>
              </tr>
            </table>

            <!-- What you get -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#334155;text-transform:uppercase;letter-spacing:0.5px;">Through your portal you can:</p>
                <table cellpadding="0" cellspacing="0">
                  <tr><td style="padding:4px 0;font-size:13px;color:#475569;">&#x2713;&nbsp; View your case status and timeline</td></tr>
                  <tr><td style="padding:4px 0;font-size:13px;color:#475569;">&#x2713;&nbsp; Upload documents securely</td></tr>
                  <tr><td style="padding:4px 0;font-size:13px;color:#475569;">&#x2713;&nbsp; Message your consultant directly</td></tr>
                  <tr><td style="padding:4px 0;font-size:13px;color:#475569;">&#x2713;&nbsp; Track your application progress</td></tr>
                </table>
              </td></tr>
            </table>

            <!-- Fallback URL -->
            <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">If the button doesn't work, copy and paste this link:</p>
            <p style="margin:0 0 24px;font-size:11px;color:#4F46E5;word-break:break-all;">${inviteUrl}</p>

            <p style="margin:0;font-size:12px;color:#94a3b8;">This invitation expires on <strong>${expireDate}</strong>. You'll be prompted to create an account or sign in.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">© 2024 Immizy · <a href="${SITE_URL}" style="color:#4F46E5;text-decoration:none;">immizy.in</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

        // Use Supabase Admin to send via auth system, or Resend if configured
        const resendApiKey = Deno.env.get('RESEND_API_KEY')

        if (resendApiKey) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Immizy <noreply@immizy.in>',
                    to: [to],
                    subject: `${consultantName} invited you to Immizy`,
                    html,
                }),
            })

            if (!res.ok) {
                const err = await res.text()
                throw new Error(`Resend error: ${err}`)
            }
        } else {
            // Fallback: use Supabase Admin auth invite (sends Supabase's invite email)
            const supabaseAdmin = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            )
            const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(to, {
                redirectTo: inviteUrl,
                data: { invitation_token: token, consultant_name: consultantName },
            })
            if (error) throw new Error(error.message)
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err) {
        console.error('send-client-invitation error:', err)
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
