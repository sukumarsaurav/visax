# Audit: `src/pages/consultant/TeamAvailabilityPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 1 | P3: 2

Team-wide availability view. Issues: no conflict detection, calendar sync not automatic.

---

## Findings
- **F-TA01** · No check for double-booked consultants (P2)
- **F-TA02** · Google Calendar sync manual only (P3)
- **F-TA03** · No team-level scheduling rules (P3)
