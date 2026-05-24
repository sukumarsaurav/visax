# Audit: `src/pages/auth/ProfessionalWelcomePage.jsx`

**Audited:** 2026-05-24 · **LOC:** 157 · **Role gate:** none (public marketing landing)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 2 | 2 |
| Fixed | 0 | 0 | 0 | 0 |

A simple marketing page. The only real issues are external CDN dependencies (broken-image risk) and hardcoded social-proof numbers that may not match reality.

---

## Findings

### F-PW01 · Hero image + consultant avatars hotlinked from Unsplash · 🟡 P2
**Where:** [src/pages/auth/ProfessionalWelcomePage.jsx:26-30, 56](src/pages/auth/ProfessionalWelcomePage.jsx#L26)

**What:** 4 face avatars + 1 background image all loaded from `images.unsplash.com`. If Unsplash changes URL shape, blocks hotlinking, or the photo is removed, the page renders with blank holes and the trust badge ("500+ professionals trust Immizy") loses its visual credibility.

**Why it matters:** Brand integrity on the page that converts professionals → paying agency accounts.

**Fix:** Host the 5 images yourself under `/public/auth/` and reference relative paths. Adds maybe 200 KB to the build; saves a 3rd-party dependency on a marketing-critical surface.

**Status:** documented.

---

### F-PW02 · Stats are hardcoded literals (`500+`, `10k+`, `98%`, `4.9 avg.`) · 🟡 P2
**Where:** [src/pages/auth/ProfessionalWelcomePage.jsx:32-36, 84-89](src/pages/auth/ProfessionalWelcomePage.jsx#L32)

**What:** Numbers are baked into JSX. As the platform grows (or shrinks) these are wrong, and there's no signal to anyone to update them.

**Why it matters:** Misrepresentation risk — claiming "500+ Verified Professionals" when there are actually 80 is a small legal exposure. Even at 500+, it ages badly.

**Fix:** Drive from `platform_settings` (the same `get_platform_stats` RPC the prior audit referenced) and cache for the session. Or at minimum, add a comment with last-verified date and a yearly review.

**Status:** documented.

---

### F-PW03 · Decorative material-symbols missing `aria-hidden` · 🔵 P3
**Where:** [src/pages/auth/ProfessionalWelcomePage.jsx:87, 100, 117, 144](src/pages/auth/ProfessionalWelcomePage.jsx#L87)

**What:** Decorative icons are read aloud by screen readers as their full ligature name ("star", "workspace_premium", "info"). Adds noise without information.

**Fix:** `<span className="material-symbols-outlined …" aria-hidden="true">`.

**Status:** documented (cosmetic; uniform fix across the codebase belongs in a sweep).

---

### F-PW04 · `min-h-[580px]` on the left column may overflow on small laptop heights · 🔵 P3
**Where:** [src/pages/auth/ProfessionalWelcomePage.jsx:49](src/pages/auth/ProfessionalWelcomePage.jsx#L49)

**Status:** documented.
