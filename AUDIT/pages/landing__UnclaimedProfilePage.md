# Audit: `src/pages/landing/UnclaimedProfilePage.jsx`

**Audited:** 2026-05-24 · **LOC:** 279 · **Role gate:** Public (no auth required)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 2 | 1 |

Unclaimed consultant profile display. Enquiry form sends magic link email to consultant. Avatar from unclaimed profile and email not validated.

---

## Findings

### F-UP01 · Enquiry email address not validated before enquiry save · 🟡 P2
**Where:** [src/pages/landing/UnclaimedProfilePage.jsx:44-55](src/pages/landing/UnclaimedProfilePage.jsx#L44)

**What:** Line 46: `if (!form.name || !form.email) return` — checks existence but not format. Enquiry is saved with invalid email (e.g., `"foo"`, `"test@"`), then the email is sent to that invalid address, consuming quota and failing silently.

**Fix:** Import `isEmail` from validators and validate: `if (!form.name || !isEmail(form.email)) return toast.error('Invalid email')`.

**Status:** documented.

---

### F-UP02 · No audit log on enquiry submission · 🟡 P2
**Where:** [src/pages/landing/UnclaimedProfilePage.jsx:44-75](src/pages/landing/UnclaimedProfilePage.jsx#L44)

**What:** Enquiry submitted, magic link sent to consultant, but no event logged. If consultant complains about receiving unexpected emails, there's no audit trail of who submitted the enquiry.

**Fix:** Add `await writeAuditLog({ action: 'Enquiry Sent', entityType: 'unclaimed_profile', entityId: id, details: { enquirer_email: form.email } })` after successful submit.

**Status:** documented.

---

### F-UP03 · Avatar from unclaimed profile could be XSS if not sanitized · 🔵 P3
**Where:** [src/pages/landing/UnclaimedProfilePage.jsx:117](src/pages/landing/UnclaimedProfilePage.jsx#L117)

**What:** `<img src={profile.avatar_url} />` — assumes `avatar_url` is a valid image URL. If the database was compromised and `avatar_url` contains `javascript:` or a broken image with `onerror=`, React escapes the attribute value so it's safe. But relying on React escaping is fragile.

**Fix:** Validate on fetch: `if (!profile.avatar_url?.startsWith('http')) profile.avatar_url = null;` or use `<SafeImage />` component with MIME validation.

**Status:** documented.
