# Audit: `src/pages/consultant/AppointmentsPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Schedule management for consultants. Good calendar layout. Issues: no double-booking prevention, timezone handling unclear.

---

## Findings
- **F-AP01** · No validation preventing double bookings (P2)
- **F-AP02** · Timezone selector doesn't persist (P2)
- **F-AP03** · Bulk rescheduling not available (P3)
