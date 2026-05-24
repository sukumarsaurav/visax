# Audit: `src/pages/admin/SalesSubscriptionsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 317 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 4 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

Subscription and billing management page. Custom toast state. Pricing inputs lack validation. No audit logging on subscription changes.

---

## Findings

### F-SS01 · Custom toast state instead of react-hot-toast · 🟠 P1
**Where:** Subscription page

**What:** Local toast state instead of global `react-hot-toast`.

**Fix:** Use global toast library.

**Status:** documented.

---

### F-SS02 · Price inputs lack min/max validation · 🟡 P2
**Where:** Subscription tier pricing

**What:** No range checks on prices; could be negative.

**Fix:** Add `min="0"` to price inputs, validate on save.

**Status:** documented.

---

### F-SS03 · No audit log on subscription tier creation/update · 🟡 P2
**Where:** Tier management

**What:** Creating or updating subscription tiers writes no audit log.

**Fix:** Add `writeAuditLog` calls.

**Status:** documented.

---

### F-SS04 · Feature list editing lacks WYSIWYG or proper formatting · 🟡 P2
**Where:** Tier features field

**What:** Features are free-text input; no structured editing.

**Status:** documented.

---

### F-SS05 · Delete subscription tier uses confirm() not ConfirmModal · 🟡 P2
**Where:** Tier deletion

**What:** Inconsistent with other admin pages.

**Fix:** Use ConfirmModal.

**Status:** documented.

---

### F-SS06 · Currency symbol not validated — could be arbitrary text · 🔵 P3
**Where:** Currency field

**What:** No whitelist of valid currency symbols.

**Status:** documented.
