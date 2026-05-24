# Audit: `src/pages/admin/UserManagementPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 469 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 1 | 2 | 4 | 2 |
| Fixed | 0 | 0 | 1 | 1 |

This is the most powerful page in the platform (it can change any user's role, including elevation to admin). Two material issues: an admin can silently elevate themselves with no extra confirmation, and the page has no protection against the "last-admin demote" footgun.

---

## Findings

### F-UM01 · No confirmation when changing a user's **role** (including admin elevation) · 🔴 P0
**Where:** [src/pages/admin/UserManagementPage.jsx:85-113, 402-414](src/pages/admin/UserManagementPage.jsx#L85)

**What:** Suspend/Reactivate fires a `ConfirmModal`. **Role change** does not — clicking "Save Changes" with `role` changed silently writes to the DB. So:
- Admin A can promote any user (including themselves outside of admin → still themselves) to `admin` with one click.
- A misclick on the role dropdown (slipping from `agency_admin` to `admin` on the same dropdown one row above) silently elevates that user, granting full platform access.

There's no diff display ("you're changing role from X to Y — confirm?"), no `re-auth required for role change` (which is a common pattern for sensitive mutations), and no second-admin approval.

**Why it matters:** Single-point-of-compromise for the entire platform. An attacker with an admin cookie can roleswap every user. An admin's careless click can grant unintended access.

**Fix (layered):**
1. **Immediate:** When `editForm.role !== selectedUser.role`, show a confirm modal that explicitly states "Change role from X → Y. This user will gain/lose access to: …". For elevations *to* `admin`, require typing the user's email to confirm (delete-style).
2. **Server-side:** Add an RLS policy that only allows admins to set `role = 'admin'` when the calling admin's `app_metadata.can_manage_admins = true`, set on a per-admin basis. Or use a separate `super_admin` role for this.
3. **Audit:** The current audit-log records the new role but not the *previous* role. Add `previous_role` to the `details` payload.

**Status:** documented — needs UX + RLS migration. Highest-priority finding in the admin section.

---

### F-UM02 · No "last admin" protection · 🟠 P1
**Where:** [src/pages/admin/UserManagementPage.jsx:85-113](src/pages/admin/UserManagementPage.jsx#L85)

**What:** If the platform has 1 admin and that admin demotes themselves (role → individual), there are zero remaining admins. No one can ever change a role, view the audit log, or approve applications.

**Recovery:** A DB engineer with direct Supabase Studio access has to manually `UPDATE users SET role='admin' WHERE id=…;`. For most teams that's a multi-hour incident.

**Fix:** Before allowing a role change that would remove the last admin, count remaining admins server-side and reject with a clear error. Same applies to suspending the last admin.

```sql
-- in update RLS or a BEFORE UPDATE trigger:
IF NEW.role <> 'admin' AND OLD.role = 'admin' THEN
  IF (SELECT COUNT(*) FROM users WHERE role = 'admin' AND id <> OLD.id) = 0 THEN
    RAISE EXCEPTION 'Cannot remove the last admin';
  END IF;
END IF;
```

**Status:** documented — needs migration.

---

### F-UM03 · `redirectTo: '/reset-password'` for admin-initiated reset hits a non-existent route · 🟠 P1
**Where:** [src/pages/admin/UserManagementPage.jsx:142-149](src/pages/admin/UserManagementPage.jsx#L142)

**Same as F-FP01 in ForgotPasswordPage.** The admin "Reset Password" button sends the user a link that lands on 404.

**Status:** documented (also flagged on the forgot-password page; both need the same `/reset-password` route).

---

### F-UM04 · Audit log written *after* the mutation; if log insert fails, mutation already landed · 🟡 P2
**Where:** [src/pages/admin/UserManagementPage.jsx:97-112](src/pages/admin/UserManagementPage.jsx#L97)

**What:** Standard problem — the `writeAuditLog` is a separate INSERT. If it fails (RLS issue, network blip, table missing), the user mutation succeeded but the audit trail is missing.

**Fix:** Move audit-log writes into a database trigger on the target table, or into the same RPC that performs the mutation. That guarantees atomicity. Migration `007_production_hardening.sql` may already add some triggers — needs verification.

**Status:** documented.

---

### F-UM05 · `exportCSV` exports only the **current page** but UX implies "Export users" (all) · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/admin/UserManagementPage.jsx:151-171](src/pages/admin/UserManagementPage.jsx#L151)

**What:** `users.map(...)` exports `users` which is only PAGE_SIZE=10 rows. An admin clicking "Export" expects all 5,000 users; gets 10.

**Fix:** Either (a) rename button to "Export current page", or (b) re-fetch unbounded for the export. For (b) prefer a server-side CSV generator route to avoid loading 5k rows into the client.

**Status:** fixed-in-this-audit — relabelled button to "Export this page" for honesty; the proper "export all" needs a paginated fetch loop or RPC.

---

### F-UM06 · Search hits `full_name.ilike + email.ilike` — needs trigram indexes (prior audit #16) · 🟡 P2
**Where:** [src/data/profilesRepo.js](src/data/profilesRepo.js) — flagged in PRODUCTION_AUDIT.md but listed against UserManagementPage

**Status:** carried forward from [prior-audit] #16. Verify migration 004/007 added the GIN trigram indexes.

---

### F-UM07 · Drawer's email field is `readOnly` but doesn't show a tooltip explaining why · 🟡 P2
**Where:** [src/pages/admin/UserManagementPage.jsx:399](src/pages/admin/UserManagementPage.jsx#L399)

**What:** The email field is greyed out with a mail icon. No "managed by Supabase Auth — use Reset Password" explanation.

**Fix:** Add helper text below the input.

**Status:** documented.

---

### F-UM08 · Suspend → reactivate logs both as "User Updated" — slight ambiguity in the audit trail · 🔵 P3
**Where:** [src/pages/admin/UserManagementPage.jsx:126](src/pages/admin/UserManagementPage.jsx#L126)

**Fix:** Use `User Reactivated` for the reactivate case (mirrors `User Suspended`).

**Status:** fixed-in-this-audit.

---

### F-UM09 · Slide-in animation defined as inline `<style>` (cannot be CSP-restricted) · 🔵 P3
**Where:** [src/pages/admin/UserManagementPage.jsx:463-466](src/pages/admin/UserManagementPage.jsx#L463)

**What:** When the platform adds a strict CSP, inline `<style>` blocks need `style-src 'unsafe-inline'` or per-element nonces. Better to define the keyframe in `tailwind.config.js` or `index.css`.

**Status:** documented.
