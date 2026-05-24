# Audit: `src/pages/auth/ProfessionalRegisterPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 1121 · **Role gate:** none (public; creates `individual` / `agency_admin` accounts)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 6 | 3 |
| Fixed | 0 | 0 | 2 | 1 |

A solid multi-step form with **excellent** Razorpay flow (idempotent intent, terminal-state guards, ondismiss handling). The weakness is the front-end policy — weaker password rules than the client RegisterPage, no per-step `useUnsavedChangesGuard` deps refresh, and a few input semantics gaps. Also flagged: 500-line file mixing presentation + payment orchestration.

---

## Findings

### F-PR01 · Step-1 password validator is `password.length < 8` — far weaker than `checkPassword` · 🟠 P1
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:239](src/pages/auth/ProfessionalRegisterPage.jsx#L239)

**What:** Client signup uses `checkPassword` (≥10 chars, 3 classes, blocklist). Professional signup — for **paid agency accounts that hold client PII** — uses just length≥8.

**Why it matters:** The accounts most worth attacking (paying agencies with case files, immigration documents, payment data) have the weakest password policy on the platform.

**Fix:** Reuse `checkPassword(password, { email })` and surface the error in `errors.password`.

**Status:** documented — the entire validation lift to align with checkPassword is a small but visible UX change (existing users mid-signup might fail), so flagging rather than inline.

---

### F-PR02 · Loose email regex `/\S+@\S+\.\S+/` (vs `isEmail`) · 🟠 P1 → fixed-in-this-audit
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:238](src/pages/auth/ProfessionalRegisterPage.jsx#L238)

**Status:** fixed-in-this-audit.

---

### F-PR03 · Language tag entry: no dedupe, no per-tag length cap, no count cap · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:791-797](src/pages/auth/ProfessionalRegisterPage.jsx#L791)

**What:** A user can press Enter 200 times with the same string. Adds `["english","english","english"...]`. There's also no length cap per tag — pasting a 1MB string is accepted.

**Fix:** Trim, lowercase-compare for dedupe, cap to 12 languages, cap each at 30 chars.

**Status:** fixed-in-this-audit.

---

### F-PR04 · Phone input accepts any string (no shape check) · 🟡 P2
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:732-739](src/pages/auth/ProfessionalRegisterPage.jsx#L732)

**What:** `lib/validators.isPhone` exists but isn't called here. Form accepts e.g. "abc123" which becomes "+1 abc123" in the profile.

**Fix:** Validate at step transition: `if (phone && !isPhone(phone)) e.phone = 'Enter a valid phone number'`.

**Status:** documented.

---

### F-PR05 · `useUnsavedChangesGuard` doesn't track expertise/services/agency fields, photos, or uploaded docs · 🟡 P2
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:215-217](src/pages/auth/ProfessionalRegisterPage.jsx#L215)

**What:** Guard only fires when name/email/bio/expertise are dirty. A user 90% through step 3 (agency details + plan, no expertise) can close the tab without a warning, losing 5 minutes of typing.

**Fix:** Expand the condition: `firstName || lastName || email || bio || expertise.length || services.length || agencyName || avatarFile || uploadedFiles.length`.

**Status:** documented.

---

### F-PR06 · Avatar `URL.createObjectURL` never revoked (memory leak on each pick) · 🟡 P2
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:520](src/pages/auth/ProfessionalRegisterPage.jsx#L520)

**What:** Every avatar pick allocates an object URL via `URL.createObjectURL(file)` and stores in state, but never calls `URL.revokeObjectURL(prevPreview)` on replacement or unmount.

**Why it matters:** Small leak per re-upload; matters mostly during testing but is a hygiene issue.

**Fix:**
```js
useEffect(() => () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview) }, [avatarPreview])
```

**Status:** documented.

---

### F-PR07 · Inputs missing `autoComplete` (email, name fields) and `htmlFor`/`id` pairs · 🟡 P2
**Where:** throughout the file

**Fix:** Same pattern as RegisterPage — `autoComplete="given-name" / family-name / email / new-password / tel`, and pair labels with ids.

**Status:** documented (mechanical change across 50+ inputs — would inflate the diff; flagging as a focused follow-up).

---

### F-PR08 · `setLanguages` Enter handler doesn't clear input on dedupe skip · 🔵 P3
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:791-797](src/pages/auth/ProfessionalRegisterPage.jsx#L791)

**Status:** fixed-in-this-audit (folded into F-PR03 fix).

---

### F-PR09 · File ~1100 lines — payment orchestration mixed with presentation · 🔵 P3
**What:** The Razorpay flow (110 lines of handler logic) lives inline. It would test better as `src/lib/billing/razorpayCheckout.js` accepting `{ planId, userId, idempotencyKey, prefill }` and returning `Promise<{ paymentId }>`. Same for `loadRazorpay`.

**Status:** documented.

---

### F-PR10 · Hardcoded plan prices in JS, not from DB · 🔵 P3
**Where:** [src/pages/auth/ProfessionalRegisterPage.jsx:32-58](src/pages/auth/ProfessionalRegisterPage.jsx#L32)

**What:** Prices live in JS. If marketing wants to change the Growth plan from ₹8,999 to ₹9,999, that needs a code deploy — and the server-side `create-razorpay-order` edge function presumably hardcodes the same. If they drift, users pay one amount and see another.

**Status:** documented.
