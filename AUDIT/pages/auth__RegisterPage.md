# Audit: `src/pages/auth/RegisterPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 138 · **Role gate:** none (public via AuthLayout)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 4 | 2 |
| Fixed | 0 | 0 | 3 | 1 |

Already uses `isEmail` + `checkPassword` (good — login was the inconsistent one). Main gaps: password autocomplete hints, ARIA wiring, and fullName lacks an XSS-safety contract before it's rendered elsewhere.

---

## Findings

### F-R01 · Password fields missing `autoComplete="new-password"` · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/RegisterPage.jsx:77-94](src/pages/auth/RegisterPage.jsx#L77)

**What:** The non-password inputs get `autoComplete` (line 97), but the password & confirm fields fall through the `type === 'password'` branch with no autocomplete. Password managers will offer to save under "current-password" or skip the form entirely.

**Fix:** `autoComplete="new-password"` on both.

**Status:** fixed-in-this-audit.

---

### F-R02 · `<label>` not associated to inputs (no `htmlFor`/`id`) · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/RegisterPage.jsx:76](src/pages/auth/RegisterPage.jsx#L76)

**What:** Same pattern as LoginPage — labels are plain `<label>{label}</label>` with no `htmlFor`.

**Fix:** Add `id={\`reg-${field}\`}` + `htmlFor`.

**Status:** fixed-in-this-audit.

---

### F-R03 · `aria-invalid` / `aria-describedby` missing on error state · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/RegisterPage.jsx:96-120](src/pages/auth/RegisterPage.jsx#L96)

**What:** Same as F-L05.

**Status:** fixed-in-this-audit.

---

### F-R04 · `fullName` trim happens at validation, not on store — leading/trailing whitespace persists in DB · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/RegisterPage.jsx:42](src/pages/auth/RegisterPage.jsx#L42)

**What:** Validation does `form.fullName.trim().length`, but the actual signup passes raw `form.fullName`. A user typing "  Sarah Smith  " creates a profile with the whitespace baked in.

**Why it matters:** Cosmetic but feeds every profile listing, search, and SEO meta. Names with leading whitespace sort weirdly.

**Fix:** `fullName: form.fullName.trim()` at signup call.

**Status:** fixed-in-this-audit.

---

### F-R05 · No verification that signup succeeded before navigating to `/client/onboarding` · 🔵 P3
**Where:** [src/pages/auth/RegisterPage.jsx:48-50](src/pages/auth/RegisterPage.jsx#L48)

**What:** On success the page navigates immediately. If Supabase requires email confirmation, the user lands on `/client/onboarding` while unauthenticated — `ProtectedRoute` then bounces them to `/login`. They've just registered but their next view is a "please log in" screen — confusing.

**Why it matters:** Onboarding drop-off.

**Fix:** Check `data.session`. If absent → navigate to a `/check-email` page (or show inline "confirm your email"). If present → onboarding.

**Status:** documented (needs product decision on whether the project requires email confirmation).

---

### F-R06 · Password-strength meter not announced to screen readers · 🔵 P3 → fixed-in-this-audit
**Where:** [src/pages/auth/RegisterPage.jsx:101-117](src/pages/auth/RegisterPage.jsx#L101)

**What:** The visual strength bar has no `aria-live` region or text alternative readable by SR users.

**Fix:** Add `role="status"` and `aria-live="polite"` on the meter container so the "Weak/Fair/Good/Strong" label is announced.

**Status:** fixed-in-this-audit (wrapped in `role="status" aria-live="polite"`).
