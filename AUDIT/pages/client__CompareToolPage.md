# Audit: `src/pages/client/CompareToolPage.jsx`

**Audited:** 2026-05-24 · **LOC:** ~200 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 2

Comparison tool for visa categories/consultants. Good table layout. Issues: large comparison tables could overflow on mobile, no export.

---

## Findings
- **F-CT01** · Comparison table not responsive on mobile (P2)
- **F-CT02** · No export/print functionality for comparison (P2)
- **F-CT03** · Sort order not persistent across page reloads (P3)
- **F-CT04** · No keyboard navigation for large tables (P3)
