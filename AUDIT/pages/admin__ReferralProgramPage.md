# Audit: `src/pages/admin/ReferralProgramPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 316 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 4 | 2 |
| Fixed | 0 | 0 | 0 | 0 |

A promotion and referral program management page. Custom toast state (should use react-hot-toast). Form inputs lack validation for discount_percent and max_redemptions ranges. No audit logging on configuration save.

---

## Findings

### F-RP01 · Custom toast state instead of react-hot-toast · 🟠 P1
**Where:** [src/pages/admin/ReferralProgramPage.jsx:21, 26-29](src/pages/admin/ReferralProgramPage.jsx#L21)

**What:** Defines local toast state instead of using the global `react-hot-toast` library.

**Fix:** Import `toast` from `react-hot-toast` and use `toast.success()` / `toast.error()`.

**Status:** documented.

---

### F-RP02 · `discount_percent` and `max_redemptions` lack input validation · 🟡 P2
**Where:** [src/pages/admin/ReferralProgramPage.jsx:65, 68](src/pages/admin/ReferralProgramPage.jsx#L65)

**What:** Discount percent is converted to Number (L65) without checking range (0-100). Max redemptions is optional but not validated.

**Fix:** Add `min="0" max="100"` to discount input, validate on save.

**Status:** documented.

---

### F-RP03 · No audit log on configuration save · 🟡 P2
**Where:** [src/pages/admin/ReferralProgramPage.jsx:50-56](src/pages/admin/ReferralProgramPage.jsx#L50)

**What:** Saving referral configuration writes no audit log.

**Fix:** Add `writeAuditLog` call in `handleSaveConfig`.

**Status:** documented.

---

### F-RP04 · Promotion form lacks descriptions for fields · 🟡 P2
**Where:** [src/pages/admin/ReferralProgramPage.jsx:60-80](src/pages/admin/ReferralProgramPage.jsx#L60)

**What:** Form fields (valid_months, max_redemptions) have no help text or validation feedback.

**Status:** documented.

---

### F-RP05 · Promo code validation is client-only (uppercase + trim) · 🔵 P3
**Where:** [src/pages/admin/ReferralProgramPage.jsx:64](src/pages/admin/ReferralProgramPage.jsx#L64)

**What:** Code is uppercased and trimmed on the client, but no check for uniqueness or format.

**Status:** documented.
