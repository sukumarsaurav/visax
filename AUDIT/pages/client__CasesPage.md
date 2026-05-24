# Audit: `src/pages/client/CasesPage.jsx`

**Audited:** 2026-05-24 · **LOC:** ~150 · **Role gate:** `<ProtectedRoute allowedRoles={CLIENT}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 1 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

A simple list page showing client cases with good error handling and empty state. Minor issue: plural text handling uses ternary (good), but status colors hardcoded.

---

## Findings

### F-CP01 · Status color mapping is hardcoded · 🟡 P2
**Where:** Client cases page

**What:** Status-to-color mapping defined locally instead of shared constant with other pages.

**Fix:** Extract to shared constants.

**Status:** documented.

---

### F-CP02 · Loading state shows 3 skeleton items always · 🔵 P3
**Where:** Client cases page

**What:** Skeleton shows 3 rows regardless of actual data size for better UX perception.

**Status:** documented.
