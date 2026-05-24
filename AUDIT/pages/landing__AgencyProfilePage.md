# Audit: `src/pages/landing/AgencyProfilePage.jsx`

**Audited:** 2026-05-24 · **LOC:** 617 · **Role gate:** Public (no auth required)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 2 | 1 |

Agency profile with booking form (consultant, date, slot, meeting type). UUID validation correct. Availability generation and team member display working. Three issues flagged.

---

## Findings

### F-AP01 · `selectedConsultant` defaults to "" but affects availability lookup · 🟠 P1
**Where:** [src/pages/landing/AgencyProfilePage.jsx:63, 124](src/pages/landing/AgencyProfilePage.jsx#L63)

**What:** Line 63: `const [selectedConsultant, setSelectedConsultant] = useState('')`. Line 124: `availabilityRepo.listActive(selectedConsultant)` is called with empty string. The repo likely treats `""` as no-filter (all consultants), but the UI label says "Any Available (Earliest)" — the intent is ambiguous.

**Fix:** Either (a) define a sentinel value like `'ANY'` and handle in the repo, or (b) call `availabilityRepo.listActive()` without args when `selectedConsultant === ''`. Clarify in comments.

**Status:** documented.

---

### F-AP02 · `handleShare()` doesn't await or handle navigator.clipboard rejection · 🟡 P2
**Where:** [src/pages/landing/AgencyProfilePage.jsx:218-226](src/pages/landing/AgencyProfilePage.jsx#L218)

**What:** `navigator.clipboard.writeText(url)` is async and can reject (user denies permission, clipboard locked, etc.), but the code doesn't await or catch.

**Fix:** `await navigator.clipboard.writeText(url).catch(() => toast.error('Failed to copy'))`.

**Status:** documented.

---

### F-AP03 · `agency.website_url` not validated — could be javascript: link · 🟡 P2
**Where:** [src/pages/landing/AgencyProfilePage.jsx:289-295](src/pages/landing/AgencyProfilePage.jsx#L289)

**What:** The `<a href={agency.website_url}>` tag accepts any URL from the agency admin. A compromised admin (or user with edit capability) could set `website_url: 'javascript:alert(1)'` and users clicking "Agency Website" would execute code.

**Fix:** Validate on render: `const safeUrl = agency.website_url?.startsWith('http') ? agency.website_url : null; if (!safeUrl) return null;` or use `safeHref()` helper.

**Status:** documented.

---

### F-AP04 · No audit log on booking intent storage · 🔵 P3
**Where:** [src/pages/landing/AgencyProfilePage.jsx:562-573](src/pages/landing/AgencyProfilePage.jsx#L562)

**What:** User selects consultant, date, slot, and clicks "Book" → navigates to `/register` with booking intent in state. This selection is never logged, so if the user doesn't complete signup, there's no record of intent.

**Status:** documented.
