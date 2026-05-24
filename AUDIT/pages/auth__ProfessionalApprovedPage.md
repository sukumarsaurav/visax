# Audit: `src/pages/auth/ProfessionalApprovedPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 131 · **Role gate:** `<ProtectedRoute allowedRoles={['individual', 'agency_admin']}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 2 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

Mostly OK; the `updateProfile` side-effect deserves a guard, and the "next steps" cards look interactive but aren't.

---

## Findings

### F-PA01 · `updateProfile({ professional_onboarding_complete: true })` re-runs on profile change · 🟡 P2
**Where:** [src/pages/auth/ProfessionalApprovedPage.jsx:32-36](src/pages/auth/ProfessionalApprovedPage.jsx#L32)

**What:** Effect deps are `[profile]`. The effect checks `!profile.professional_onboarding_complete` so the second call is short-circuited — fine in steady state. But:
- The effect runs on every profile refetch (AuthContext fetches on auth state change), so a token refresh that produces a new `profile` reference will re-evaluate.
- The check vs. the write is racy if the user navigates away mid-write.

**Why it matters:** Tiny — currently safe. Listed for hygiene.

**Fix:** Add a `useRef(false)` guard and short-circuit if we've fired once this mount.

**Status:** documented.

---

### F-PA02 · "Next steps" cards have `cursor-default` and no navigation · 🟡 P2
**Where:** [src/pages/auth/ProfessionalApprovedPage.jsx:79-92](src/pages/auth/ProfessionalApprovedPage.jsx#L79)

**What:** Each card has hover styling, a `chevron_right` icon, and looks like a clickable destination — but the wrapping element is a `<div>` with `cursor-default` and no `onClick`.

**Why it matters:** Affordance-without-function. Users will click expecting to be taken somewhere.

**Fix:** Either remove the chevrons and hover-border styling, or wrap each card in a `<Link>` to the relevant destination (Settings, Clients, Resources).

**Status:** documented (small refactor; recommend the link version).

---

### F-PA03 · "Global Services" nav item is dead (`<span cursor-default>`) · 🔵 P3
**Where:** [src/pages/auth/ProfessionalApprovedPage.jsx:54](src/pages/auth/ProfessionalApprovedPage.jsx#L54)

**Same** as F-PS03. Remove or wire up.

**Status:** documented.
