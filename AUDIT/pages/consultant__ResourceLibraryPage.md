# Audit: `src/pages/consultant/ResourceLibraryPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 1 | P3: 2

Document/resource sharing library. Issues: file access not audit-logged, large file uploads slow.

---

## Findings
- **F-RL01** · Resource downloads not logged (P2)
- **F-RL02** · No file size limits on uploads (P3)
- **F-RL03** · No resource expiration/archival (P3)
