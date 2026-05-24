# Audit: `src/pages/admin/PlatformSettingsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 373 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 3 | 3 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

A globally-reaching settings surface. Three security-shaped issues: maintenance mode has no double-confirm (one accidental click locks the platform), social URLs and legal URLs accept arbitrary strings that ship to every footer click (open-redirect vector), and the legal-upload error path swallows the cause with `catch {}`.

---

## Findings

### F-PS01 · Social URL inputs accept any string — `javascript:` / phishing URLs ship to the footer · 🟠 P1
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:210-219](src/pages/admin/PlatformSettingsPage.jsx#L210)

**What:** `input type="url"` is a UX hint, not a validator — browsers happily accept `javascript:alert(1)` or `https://attacker.example`. There's no `safeHref` / `isHttpUrl` check on save. Each footer click goes to the URL stored. A malicious admin (or compromised one) sets `linkedin: 'https://phish.example/login'` — every user hitting any page goes there.

**Fix:** On save, run each non-empty URL through `lib/validators.isHttpUrl`. Reject with a per-field error. Ideally also restrict by platform-specific origin (e.g. linkedin → `linkedin.com`).

**Status:** documented.

---

### F-PS02 · `legal.terms_url` / `privacy_url` are arbitrary admin-controlled URLs piped to every footer · 🟠 P1
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:298-312](src/pages/admin/PlatformSettingsPage.jsx#L298)

**Same as F-PS01** but more impactful — Terms & Privacy links are GDPR-relevant and clicked by every authed user during onboarding. Pointing them to an attacker domain is both a phishing pivot and a compliance violation.

**Fix:** Same as F-PS01.

**Status:** documented.

---

### F-PS03 · Maintenance mode toggle has no confirmation — accidental click locks the platform · 🟠 P1
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:325-328](src/pages/admin/PlatformSettingsPage.jsx#L325)

**What:** A `ToggleSwitch` flips `maintenance_mode`. The user still has to click "Save Changes" — true. But the modal/save flow doesn't single-out maintenance mode for extra confirmation. A misclick → save → all non-admin users are locked out, including paying customers mid-session.

**Fix:** When `general.maintenance_mode` toggles `false → true` and the user clicks Save, show a `ConfirmModal` titled "Lock the platform for all non-admin users?" with a typed-confirmation pattern.

**Status:** documented.

---

### F-PS04 · Multi-key save isn't atomic — partial failures leave the platform in an inconsistent state · 🟡 P2
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:106-134](src/pages/admin/PlatformSettingsPage.jsx#L106)

**What:** The maintenance tab saves `['maintenance_message', ...]` then `['general', ...]`. If the second call fails (network blip), the maintenance message is updated but the toggle isn't — or vice versa. There's no rollback.

**Fix:** Wrap multi-key updates in a single RPC that performs all sets in one transaction.

**Status:** documented.

---

### F-PS05 · `catch {}` swallows the cause on legal-doc upload — admin sees a generic "Upload failed" with no actionable info · 🟡 P2
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:275-277](src/pages/admin/PlatformSettingsPage.jsx#L275)

**Fix:** `catch (e) { toast.error(friendlyError(e, 'Upload failed')) }`.

**Status:** documented.

---

### F-PS06 · `original.current` ref reset after save uses **post-save** state which may diverge from server if save partially failed · 🟡 P2
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:130](src/pages/admin/PlatformSettingsPage.jsx#L130)

**What:** `original.current = { ...original.current, general, social, ... }` — uses client state. If only one of the multi-key writes succeeded (per F-PS04), the cancel button now restores the *partially saved* state, not the actual server truth.

**Fix:** Re-call `loadSettings()` after successful save.

**Status:** documented.

---

### F-PS07 · `max_upload_mb` accepts negative or 0 via `min="1"` (browser hint only) · 🔵 P3
**Where:** [src/pages/admin/PlatformSettingsPage.jsx:181](src/pages/admin/PlatformSettingsPage.jsx#L181)

**Fix:** Clamp on save: `Math.max(1, Math.min(100, Number(value)))`.

**Status:** documented.

---

### F-PS08 · `<a href={social[key]}>` Test link doesn't `safeHref` either — flagged as the public render impact in F-PS01 · 🟡 P2 (covered)

**Status:** see F-PS01.
