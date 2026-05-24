# Audit: `src/pages/admin/CommunicationSettingsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 332 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 4 | 2 |
| Fixed | 1 | 0 | 0 | 0 |

This page has a **real ReferenceError**: `handleSendTestEmail` calls `supabase.functions.invoke` but `supabase` is never imported. Click → uncaught error → catch block falsely tells the admin the email was queued. The test-email feature is silently broken.

---

## Findings

### F-CS01 · `supabase` not imported — `handleSendTestEmail` throws ReferenceError, swallowed by catch · 🔴 P0 → fixed-in-this-audit
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:152-170](src/pages/admin/CommunicationSettingsPage.jsx#L152)

**What:** Line 156: `await supabase.functions.invoke(...)`. The file's imports (L1-4) include `Card`, `Button`, `platformSettingsRepo` — no `supabase`. This throws `ReferenceError: supabase is not defined`, which gets caught by the bare `catch {}` at L166 and shows the misleading toast "Test email queued for X".

**Why it matters:** Admins think the test send works. They publish a broken template believing it was verified. End users get no email or a malformed one.

**Fix:**
1. Add `import { supabase } from '../../lib/supabase'`.
2. The catch block must distinguish success from failure — currently both paths say "queued/sent". A genuine failure should toast an error.

**Status:** fixed-in-this-audit.

---

### F-CS02 · Template state is keyed by client-generated `id: 1..5`, but persistence uses `setValue('email_templates')` wholesale · 🟠 P1
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:6-12, 64-77](src/pages/admin/CommunicationSettingsPage.jsx#L6)

**What:** Two admins editing different templates simultaneously will overwrite each other — the entire `templates` array is round-tripped on every save. Admin A saves "Welcome Email" → admin B saves "Password Reset" → admin A's change is preserved, admin B's update may overwrite based on whoever's `templates` state is staler.

**Why it matters:** Lost edits in any multi-admin org. No optimistic locking, no version field.

**Fix:** Either persist each template individually under its own `platform_settings` row (key per template), or add an `updated_at` version field and refuse to save when the server's version differs from what was loaded.

**Status:** documented.

---

### F-CS03 · `{{variables}}` are inserted as raw mustache but the server-side renderer is unspecified — XSS risk if a template author can inject HTML · 🟠 P1
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:14-18](src/pages/admin/CommunicationSettingsPage.jsx#L14)

**What:** A malicious admin (or compromised admin account) saves a body containing `<script>`. If the email sender renders the template into HTML without escaping, the script is delivered to every recipient as an HTML email — phishing pivot.

**Fix:** The send-email edge function must escape user-supplied template content if it builds HTML; only `{{variable}}` substitutions get controlled HTML treatment.

**Status:** documented — needs verification of the send-email edge function.

---

### F-CS04 · `handleResetToDefault` and `handleRevertToOriginal` are visually identical buttons with identical behaviour · 🟡 P2
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:94-109](src/pages/admin/CommunicationSettingsPage.jsx#L94)

**What:** Both functions do the same thing — restore the DEFAULT_TEMPLATES copy. `handleRevertToOriginal` also shows a toast, `handleResetToDefault` doesn't. Two buttons, two confusingly-similar labels, same effect.

**Fix:** Pick one and remove the other.

**Status:** documented.

---

### F-CS05 · No audit log on template save (sensitive change) · 🟡 P2
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:64-77](src/pages/admin/CommunicationSettingsPage.jsx#L64)

**What:** Approving/rejecting a single application writes an audit log. Editing the platform-wide **password reset** email body — which affects every user's reset experience — writes nothing.

**Fix:** `writeAuditLog({ action: 'Email Template Updated', entityType: 'settings', entityId: templateId, details: { template_name } })` on save.

**Status:** documented.

---

### F-CS06 · "In-App" tab does nothing — clicking switches the tab visual but the list doesn't change · 🟡 P2
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:194-198](src/pages/admin/CommunicationSettingsPage.jsx#L194)

**What:** Only `activeTab` is tracked; the templates list always shows email templates regardless. Affordance without function.

**Fix:** Either implement in-app notification templates, or remove the tab.

**Status:** documented.

---

### F-CS07 · Test email recipient input lacks `isEmail` validation · 🟡 P2
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:153](src/pages/admin/CommunicationSettingsPage.jsx#L153)

**Fix:** `if (!isEmail(testEmail))`.

**Status:** documented.

---

### F-CS08 · `wrapSelection` and `insertAtCursor` use `setTimeout(…, 0)` to restore cursor — race condition if React batches · 🔵 P3
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:111-138](src/pages/admin/CommunicationSettingsPage.jsx#L111)

**Fix:** Use `requestAnimationFrame` or `useEffect` with a ref keyed to the current edit-body.

**Status:** documented.

---

### F-CS09 · Local toast state shadows the imported `react-hot-toast` (none imported here, but a future maintainer would collide) · 🔵 P3
**Where:** [src/pages/admin/CommunicationSettingsPage.jsx:28-34](src/pages/admin/CommunicationSettingsPage.jsx#L28)

**Status:** documented.
