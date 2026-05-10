import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { topic, start_time, duration_minutes = 60, agenda, booking_id } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: row } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'integrations')
      .single()

    const zoomSettings = row?.value?.zoom
    if (!zoomSettings?.enabled || !zoomSettings?.api_key) {
      throw new Error('Zoom is not connected. Go to Admin → Integrations to connect Zoom.')
    }

    // Get Server-to-Server OAuth token
    const tokenRes = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomSettings.account_id}`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${zoomSettings.api_key}:${zoomSettings.api_secret}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )
    if (!tokenRes.ok) throw new Error('Failed to get Zoom access token')
    const { access_token } = await tokenRes.json()

    // Create the meeting
    const meetingRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: topic || 'Visa Consultation',
        type: 2, // Scheduled meeting
        start_time: start_time || new Date(Date.now() + 3600000).toISOString(),
        duration: duration_minutes,
        agenda: agenda || 'Immigration consultation session',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
          auto_recording: 'none',
        },
      }),
    })
    if (!meetingRes.ok) {
      const err = await meetingRes.json()
      throw new Error(err.message || 'Failed to create Zoom meeting')
    }
    const meeting = await meetingRes.json()

    // Store meeting info on the booking if booking_id provided
    if (booking_id) {
      await supabase
        .from('bookings')
        .update({
          zoom_meeting_id: String(meeting.id),
          zoom_join_url: meeting.join_url,
          zoom_start_url: meeting.start_url,
        })
        .eq('id', booking_id)
    }

    return new Response(JSON.stringify({
      success: true,
      meeting_id: meeting.id,
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      password: meeting.password,
      topic: meeting.topic,
      start_time: meeting.start_time,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
