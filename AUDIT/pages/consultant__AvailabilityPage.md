# Audit: `src/pages/consultant/AvailabilityPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 1 | P3: 2

Availability/hours setup page. Good form structure. Issues: time range validation incomplete, no holidays support.

---

## Findings
- **F-AV01** · End time can be before start time (P2)
- **F-AV02** · No holiday/blackout date support (P3)
- **F-AV03** · Availability changes take effect immediately (P3)
