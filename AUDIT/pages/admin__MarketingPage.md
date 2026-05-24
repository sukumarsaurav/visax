# Audit: `src/pages/admin/MarketingPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 338 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 6 | 4 |
| Fixed | 0 | 0 | 0 | 0 |

A marketing programs management page for referrals, promotions, and affiliate programs. Two action buttons are non-functional (no onClick). Form inputs lack validation and proper label associations. Stats terminology confuses different concepts.

---

## Findings

### F-MK01 · "Create Program" button has no onClick handler · 🟡 P2
**Where:** [src/pages/admin/MarketingPage.jsx:72](src/pages/admin/MarketingPage.jsx#L72)

**What:** `<Button icon="add">Create Program</Button>` has no onClick. Clicking does nothing.

**Fix:** Add onClick handler to open a modal or navigate to a create form.

**Status:** documented.

---

### F-MK02 · "View Reports" button has no onClick handler · 🟡 P2
**Where:** [src/pages/admin/MarketingPage.jsx:148](src/pages/admin/MarketingPage.jsx#L148)

**What:** `<Button variant="outline" icon="description">View Reports</Button>` has no onClick. Clicking does nothing.

**Fix:** Add onClick handler to navigate to a reports page or open a panel.

**Status:** documented.

---

### F-MK03 · Referrer/referee amount inputs lack min/max validation · 🟡 P2
**Where:** [src/pages/admin/MarketingPage.jsx:227-230, 247-250](src/pages/admin/MarketingPage.jsx#L227)

**What:** The number inputs for referrer_amount and referee_amount (L228, L248) have no `min="0"`. A user can enter negative values.

**Fix:** Add `min="0"` and appropriate `max` (e.g., max="1000" for credit, max="100" for discount percentage).

**Status:** documented.

---

### F-MK04 · Form labels lack htmlFor/id pairing · 🟡 P2
**Where:** [src/pages/admin/MarketingPage.jsx:195-203, 215-231, 235-251](src/pages/admin/MarketingPage.jsx#L195)

**What:** All form labels (Approval Workflow, Reward Type, Amount / Value) have no `htmlFor`, and inputs lack `id`. Screen readers can't pair them.

**Fix:** Add `id` to each input and `htmlFor` to the corresponding `<label>`.

**Status:** documented.

---

### F-MK05 · "Manage →" link is self-referential — doesn't help navigation · 🟡 P2
**Where:** [src/pages/admin/MarketingPage.jsx:291](src/pages/admin/MarketingPage.jsx#L291)

**What:** `<a href="/admin/referral-program">Manage →</a>` — but this IS the referral program page. The link doesn't go anywhere useful.

**Fix:** Remove the link, or update it to link to a dedicated promotions management page if one exists.

**Status:** documented.

---

### F-MK06 · No audit log on configuration save · 🟡 P2
**Where:** [src/pages/admin/MarketingPage.jsx:52-57](src/pages/admin/MarketingPage.jsx#L52)

**What:** Changing referral program configuration (approval workflow, reward amounts) writes nothing to the audit log.

**Fix:** Import `writeAuditLog` and add a call in `handleSaveReferralConfig`.

**Status:** documented.

---

### F-MK07 · Custom toast state duplicates global react-hot-toast · 🔵 P3
**Where:** [src/pages/admin/MarketingPage.jsx:21, 23-26](src/pages/admin/MarketingPage.jsx#L21)

**What:** The page defines its own toast state and `showToast` function instead of using the global `react-hot-toast` library.

**Fix:** Import `toast` from `react-hot-toast` and use `toast.success()` / `toast.error()`.

**Status:** documented.

---

### F-MK08 · Stats calculation hardcodes "2" for active programs · 🔵 P3
**Where:** [src/pages/admin/MarketingPage.jsx:78](src/pages/admin/MarketingPage.jsx#L78)

**What:** `stats.activePromos + 2` hardcodes the assumption that there are 2 other active programs (affiliate, loyalty). This is fragile and confuses "promotions" with "programs".

**Status:** documented — architectural decision.

---

### F-MK09 · Stats terminology confused: "Active Programs" vs "Active Promotions" · 🔵 P3
**Where:** [src/pages/admin/MarketingPage.jsx:78-81](src/pages/admin/MarketingPage.jsx#L78)

**What:** "Active Programs" counts `activePromos + 2` (a promotional stat), while "Active Promotions" is just `activePromos`. The names are confusing.

**Status:** documented.

---

### F-MK10 · "Discard Changes" calls remote loadData instead of using local state · 🔵 P3
**Where:** [src/pages/admin/MarketingPage.jsx:257](src/pages/admin/MarketingPage.jsx#L257)

**What:** Line 257: `onClick={() => loadData()}` calls the remote function to fetch and reset state. Could track changes locally and reset the client state directly.

**Status:** documented — minor performance optimization.
