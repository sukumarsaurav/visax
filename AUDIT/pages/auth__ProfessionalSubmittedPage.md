# Audit: `src/pages/auth/ProfessionalSubmittedPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 148 · **Role gate:** `<ProtectedRoute allowedRoles={['individual', 'agency_admin']}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 2 | 1 |
| Fixed | 0 | 1 | 1 | 0 |

The interesting bug: the "application ID" is generated once at module load and reused for **every visitor** until the bundle is reloaded.

---

## Findings

### F-PS01 · `appId` generated at module scope — same ID for every user · 🟠 P1 → fixed-in-this-audit
**Where:** [src/pages/auth/ProfessionalSubmittedPage.jsx:4-10](src/pages/auth/ProfessionalSubmittedPage.jsx#L4)

**What:**
```js
function generateAppId() { /* random */ }
const appId = generateAppId()       // ← evaluated ONCE per JS module
```

The constant is exported across every render, so every user who lands on this page sees the same `#APP-2026-12345`. If they screenshot it for support, support sees a meaningless ID.

**Why it matters:** Misleading; obstructs support workflows that ask for the application ID.

**Fix:** Two options:
- Make it look-once per session: `const [appId] = useState(generateAppId)`.
- Better: render the user's actual `application_id` from their profile (after server-side creation). The cosmetic random ID is dishonest UI.

**Status:** fixed-in-this-audit with the `useState` fix (the proper "fetch real ID" version needs a backing column and is a larger change).

---

### F-PS02 · "Go to Dashboard" CTA hardcoded to `/consultant` — wrong for agency_admin · 🟠 P1 → fixed-in-this-audit
**Where:** [src/pages/auth/ProfessionalSubmittedPage.jsx:128](src/pages/auth/ProfessionalSubmittedPage.jsx#L128)

**What:** Agency admin users get sent to `/consultant`, where `ProtectedRoute` bounces them to `/agency`. Two redirects on a CTA isn't the world but it's sloppy.

**Fix:** Use `useAuth().getDashboardPath()`.

**Status:** fixed-in-this-audit.

---

### F-PS03 · Top-nav "Dashboard / Resource Library / Settings / Global Services" are non-functional `<span>` with `cursor-default` · 🟡 P2
**Where:** [src/pages/auth/ProfessionalSubmittedPage.jsx:49-54](src/pages/auth/ProfessionalSubmittedPage.jsx#L49)

**What:** Looks like a working nav, is dead. Visitors hover, see no pointer, get confused.

**Fix:** Either remove the nav block entirely (this is a transient post-submit page, doesn't need it), or make them real links.

**Status:** documented — recommend removing.

---

### F-PS04 · Help link `/help` is fine (redirects to /support per App.jsx), but worth noting the indirection · 🔵 P3
**Where:** [src/pages/auth/ProfessionalSubmittedPage.jsx:140](src/pages/auth/ProfessionalSubmittedPage.jsx#L140)

**Status:** documented (no action).
