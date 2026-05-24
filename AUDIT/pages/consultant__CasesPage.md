# Audit: `src/pages/consultant/CasesPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Case management for consultants. Good status tracking. Issues: bulk status update not rate-limited, no audit trail for status changes.

---

## Findings
- **F-CS01** · Bulk status update has no rate limiting (P2)
- **F-CS02** · Status change history not visible (P2)
- **F-CS03** · No email notification on case status change (P3)
