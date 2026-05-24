# Audit: `src/pages/auth/AcceptInvitePage.jsx`

**Audited:** 2026-05-24 · **LOC:** 411 · **Role gate:** none (public flow that gates on token + account)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 3 | 1 |
| Fixed | 0 | 0 | 1 | 1 |

The big concern is invite-binding: anyone holding the token can accept the invitation with **any** logged-in account, regardless of whether the invitation was sent to that email. Combined with the editable signin email, this is a soft account-grafting vector.

---

## Findings

### F-AI01 · Invite acceptance is not bound to the invited email · 🟠 P1
**Where:** [src/pages/auth/AcceptInvitePage.jsx:107-117](src/pages/auth/AcceptInvitePage.jsx#L107) (`handleSignIn`); [src/data/clientInvitationsRepo.js:51-56](src/data/clientInvitationsRepo.js#L51) (`accept`)

**What:** The page lets the user sign in with **any** email — `siEmail` is editable and pre-filled to the invitation's email but nothing enforces a match. After successful sign-in, `acceptAndRedirect(user.id)` calls `clientInvitationsRepo.accept(token, userId)` which unconditionally sets the invitation's `client_id` to whatever account is authenticated.

**Why it matters:** Forwarded or intercepted invite links can be claimed by an attacker's pre-existing account. That account then appears as the consultant's client, gaining visibility into messages, cases, documents, and meeting links sent through the platform.

**Threat model:** Email forwarding inside an org; mailing-list aliases; OAuth-linked inboxes; URL-stripped paste. The token is the secret, but the email is the intended binding.

**Fix:** Enforce the binding **server-side**. Either:
1. In the `accept` mutation, only allow it when `auth.email() = client_email` (RLS policy) — preferred.
2. Or have an RPC `accept_invitation(p_token)` that reads `auth.email()` and rejects mismatches with a clear error.

In the UI, also lock `siEmail` to `invitation.client_email` (read-only) so users don't accidentally sign in with the wrong account.

**Status:** documented — needs migration + RLS update + UI lock. RLS change is out of scope for inline fix.

---

### F-AI02 · Race condition between `fetchInvitation` and `useEffect` on `user` · 🟠 P1
**Where:** [src/pages/auth/AcceptInvitePage.jsx:48-52, 69-73](src/pages/auth/AcceptInvitePage.jsx#L48)

**What:** Two pathways try to call `acceptAndRedirect`:
- Effect at L48-52 triggers when `user` is set, `invitation` is loaded, and `step === 'auth'`.
- `fetchInvitation` at L69-73 directly calls `acceptAndRedirect` if `user` is already present.

If `fetchInvitation` resolves first and immediately runs `acceptAndRedirect`, that sets `step` to `'accepting'`. Good. But if the auth state was previously unloaded (loading=true) when `fetchInvitation` resolved and set `step='auth'`, *and then* auth resolves with a user, the effect fires `acceptAndRedirect` a second time. `accept()` is idempotent on the row update (status set to 'accepted', client_id set), but the page navigates twice and could create two browser-history entries.

**Why it matters:** UX flicker, double DB writes, and if the `accept` ever becomes more than idempotent (e.g., notification side-effect), double notifications.

**Fix:** Add a `acceptingRef = useRef(false)` guard, or only fire from the effect and remove the inline call. Also `[user, authLoading, invitation, step]` should include `setStep` — but more importantly the logic should be a single state machine.

**Status:** documented.

---

### F-AI03 · Password policy weaker than RegisterPage (just `minLength={8}`) · 🟡 P2
**Where:** [src/pages/auth/AcceptInvitePage.jsx:307](src/pages/auth/AcceptInvitePage.jsx#L307)

**What:** RegisterPage uses `checkPassword` (≥10 chars, 3 character classes, common-passwords blocklist, no-email-as-substring). This page only checks `minLength=8` via the HTML attribute. A client invited from a consultant can set "password" → fails on Supabase's own min 6 but passes the page guard easily.

**Why it matters:** Inconsistent posture across signup paths. Invited clients (the largest signup volume in a growing platform) get the weakest passwords.

**Fix:** Reuse `checkPassword(password, { email: invitation.client_email })` and surface the message inline.

**Status:** documented (needs careful UX since the existing flow is much terser).

---

### F-AI04 · Raw `signUpErr.message` / `signInErr.message` shown to user · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/AcceptInvitePage.jsx:94, 112](src/pages/auth/AcceptInvitePage.jsx#L94)

**What:** Like ForgotPasswordPage — provider errors are reflected verbatim. Pass through `friendlyError`.

**Status:** fixed-in-this-audit.

---

### F-AI05 · `token` taken from URL with no shape validation · 🟡 P2
**Where:** [src/pages/auth/AcceptInvitePage.jsx:22, 55](src/pages/auth/AcceptInvitePage.jsx#L22)

**What:** Token is whatever's in `?token=`. We pass it straight to `clientInvitationsRepo.getByToken(token)` which `eq('token', token).single()`. A massively long token (10MB string) gets sent over the wire. `single()` would error if 0 rows, but won't validate input shape.

**Fix:** Cap length to e.g. 256 chars; reject if it's not URL-safe base64 (`/^[A-Za-z0-9_-]{16,256}$/`). Tiny perf and DoS-hardening win.

**Status:** documented.

---

### F-AI06 · `<input>` for siEmail and password missing autocomplete + ARIA · 🔵 P3
**Where:** [src/pages/auth/AcceptInvitePage.jsx:286-365](src/pages/auth/AcceptInvitePage.jsx#L286)

**Status:** documented (low priority given F-AI01 will redesign the form).
