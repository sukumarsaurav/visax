# Audit: `src/pages/landing/ConsultantProfilePage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 1 | P3: 2

Public profile for consultants. Issues: booking link validation missing, timezone display unclear.

---

## Findings
- **F-CP01** · Book button links not validated (P2)
- **F-CP02** · Availability shown in UTC not local timezone (P3)
- **F-CP03** · Review count not authenticated (P3)
