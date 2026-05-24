# Audit: `src/pages/admin/UnclaimedProfilesPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 456 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 5 | 3 |
| Fixed | 0 | 0 | 0 | 0 |

A page for pre-seeding consultant profiles. The email-sending flow embeds the claim_token in the magic link redirect URL — this is a feature, not a bug, but the token could be logged/intercepted. CSV import error handling leaves the preview showing, confusing the admin. Delete uses native confirm() instead of ConfirmModal. Copy claim link doesn't await the clipboard promise.

---

## Findings

### F-UP01 · Claim token included in email magic link redirect — if email is logged/intercepted, token is exposed · 🟠 P1
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:125-130](src/pages/admin/UnclaimedProfilesPage.jsx#L125)

**What:** Line 129: `emailRedirectTo: '${window.location.origin}/claim-profile?token=${profile.claim_token}'`. The magic link email contains the token. If the email service, ISP, or proxy logs URLs, the token is exposed.

**Why it matters:** An attacker with access to email logs could claim any profile without knowing the admin-set password.

**Fix (architectural):** Consider using a short-lived session instead: the email redirects to `/claim-profile` without a token, and a backend lookup ties the email to the claim attempt. But this is a larger change. For now, ensure claim_token is sufficiently long and random (40+ alphanumeric chars).

**Status:** documented — architectural decision.

---

### F-UP02 · CSV import error leaves preview showing — admin thinks import partially succeeded · 🟠 P1
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:113-114](src/pages/admin/UnclaimedProfilesPage.jsx#L113)

**What:** If `createMany` fails (line 113-114), the error is toasted but the `csvPreview` state is NOT cleared (should be cleared after success only). The preview still shows, making the admin think "I'll try again" or worse, "maybe it was partially imported."

**Fix:** Only `setCsvPreview([])` on success (move L116 before the check, or guard it).

**Status:** documented.

---

### F-UP03 · Delete profile uses `window.confirm` instead of `ConfirmModal` · 🟡 P2
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:143](src/pages/admin/UnclaimedProfilesPage.jsx#L143)

**What:** Other admin pages (UserManagementPage, ApplicationReviewPage) use the platform's `ConfirmModal` for consistency. This page uses native browser `confirm()`.

**Fix:** Import `ConfirmModal` and use it.

**Status:** documented.

---

### F-UP04 · `copyClaimLink` doesn't await clipboard promise — failure is silent · 🟡 P2
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:137-139](src/pages/admin/UnclaimedProfilesPage.jsx#L137)

**What:** Line 138: `navigator.clipboard.writeText(...)` is not awaited. If it fails, the user clicks, sees "Claim link copied!" but the clipboard is empty.

**Fix:** `await navigator.clipboard.writeText(...).catch(err => toast.error(...))`.

**Status:** documented.

---

### F-UP05 · CSV file input has no size validation — 1GB CSV would load into memory · 🟡 P2
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:174](src/pages/admin/UnclaimedProfilesPage.jsx#L174)

**What:** `<input type="file" accept=".csv">` has no size check. The handleFileUpload reads the entire file as text (L95) into memory. A user could select a 500MB CSV.

**Fix:** Check `file.size` before reading: `if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }`.

**Status:** documented.

---

### F-UP06 · Search input lacks label — only placeholder for accessibility · 🟡 P2
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:329-338](src/pages/admin/UnclaimedProfilesPage.jsx#L329)

**What:** The search input (L331-337) has a search icon and placeholder but no `<label>` with `htmlFor`.

**Fix:** Add `id` to input and wrap in `<label htmlFor={id}>` or use aria-label.

**Status:** documented.

---

### F-UP07 · Create form labels not paired with inputs (no htmlFor/id) · 🟡 P2
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:249-260, 261-270, etc.](src/pages/admin/UnclaimedProfilesPage.jsx#L249)

**What:** Form labels (line 250, 262, 273, 283, 293) are `<label>` without `htmlFor`, and inputs lack `id`. Screen readers can't pair them.

**Fix:** Add `id={f.key}` to each input and `htmlFor={f.key}` to each label.

**Status:** documented.

---

### F-UP08 · `years_experience` accepts negative or 0 via `type="number"` with no min validation · 🟡 P2
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:247, 74](src/pages/admin/UnclaimedProfilesPage.jsx#L247)

**What:** The input has `type="number"` (L247) but no `min="0"`. On save, years_experience is converted to Number (L74) without clamping. A user can enter `-5` and it's saved.

**Fix:** Add `min="0"` to the input and clamp on save: `Math.max(0, Number(form.years_experience))`.

**Status:** documented.

---

### F-UP09 · CSV import splits specializations/languages inconsistently · 🔵 P3
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:75-76 vs 109-110](src/pages/admin/UnclaimedProfilesPage.jsx#L75)

**What:** The create form splits specializations/languages by comma (L75-76), but the CSV import splits by semicolon (L109-110). The CSV hint (L188) says semicolon. If an admin creates a profile via form with "Canada PR, Australia PR" (comma), it becomes one string, not an array.

**Fix:** Use consistent delimiter. The hint suggests semicolon for CSV; form should also accept semicolon or be documented as comma-only.

**Status:** documented.

---

### F-UP10 · Avatar component receives undefined alt if profile is null · 🔵 P3
**Where:** [src/pages/admin/UnclaimedProfilesPage.jsx:220](src/pages/admin/UnclaimedProfilesPage.jsx#L220)

**What:** `<Avatar size="sm" alt={log.profiles?.full_name} />` — if profiles is null (shouldn't happen in this context, but possible), alt becomes undefined. The Avatar component should handle this gracefully.

**Status:** documented.
