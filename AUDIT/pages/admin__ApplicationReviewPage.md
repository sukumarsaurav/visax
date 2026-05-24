# Audit: `src/pages/admin/ApplicationReviewPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 458 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 4 | 2 |
| Fixed | 1 | 0 | 1 | 0 |

The big one: admins can't actually view the credential documents they're supposed to be reviewing. `<a href={doc.file_path}>` uses the **raw storage path** (not a signed URL), so clicks 404. Admins approve professionals while blind to the docs.

---

## Findings

### F-AR01 · Document "View" link uses raw storage path — admin can't see credentials · 🔴 P0 → fixed-in-this-audit
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:372-377](src/pages/admin/ApplicationReviewPage.jsx#L372)

**What:** `<a href={doc.file_path} target="_blank">` — but `file_path` is a storage path like `userId/1700-credentials.pdf` (private `documents` bucket; see [lib/storage.js:71](src/lib/storage.js#L71) and the contract on L4-11). The browser navigates to `https://immizy.app/userId/1700-credentials.pdf` which the SPA can't serve.

[client/DocumentsPage.jsx:88](src/pages/client/DocumentsPage.jsx#L88) does it correctly via `getSignedUrl(doc.file_path, 300)`.

**Why it matters:** This is the **only document review surface on the platform** that admins use to approve immigration consultants. They click "View", get a 404, and either (a) approve without seeing credentials or (b) reject in frustration. The platform's trust-and-safety story depends on these reviews.

**Fix:** Convert the link into a button that calls `getSignedUrl(doc.file_path, 300)` on click and opens the resulting signed URL in a new tab.

**Status:** fixed-in-this-audit.

---

### F-AR02 · Notes stored in `notification_preferences.application_notes` — overloaded column · 🟠 P1
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:96-103](src/pages/admin/ApplicationReviewPage.jsx#L96)

**What:** Admin's internal note about an application is saved into the user's `notification_preferences` JSON. That column was designed to hold the user's email/notification settings — overloading it means:
- The applicant's own preference update could clobber the admin's note (RLS-permitting).
- Future schema migration on `notification_preferences` could lose audit data.
- Searching/filtering applications by note content is impossible.

**Why it matters:** Notes are part of the approval rationale. They should be in an `application_reviews` table with `reviewer_id`, `note`, `created_at`. The audit log captures the action but not the multi-line note (only the first 1000 chars in `details`).

**Fix:** Migrate to a dedicated `application_reviews` table. Until then, prefix the note key (e.g. `__admin_application_notes__`) and add RLS that only admins can write that key. The current implementation could be silently overwritten by a client-side `updateProfile({ notification_preferences: ... })` call.

**Status:** documented.

---

### F-AR03 · `saveNote` doesn't return error — silent failure before approve/reject · 🟠 P1
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:96-130](src/pages/admin/ApplicationReviewPage.jsx#L96)

**What:** `await saveNote(...)` is called before approve/reject but its errors are swallowed. If the note write fails (RLS, network, concurrent update), the approval still proceeds with no note, no warning.

**Fix:** Have `saveNote` return `{ error }`, surface it, and let the admin retry before the mutation.

**Status:** documented.

---

### F-AR04 · `executeApprove` / `executeReject` write `is_verified = true/false` regardless of the consultant credentials reviewed · 🟡 P2
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:110-113, 137-140](src/pages/admin/ApplicationReviewPage.jsx#L110)

**What:** Approve always sets `is_verified=true`. But "approved to use the platform" and "verified credentials" are two different statuses on most professional networks (LinkedIn distinguishes them). One admin click conflates them.

**Fix:** Either two buttons (Approve + Mark Verified), or a checkbox in the modal ("Also mark as Verified — adds the badge"). Currently the user is verified the moment they're approved.

**Status:** documented.

---

### F-AR05 · `documents.created_at` (`doc.created_at`) used for "ago" without timezone awareness · 🟡 P2
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:88-94](src/pages/admin/ApplicationReviewPage.jsx#L88)

**What:** Standard `Date.now() - new Date(ts)` — works on ISO strings but is fragile if the column is ever returned as a plain UTC string without `Z`. Adds nothing critical, just flagging the manual `Math.floor(diff/3600000)` — `Intl.RelativeTimeFormat` is cleaner.

**Status:** documented.

---

### F-AR06 · Slack notification on rejection includes the **note** which may contain PII · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:152](src/pages/admin/ApplicationReviewPage.jsx#L152)

**What:** `slackNotify('application.rejected', { ..., note: note.trim() })` — the rejection note can mention the applicant by full name, document references, immigration status. That gets posted to Slack where retention policies and access controls may not match the platform's RLS.

**Fix:** Don't include the note in the Slack payload — link to the platform instead.

**Status:** fixed-in-this-audit.

---

### F-AR07 · `selectedApp` state mutation race after `fetchApplications()` · 🟡 P2
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:57-61](src/pages/admin/ApplicationReviewPage.jsx#L57)

**What:** `fetchApplications` resets `selectedApp` when filter changes, but also auto-picks the first one. On a slow network this means: user clicks app 3 → changes filter to "Approved" → fetch returns 0.5s later → selectedApp jumps to whatever's at index 0 of the new list. UX is jumpy.

**Fix:** Wrap the auto-select in a check: `if (!selectedApp && apps.length > 0) setSelectedApp(apps[0])`. Or skip auto-select entirely.

**Status:** documented.

---

### F-AR08 · Avatar `<img src={selectedApp.avatar_url}>` not validated against safe origins · 🔵 P3
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:285](src/pages/admin/ApplicationReviewPage.jsx#L285)

**Same** family as F-CP06.

**Status:** documented.

---

### F-AR09 · Pending count chip only shows when `activeFilter === 'pending'` — admin browsing approved tab has no signal of pending backlog · 🔵 P3
**Where:** [src/pages/admin/ApplicationReviewPage.jsx:216](src/pages/admin/ApplicationReviewPage.jsx#L216)

**Status:** documented.
