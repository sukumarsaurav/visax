# Audit: `src/pages/landing/FindProfessionalsPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Search/browse page for professionals. Issues: filters not persisted in URL, no pagination.

---

## Findings
- **F-FP01** · Search state lost on refresh (P2)
- **F-FP02** · No pagination for large result sets (P2)
- **F-FP03** · Ratings not validated format (P3)
