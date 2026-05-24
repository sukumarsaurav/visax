# Audit: `src/pages/admin/SystemIntegrationsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 590 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 1 | 2 | 3 | 2 |
| Fixed | 1 | 0 | 0 | 0 |

A critical missing import: `supabase` is called on line 270 but never imported, causing ReferenceError when "Test Connection" is clicked. The header toggle doesn't persist its changes (updates local state only). No audit log written on successful test.

---

## Findings

### F-SI01 · `supabase` not imported — `handleTestConnection` throws ReferenceError · 🔴 P0 → fixed-in-this-audit
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:270](src/pages/admin/SystemIntegrationsPage.jsx#L270)

**What:** Line 270: `const { data: { session } } = await supabase.auth.getSession()`. The file imports `toast`, `Card`, `Button`, `writeAuditLog`, and repos (L1-6) but not `supabase`. This throws `ReferenceError: supabase is not defined` when the user clicks "Save & Test Connection".

**Why it matters:** The test feature is silently broken. Admins think the test succeeds but actually get an error they're told is a network issue.

**Fix:** Add `import { supabase } from '../../lib/supabase'` at the top.

**Status:** fixed-in-this-audit.

---

### F-SI02 · Header toggle doesn't persist — toggling on/off in the drawer updates local state but doesn't save · 🟠 P1
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:413-421](src/pages/admin/SystemIntegrationsPage.jsx#L413)

**What:** The toggle button in the config drawer (inside the header) updates `intSettings` locally via `setIntSettings`, but doesn't call `platformSettingsRepo.setValue` like the main grid toggle does (L190-198). If the user toggles in the drawer and closes without clicking "Save Credentials", the toggle is lost.

**Fix:** Replace the manual `setIntSettings` with a call to `handleToggle(selectedId, e)`.

**Status:** documented.

---

### F-SI03 · No confirmation when disabling an active integration — could break downstream features · 🟠 P1
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:190, 413](src/pages/admin/SystemIntegrationsPage.jsx#L190)

**What:** Toggling an integration off immediately disables it. If Stripe is enabled and you toggle it off accidentally, all Stripe link generation fails until you toggle it back on — no warning.

**Fix:** For integrations where `connected` is true (has `last_verified`), show `ConfirmModal` before disabling.

**Status:** documented.

---

### F-SI04 · No audit log on successful test · 🟡 P2
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:282-285](src/pages/admin/SystemIntegrationsPage.jsx#L282)

**What:** Approving an application writes an audit log. Verifying a Stripe or Zoom connection — a critical operational step — writes nothing.

**Fix:** Add `await writeAuditLog({ action: 'Integration Verified', entityType: 'integration', entityId: selectedId, details: { ...testResult.data } })` after line 285.

**Status:** documented.

---

### F-SI05 · Network error message not localized via `friendlyError` · 🟡 P2
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:290-292](src/pages/admin/SystemIntegrationsPage.jsx#L290)

**What:** The catch block hardcodes "Network error — could not reach test endpoint". A user-facing error message, not wrapped.

**Fix:** Import `friendlyError` and use it: `const msg = friendlyError(err, 'Network error — could not reach test endpoint')`.

**Status:** documented.

---

### F-SI06 · `fieldValues` state lost on page reload — user sees empty secret fields after refresh · 🟡 P2
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:157, 184](src/pages/admin/SystemIntegrationsPage.jsx#L157)

**What:** `fieldValues` is client-only state. If the user opens the drawer, types a secret, then refreshes (or navigates away and back), the typed value disappears. The UI shows blank secret fields, making it look like they were never entered — but the server still has the old one.

**Why it matters:** UX confusion. Admin types a new Stripe key, refreshes, sees empty field, worries the old key is gone.

**Fix:** Persist to `sessionStorage` or re-fetch loaded settings when the drawer opens. Or add a note under secret fields: "Secret fields are cleared on refresh for security; enter a new value only if you want to update."

**Status:** documented.

---

### F-SI07 · No aria-labels on toggle switches · 🟡 P2
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:356-361, 413-421](src/pages/admin/SystemIntegrationsPage.jsx#L356)

**What:** Both toggle switches are `<button>` elements with role hints via Tailwind styling, but no `aria-label`. Screen readers announce them as "button" without context.

**Fix:** Add `aria-label={`${int.name} integration toggle`}` to grid toggles and `aria-label={`${selectedMeta.name} integration toggle`}` to header toggle.

**Status:** documented.

---

### F-SI08 · "Save & Test Connection" button text is ambiguous — doesn't clarify what happens on click · 🔵 P3
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:548-557](src/pages/admin/SystemIntegrationsPage.jsx#L548)

**What:** The button says "Save & Test Connection" but the function is `handleTestConnection`, which calls `persistCredentials` first. The label doesn't make it clear that clicking this doesn't just test — it also saves the current form values.

**Status:** documented.

---

### F-SI09 · No validation that required secret fields are filled before test · 🔵 P3
**Where:** [src/pages/admin/SystemIntegrationsPage.jsx:258-295](src/pages/admin/SystemIntegrationsPage.jsx#L258)

**What:** `handleTestConnection` sends the test request regardless of whether required secrets are empty. The server will return an error, but the UI doesn't pre-validate.

**Status:** documented.
