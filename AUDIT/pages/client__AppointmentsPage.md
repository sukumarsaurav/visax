# Audit: `src/pages/client/AppointmentsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** ~200 · **Role gate:** `<ProtectedRoute allowedRoles={CLIENT}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 2 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

Appointments list and booking page. Good state management. Issues: no timezone display for times, missing cancellation confirmation.

---

## Findings

### F-AP01 · Appointment times shown without timezone · 🟡 P2
**Where:** Appointments page

**What:** `formatDateTime` shows local time but users in different timezones might be confused.

**Status:** documented.

---

### F-AP02 · Cancel appointment missing confirmation dialog · 🟡 P2
**Where:** Appointments cancellation

**What:** No confirmation before cancelling; accidental cancellations possible.

**Status:** documented.

---

### F-AP03 · Video/phone appointment links not validated · 🔵 P3
**Where:** Join meeting button

**What:** Links to meeting URLs should validate format.

**Status:** documented.
