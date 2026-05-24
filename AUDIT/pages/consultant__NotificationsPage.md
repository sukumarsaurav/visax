# Audit: `src/pages/consultant/NotificationsPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Notification management and preferences. Issues: marking all as read has no confirmation, preferences not persistent.

---

## Findings
- **F-NT01** · Bulk mark-as-read has no undo (P2)
- **F-NT02** · Notification preferences reset on logout (P2)
- **F-NT03** · No notification deduplication (P3)
