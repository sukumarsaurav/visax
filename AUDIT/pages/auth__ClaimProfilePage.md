# Audit: `src/pages/auth/ClaimProfilePage.jsx`

**Audited:** 2026-05-24 · **LOC:** 364 · **Role gate:** none (public; token-gated)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 4 | 1 |
| Fixed | 0 | 0 | 1 | 1 |

The flow is reasonable — token → preview → password → claim — but several integrity gaps could let an opportunist claim a profile they shouldn't.

---

## Findings

### F-CP01 · "Done" CTA links to `/dashboard` which doesn't exist · 🟠 P1 → fixed-in-this-audit
**Where:** [src/pages/auth/ClaimProfilePage.jsx:350](src/pages/auth/ClaimProfilePage.jsx#L350)

**What:** `<Link to="/dashboard">Go to Dashboard</Link>`. There is no `/dashboard` route in `App.jsx`. After claiming, the user clicks a button and hits 404.

**Fix:** Use `useAuth().getDashboardPath()` for the destination (the user is now authenticated and has a role).

**Status:** fixed-in-this-audit.

---

### F-CP02 · Token in URL query string — leaks to referers, analytics, browser history · 🟠 P1
**Where:** [src/pages/auth/ClaimProfilePage.jsx:19](src/pages/auth/ClaimProfilePage.jsx#L19)

**What:** Claim tokens grant ownership of an immigration consultant's professional profile. Putting them in `?token=` means:
- The token is sent in the `Referer` header to any third-party request the page makes (image CDN, GA, fonts) until the user navigates away.
- It persists in browser history and screenshots.
- If the page errors and the URL is shared in a support ticket, the secret leaks.

**Why it matters:** A consultant who forwards a support ticket with the URL has just given their account away.

**Fix:**
- Set `Referrer-Policy: no-referrer-when-downgrade` or stricter at the HTML level (already partly handled via Vercel headers — verify).
- Strip the token from the URL after the lookup: `window.history.replaceState({}, '', '/claim-profile')`. Keep the token in component state only.
- Long term: move to a hash fragment (`#token=`) which never hits the network.

**Status:** documented.

---

### F-CP03 · Password policy is `minLength={8}` — weaker than RegisterPage's `checkPassword` · 🟡 P2
**Where:** [src/pages/auth/ClaimProfilePage.jsx:67, 113, 289](src/pages/auth/ClaimProfilePage.jsx#L67)

**Same as F-AI03.** Replace with `checkPassword(pw, { email: profile.email })`.

**Status:** documented.

---

### F-CP04 · No max-length on token input — pasting huge text is sent to RPC · 🟡 P2
**Where:** [src/pages/auth/ClaimProfilePage.jsx:182-188](src/pages/auth/ClaimProfilePage.jsx#L182)

**Fix:** `maxLength={256}`.

**Status:** documented.

---

### F-CP05 · `setStep('confirm_email')` only fires when `signupData.session` is null, but the flow shows no "I've confirmed, continue" button · 🟡 P2
**Where:** [src/pages/auth/ClaimProfilePage.jsx:91-94, 326-337](src/pages/auth/ClaimProfilePage.jsx#L91)

**What:** When email confirmation is required, the user sees "Check your email" — then what? Clicking the magic link re-loads the page with `?token=...` + an authenticated session, which the `useEffect` correctly handles by going to `set_password`. But this only works **if the original page is reopened**, not if the magic link opens a fresh tab. The state machine breaks: the new tab has the token URL and goes to `'set_password'`, but the user is told to "come back here" — confusing.

**Fix:** The magic-link landing page should reliably resume the flow regardless of which tab opens it. Also add a "Already confirmed? Continue →" button that calls `lookupToken` + `runClaim` against the new session.

**Status:** documented.

---

### F-CP06 · Avatar `<img>` from unclaimed profile is not sanitized · 🟡 P2
**Where:** [src/pages/auth/ClaimProfilePage.jsx:220](src/pages/auth/ClaimProfilePage.jsx#L220)

**What:** `<img src={profile.avatar_url}>` — if an admin's bulk-import allows arbitrary strings, a malicious URL like `javascript:` or `data:text/html` would never run as an image (browsers reject), but a tracking-pixel URL pointing to attacker infrastructure *would* leak the visitor's IP and viewer fingerprint on every claim attempt.

**Fix:** Route avatar URLs through `safeHref()` (which currently allows http/https), or restrict to a known storage origin (`storage.supabase.co/...`).

**Status:** documented.

---

### F-CP07 · `lookupToken(tokenFromUrl)` fires immediately for any URL token, before auth check · 🔵 P3 → fixed-in-this-audit
**Where:** [src/pages/auth/ClaimProfilePage.jsx:37-48](src/pages/auth/ClaimProfilePage.jsx#L37)

**What:** Minor — the order is "check session, branch on whether we go to set_password OR look up token". If the lookup fires but session arrives a tick later, the user briefly sees the preview before being switched. Cosmetic but visible.

**Fix:** Show a unified spinner until `detectSession()` resolves; only render branches afterwards.

**Status:** fixed-in-this-audit — added `mounting` boolean to render a spinner during the first detect-session tick.
