# Audit: `src/pages/admin/InternalAnnouncementsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 285 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 4 | 2 |
| Fixed | 0 | 0 | 0 | 0 |

The delete affordance uses `confirm()` (blocking native browser dialog) instead of the platform's `ConfirmModal`, breaking the visual consistency the rest of the admin area maintains.

---

## Findings

### F-IA01 · Announcement `content` rendered without sanitisation; if displayed via `dangerouslySetInnerHTML` elsewhere, stored XSS · 🟠 P1
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:175](src/pages/admin/InternalAnnouncementsPage.jsx#L175) (storage), public render sites unverified

**What:** The admin enters free-form text in `<textarea>`. The list view here uses `{a.content}` (React-escaped, safe). But announcements are broadcast — consumers (`AnnouncementsPage`, NotificationsPage, in-app banner) may render with `dangerouslySetInnerHTML` for markdown support. If any consumer does, a malicious admin can ship JS.

**Why it matters:** Compromised admin account → stored XSS across every logged-in user who sees an announcement.

**Fix:** Decide the rendering contract now. If markdown is intended, sanitise on write (DOMPurify) AND on render. If plain text, document it and ensure no consumer renders raw HTML.

**Status:** documented — needs cross-cutting check (will revisit when auditing `consultant/AnnouncementsPage.jsx`).

---

### F-IA02 · Uses native `confirm()` for delete instead of `ConfirmModal` · 🟡 P2
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:91](src/pages/admin/InternalAnnouncementsPage.jsx#L91)

**What:** Other admin pages use the platform's `ConfirmModal`. This one breaks the pattern.

**Fix:** Replace with `ConfirmModal`.

**Status:** documented.

---

### F-IA03 · "Save as Draft" creates an announcement with `is_global: false` — overloading "draft" and "agency-specific" · 🟡 P2
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:67, 116](src/pages/admin/InternalAnnouncementsPage.jsx#L67)

**What:** The data model has `is_global` (bool). The UI calls non-global rows both "Drafts" (stats counter) and "Agency Only" (table chip). These are different concepts. A draft that's not ready to publish has been merged with an agency-specific publication.

**Fix:** Add a separate `status: 'draft' | 'published'` column. Use `is_global` only for the audience.

**Status:** documented — schema change.

---

### F-IA04 · No edit / undo — once published you can only toggle visibility or delete · 🟡 P2
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:195-204](src/pages/admin/InternalAnnouncementsPage.jsx#L195)

**Status:** documented.

---

### F-IA05 · No audit log on create/delete/toggle (compare with PlatformSettings which does log) · 🟡 P2
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:57-95](src/pages/admin/InternalAnnouncementsPage.jsx#L57)

**Fix:** Add `writeAuditLog` calls.

**Status:** documented.

---

### F-IA06 · Filter dropdown values ("All Statuses", "Global", "Agency-specific") don't match the data model semantics · 🔵 P3
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:141-147](src/pages/admin/InternalAnnouncementsPage.jsx#L141)

**Status:** documented.

---

### F-IA07 · Toast component duplicated from CommunicationSettings — should be the global `react-hot-toast` · 🔵 P3
**Where:** [src/pages/admin/InternalAnnouncementsPage.jsx:32-39](src/pages/admin/InternalAnnouncementsPage.jsx#L32)

**Status:** documented.
