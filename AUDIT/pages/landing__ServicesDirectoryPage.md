# Audit: `src/pages/landing/ServicesDirectoryPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 284 · **Role gate:** Public (no auth required)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 1 | 1 |

Pagination and search implementation. Uses `sanitizeSearch()` for XSS prevention on query display. Minor issue: `sortBy` select accepts any string value without validation.

---

## Findings

### F-SD01 · `sortBy` select accepts arbitrary values · 🔵 P3
**Where:** [src/pages/landing/ServicesDirectoryPage.jsx:172-179](src/pages/landing/ServicesDirectoryPage.jsx#L172)

**What:** The `sortBy` dropdown passes its value directly to `servicesRepo.search({ sortBy })` without validating it's one of the expected enum values (`newest`, `price_asc`, `price_desc`). A modified request could send `sortBy: 'drop_table_users'` to the API.

**Fix:** Validate on change: `const validSorts = ['newest', 'price_asc', 'price_desc']; if (!validSorts.includes(e.target.value)) return;`

**Status:** documented.

---

### F-SD02 · Service icons rotate through hardcoded array without bounds checking · 🟡 P2
**Where:** [src/pages/landing/ServicesDirectoryPage.jsx:209](src/pages/landing/ServicesDirectoryPage.jsx#L209)

**What:** `ICON_COLORS[idx % ICON_COLORS.length]` — while safe, the pattern assumes the array has items. If `ICON_COLORS` becomes empty, `% 0` throws. Defensive: check array length on module load or use fallback.

**Fix:** Add at module top: `if (ICON_COLORS.length === 0) console.warn('ICON_COLORS is empty')` or use default: `ICON_COLORS[idx % (ICON_COLORS.length || 1)]`.

**Status:** documented.
