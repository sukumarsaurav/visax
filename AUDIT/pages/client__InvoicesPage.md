# Audit: `src/pages/client/InvoicesPage.jsx`

**Audited:** 2026-05-24 · **LOC:** ~180 · **Role gate:** `<ProtectedRoute allowedRoles={CLIENT}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 2 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

Invoice listing and payment page. Shows invoice amounts and status. Issues: hardcoded currency display, no payment method validation.

---

## Findings

### F-IP01 · Currency display hardcoded to USD · 🟡 P2
**Where:** Invoices page

**What:** `formatAmount(amount)` doesn't use invoice currency field.

**Status:** documented.

---

### F-IP02 · Download invoice PDF has no error handling · 🟡 P2
**Where:** Invoice download button

**What:** If PDF generation fails, user sees no feedback.

**Status:** documented.

---

### F-IP03 · Payment gateway redirect URL not validated · 🔵 P3
**Where:** Pay now button

**What:** Stripe redirect URL should be verified before navigation.

**Status:** documented.
