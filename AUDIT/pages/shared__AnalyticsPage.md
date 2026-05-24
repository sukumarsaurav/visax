# Audit: `src/pages/analytics/AnalyticsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 100+ (partial audit due to size limit) · **Role gate:** Protected (role-based: clients, consultants, agency_admin)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 1 | 0 |

Analytics dashboard with role-aware data fetching. Visible sections show correct RPC calls and stats aggregation. One finding on max calculation.

---

## Findings

### F-AP01 · `maxCases` calculation could divide by zero or crash with empty array · 🟡 P2
**Where:** [src/pages/analytics/AnalyticsPage.jsx:98](src/pages/analytics/AnalyticsPage.jsx#L98)

**What:** `Math.max(...teamStats.map(m => m.caseCount), 1)` — the spread with a default of `1` works, but if `teamStats` is `undefined` or not an array, `.map()` throws. Defensive check should precede.

**Fix:** `const maxCases = (isAgencyAdmin && Array.isArray(teamStats) && teamStats.length > 0) ? Math.max(...teamStats.map(m => m.caseCount || 0)) : 1`.

**Status:** documented.
