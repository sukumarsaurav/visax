# Audit: `src/pages/client/DashboardPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 256 · **Role gate:** `<ProtectedRoute allowedRoles={CLIENT}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 2 | 2 |
| Fixed | 0 | 0 | 0 | 0 |

A well-designed client dashboard with good accessibility, error handling, and UX patterns. Uses hooks for data (cases, appointments, invoices). Onboarding checklist stored in localStorage. Minor issues: hardcoded locale in currency formatter, potential appointment ordering assumption.

---

## Findings

### F-CD01 · `formatAmount` uses hardcoded 'en-US' locale · 🟡 P2
**Where:** [src/pages/client/DashboardPage.jsx:104-106](src/pages/client/DashboardPage.jsx#L104)

**What:** Currency formatting always uses US locale/format. Users in other regions get wrong date/number formatting.

**Fix:** Use user's locale from settings or browser: `navigator.language`.

**Status:** documented.

---

### F-CD02 · `upcoming[0]` assumes appointments are sorted by date · 🟡 P2
**Where:** [src/pages/client/DashboardPage.jsx:117](src/pages/client/DashboardPage.jsx#L117)

**What:** "Next Appointment" is just the first item in `upcoming` array. If `useAppointments` doesn't sort by scheduled_at, this could show a past appointment.

**Fix:** Verify hook sorts by date, or sort client-side.

**Status:** documented.

---

### F-CD03 · Name display assumes space-separated format · 🔵 P3
**Where:** [src/pages/client/DashboardPage.jsx:124](src/pages/client/DashboardPage.jsx#L124)

**What:** `profile?.full_name?.split(' ')[0]` assumes first-space-separated token is the first name. Works for "John Smith" but "Madonna" would show "Madonna", which is correct. Not a real issue, just noted.

**Status:** documented.

---

### F-CD04 · Inconsistent skeleton loader for invoices · 🔵 P3
**Where:** [src/pages/client/DashboardPage.jsx:228](src/pages/client/DashboardPage.jsx#L228)

**What:** Cases/appointments show 2 skeleton rows, invoices show 1. Minor UX inconsistency.

**Status:** documented.
