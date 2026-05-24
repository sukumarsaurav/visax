# Audit: `src/pages/auth/ForgotPasswordPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 79 · **Role gate:** none (public)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 4 | 1 |
| Fixed | 0 | 0 | 4 | 1 |

Notable: the reset redirect URL hardcodes `/reset-password`, but **no `/reset-password` route is registered in `App.jsx`**. Users clicking the magic link land on the 404 page.

---

## Findings

### F-FP01 · `redirectTo` points at a non-existent route → users land on 404 · 🟠 P1
**Where:** [src/contexts/AuthContext.jsx:88](src/contexts/AuthContext.jsx#L88) (page calls `resetPassword` which sets `redirectTo: \`${origin}/reset-password\``)

**What:** App.jsx has no `/reset-password` route. The email magic link sends users to `https://immizy.app/reset-password?...` → 404.

**Why it matters:** Password reset is broken end-to-end. Every user who clicks "Forgot password?" hits a dead end after the email lands.

**Fix:** Either (a) add a `/reset-password` route that handles `supabase.auth.updateUser({ password })` after `detectSessionInUrl` resolves, or (b) change `redirectTo` to a route that already exists (e.g. `/login` with a flag) and prompt the user to set a new password there. Option (a) is the correct UX.

**Status:** documented — out of scope to land a new page in this audit, but tagging as the highest-priority auth issue.

---

### F-FP02 · Loose email regex (duplicates `isEmail`) · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/ForgotPasswordPage.jsx:16](src/pages/auth/ForgotPasswordPage.jsx#L16)

**What:** Same as F-L02. Replace with `isEmail`.

**Status:** fixed-in-this-audit.

---

### F-FP03 · Raw `err.message` shown in toast leaks Supabase internals · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/ForgotPasswordPage.jsx:22](src/pages/auth/ForgotPasswordPage.jsx#L22)

**What:** `toast.error(err.message)` shows raw provider messages like "User not found" — which doubles as a user-enumeration oracle. Supabase usually returns 200 for unknown emails to prevent this, but on rate-limit / network errors a raw message leaks.

**Fix:** Route through `friendlyError(err, 'Could not send reset email. Please try again.')`.

**Status:** fixed-in-this-audit.

---

### F-FP04 · No autocomplete + label association + ARIA · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/ForgotPasswordPage.jsx:52-58](src/pages/auth/ForgotPasswordPage.jsx#L52)

**Fix:** `autoComplete="email"`, `htmlFor`/`id` pair, `aria-invalid`/`aria-describedby`.

**Status:** fixed-in-this-audit.

---

### F-FP05 · No rate limiting / hint when Supabase 429s · 🟡 P2
**What:** Same as F-L06 — surface 429 to the user.

**Status:** documented.

---

### F-FP06 · Confirmation screen exposes the typed email even when no email exists · 🔵 P3
**Where:** [src/pages/auth/ForgotPasswordPage.jsx:35](src/pages/auth/ForgotPasswordPage.jsx#L35)

**What:** "We sent a password reset link to {email}" — this is intentional (don't reveal if account exists), but the phrasing is "We sent". A more honest, non-enumerating version: "If an account exists for {email}, a reset link is on the way." This is the standard non-enumeration UX copy.

**Fix:** Adjust copy.

**Status:** fixed-in-this-audit.
