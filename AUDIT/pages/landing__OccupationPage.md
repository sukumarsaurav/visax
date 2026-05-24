# Audit: `src/pages/landing/OccupationPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 115 · **Role gate:** Public (no auth required)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 0 | 0 |

Shares `/immigration/:destination` route with DestinationPage. Dispatcher logic checks OCCUPATIONS first, then falls through to DestinationPage redirect. No issues found.

---

## Findings

None documented.
