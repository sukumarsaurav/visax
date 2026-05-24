# Audit: `src/pages/landing/ImmigrationRouter.jsx`

**Audited:** 2026-05-24 · **LOC:** 29 · **Role gate:** Public (no auth required)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 0 | 0 |

Dispatcher component for `/immigration/:slug` route. Checks OCCUPATIONS first (because occupation slugs contain destination slug as prefix), then DESTINATIONS, then falls through to DestinationPage. No issues found.

---

## Findings

None documented.
