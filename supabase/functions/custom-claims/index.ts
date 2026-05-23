// Supabase Auth Hook — "Customize Access Token" (JWT claims).
//
// Fires every time a JWT is issued (sign-in + refresh). Embeds the user's
// role and agency_id in app_metadata so RLS helpers (get_my_role,
// get_my_agency_id) can read them from the JWT without a DB round-trip.
//
// Register in: Supabase Dashboard → Authentication → Hooks → Customize Access Token Hook
// (Select this function; auth.users gets read access automatically.)
//
// Required env vars (set in Dashboard → Edge Functions → Secrets):
//   SUPABASE_URL                 — automatically provided
//   SUPABASE_SERVICE_ROLE_KEY    — must be added manually
//
// Payload shape (Supabase docs):
//   { user_id: string, claims: { app_metadata: {...}, user_metadata: {...}, ... } }
// Response shape:
//   { claims: { ...modified claims } }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ROLES_WITH_AGENCY = new Set(['agency_admin', 'agency_member'])

serve(async (req) => {
    try {
        const payload = await req.json()
        const userId: string | undefined = payload?.user_id
        const claims = payload?.claims ?? {}

        if (!userId) {
            return new Response(JSON.stringify({ claims }), {
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            { auth: { persistSession: false } },
        )

        // Read role from the profiles table (the source of truth).
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        const role: string | undefined = profile?.role

        // Only look up an agency_id if the role can possibly belong to one.
        // Avoids a wasted query for clients/individuals/admins.
        let agencyId: string | null = null
        if (role && ROLES_WITH_AGENCY.has(role)) {
            const { data: membership } = await supabase
                .from('agency_members')
                .select('agency_id')
                .eq('profile_id', userId)
                .eq('status', 'active')
                .limit(1)
                .maybeSingle()
            agencyId = membership?.agency_id ?? null
        }

        const updatedClaims = {
            ...claims,
            app_metadata: {
                ...(claims.app_metadata ?? {}),
                user_role: role ?? null,
                agency_id: agencyId,
            },
        }

        return new Response(JSON.stringify({ claims: updatedClaims }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        // Never fail the auth flow because of a hook error — fall back to
        // returning the original claims. RLS helpers will fall back to DB.
        console.error('custom-claims hook error:', err)
        try {
            const { claims } = await req.json().catch(() => ({ claims: {} }))
            return new Response(JSON.stringify({ claims: claims ?? {} }), {
                headers: { 'Content-Type': 'application/json' },
            })
        } catch {
            return new Response(JSON.stringify({ claims: {} }), {
                headers: { 'Content-Type': 'application/json' },
            })
        }
    }
})
