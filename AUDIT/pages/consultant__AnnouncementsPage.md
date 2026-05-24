# Audit: `src/pages/consultant/AnnouncementsPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 1 | P2: 1 | P3: 1

Internal announcements for team. Issues: XSS risk if rendered as HTML, no edit capability.

---

## Findings
- **F-AN01** · Announcement content rendered without sanitization (P1)
- **F-AN02** · No edit capability after publish (P2)
- **F-AN03** · No scheduling for future announcements (P3)
