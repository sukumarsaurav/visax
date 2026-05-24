# Audit: `src/pages/consultant/DashboardPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Consultant dashboard showing clients, appointments, earnings. Good state management. Issues: hardcoded locale for earnings display, no timezone for appointment times.

---

## Findings
- **F-CD01** · Earnings display hardcoded to USD (P2)
- **F-CD02** · Appointment times shown without timezone context (P2)
- **F-CD03** · No earnings chart - just total amount (P3)
