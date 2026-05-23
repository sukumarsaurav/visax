// ============================================================
// sitemap-consultants — dynamic XML sitemap for consultant + agency profiles
//
// Why a function instead of a static file:
//   New consultants sign up daily. A static sitemap would go stale within
//   hours. This function reads `profiles_public` (RLS-safe; only approved
//   marketplace-visible profiles) + `agencies` and emits sitemap XML on
//   every request. Cloudflare/Vercel edge caches the response for 1 hour.
//
// URLs emitted:
//   • https://immizy.in/consultant/{uuid}    (one per approved consultant)
//   • https://immizy.in/agency/{uuid}        (one per agency)
//
// Format: sitemap protocol 0.9. Up to 50,000 URLs per sitemap (we'll cap
// at 25k to be safe; if/when the platform grows beyond that, switch to a
// sitemap index with month-partitioned children).
//
// Auth: `verify_jwt: false` — Googlebot must be able to fetch without auth.
// Rate limiting: the 1-hour Cache-Control header keeps Googlebot from
// hammering this endpoint. PostgREST query is read-only against an RLS view
// so worst case is light DB load.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BASE = 'https://immizy.in'
const MAX_URLS = 25_000  // sitemap spec allows 50k; 25k is the safe cap

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Service role — needed to bypass RLS on `agencies` (no public-read policy).
  // `profiles_public` is intentionally world-readable so we could use the anon
  // key for that, but consolidating to one client keeps the code simpler.
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Pull approved consultant profiles + agencies in parallel.
  const [{ data: consultants, error: cErr }, { data: agencies, error: aErr }] = await Promise.all([
    admin
      .from('profiles_public')
      .select('id, created_at')
      .eq('application_status', 'approved')
      .in('role', ['individual', 'agency_admin', 'agency_member'])
      .order('created_at', { ascending: false })
      .limit(MAX_URLS),
    admin
      .from('agencies')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(MAX_URLS),
  ])

  if (cErr || aErr) {
    console.error('[sitemap-consultants] DB error', { cErr, aErr })
    return new Response('Internal error', { status: 500 })
  }

  // ── Build XML ─────────────────────────────────────────────────────────────
  const parts: string[] = []
  parts.push('<?xml version="1.0" encoding="UTF-8"?>')
  parts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

  for (const p of consultants ?? []) {
    const lastmod = new Date(p.created_at).toISOString().split('T')[0]
    parts.push(
      `<url>` +
      `<loc>${xmlEscape(`${BASE}/consultant/${p.id}`)}</loc>` +
      `<lastmod>${lastmod}</lastmod>` +
      `<changefreq>weekly</changefreq>` +
      `<priority>0.7</priority>` +
      `</url>`
    )
  }

  for (const a of agencies ?? []) {
    const lastmod = new Date(a.created_at).toISOString().split('T')[0]
    parts.push(
      `<url>` +
      `<loc>${xmlEscape(`${BASE}/agency/${a.id}`)}</loc>` +
      `<lastmod>${lastmod}</lastmod>` +
      `<changefreq>weekly</changefreq>` +
      `<priority>0.7</priority>` +
      `</url>`
    )
  }

  parts.push('</urlset>')

  // Use a Headers object so Supabase's edge gateway preserves our values.
  // Plain object literals sometimes get coerced to defaults; Headers wins.
  const responseHeaders = new Headers(corsHeaders)
  responseHeaders.set('Content-Type', 'application/xml; charset=utf-8')
  // Crawlers hit the sitemap multiple times. Cache for 1 hour at edge.
  responseHeaders.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return new Response(parts.join('\n'), { headers: responseHeaders })
})
