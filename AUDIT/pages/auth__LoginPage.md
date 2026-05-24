# Audit: `src/pages/auth/LoginPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 114 · **Role gate:** none (public; redirects authed users via `AuthLayout`)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 5 | 2 |
| Fixed | 0 | 1 | 4 | 1 |

Solid baseline (generic error messages, password toggle is correctly `aria-label`'d, in-flight button disable). Issues clustered in input semantics (autocomplete, label association, validator reuse) and the post-login redirect lacks a path allow-list.

---

## Findings

### F-L01 · Open-redirect via `location.state.from` · 🟠 P1 → fixed-in-this-audit
**Where:** [src/pages/auth/LoginPage.jsx:42-43](src/pages/auth/LoginPage.jsx#L42)

**What:** `navigate(from)` blindly accepts any pathname previously stored in router state. A path that begins with `//`, `\\`, or `http:` will be interpreted as a protocol-relative URL by some history/router combinations, allowing an off-site jump. Even without scheme abuse, an attacker who tricks a user to first load `/login` from a crafted external link with controlled `state.from` could redirect through to an attacker-chosen in-app path (phishing tower onto trusted domain).

**Why it matters:** Phishing pivot. Account-takeover UX cue.

**Fix:** Allow-list the path to in-app routes — require leading `/` and no `//` / `\` after it; reject if it parses as an absolute URL.

```js
function safeNext(from) {
    if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) return null
    try { new URL(from); return null } catch { /* relative — good */ }
    return from === '/login' ? null : from
}
```

**Status:** fixed-in-this-audit — added `safeNext` helper and use `safeNext(location.state?.from?.pathname) ?? getDashboardPath()`.

---

### F-L02 · Loose email validator (regex `/\S+@\S+\.\S+/`) duplicates `lib/validators.isEmail` · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/LoginPage.jsx:23](src/pages/auth/LoginPage.jsx#L23)

**What:** The page rolls its own regex while `lib/validators.js` already exports a tested `isEmail`. The local regex accepts `a@b.c` (3 chars after `@`), spaces in the local-part (`\S` is permissive), and rejects valid corner cases.

**Why it matters:** Drift between page validators causes inconsistent error messages and lets bogus emails reach Supabase (which then rejects with a less-friendly error). RegisterPage already uses `isEmail` — login should too.

**Fix:** Import `isEmail` and replace the regex.

**Status:** fixed-in-this-audit.

---

### F-L03 · Inputs missing `autoComplete` (password managers can't save) · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/LoginPage.jsx:62-83](src/pages/auth/LoginPage.jsx#L62)

**What:** Neither input declares `autoComplete`. Password managers rely on `autoComplete="email"` + `autoComplete="current-password"` to populate sign-in vs sign-up correctly. Without it, users get an autofilled new-password (which fails) or no autofill at all.

**Why it matters:** Increases reuse of weak/typed passwords; raises support tickets ("password manager not working").

**Fix:** `autoComplete="email"` on email, `autoComplete="current-password"` on password.

**Status:** fixed-in-this-audit.

---

### F-L04 · `<label>` not associated with `<input>` (`htmlFor`/`id` missing) · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/LoginPage.jsx:61](src/pages/auth/LoginPage.jsx#L61), L74

**What:** Plain `<label>` without `htmlFor` means screen readers can't pair label↔control reliably, and clicking the label doesn't focus the input.

**Fix:** Add `id` to inputs, `htmlFor` to labels.

**Status:** fixed-in-this-audit.

---

### F-L05 · Errors not exposed to assistive tech (`aria-invalid`, `aria-describedby`) · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/LoginPage.jsx:62-69](src/pages/auth/LoginPage.jsx#L62)

**What:** Error `<p>` is visually red but has no ARIA wiring. A screen-reader user submitting the form hears no error.

**Fix:** Give error `<p>` an `id="login-email-error"`, set `aria-invalid={!!errors.email}` and `aria-describedby` to that id when present.

**Status:** fixed-in-this-audit.

---

### F-L06 · No client-side rate limiting / lockout signalling · 🟡 P2
**Where:** entire page

**What:** Supabase Auth applies its own rate limit, but the form gives no feedback that a limit was hit; the user can keep clicking Sign In. `useRateLimit` hook exists in `src/hooks/` but isn't wired here.

**Why it matters:** UX (no "wait 30s" hint after 5 failures) and a softer signal to deter brute-force attempts.

**Fix:** Detect `error.status === 429` from Supabase and surface "Too many attempts — try again in N seconds." Optionally wrap `signIn` in `useRateLimit({ key: \`login:${email}\`, max: 5, windowMs: 60_000 })`.

**Status:** documented (needs product input on the timing values).

---

### F-L07 · `errors.password = 'Invalid credentials'` leaks the field that's wrong · 🔵 P3 → fixed-in-this-audit
**Where:** [src/pages/auth/LoginPage.jsx:39](src/pages/auth/LoginPage.jsx#L39)

**What:** The toast says "Invalid email or password" (good — non-enumerating), but the inline error is set only on the password field, which subtly tells an attacker "the email exists, the password is wrong." Together with the toast it's a mild contradiction.

**Fix:** Set the inline error on a form-level slot (not field-specific) for credential failures.

**Status:** fixed-in-this-audit — replaced field-level password error with a form-level `errors.form`.

---

### F-L08 · `noValidate` on form is fine, but `type="email"` still triggers browser tooltip on `required` · 🔵 P3
**Where:** [src/pages/auth/LoginPage.jsx:59](src/pages/auth/LoginPage.jsx#L59)

**What:** Cosmetic — the form already correctly disables native validation via `noValidate`. Just noting that the existing code is correct and doesn't need the `required` attribute (which would re-enable native UI in some browsers).

**Status:** documented (no action).
