# Audit: `src/pages/admin/DashboardPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 266 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 3 | 3 |
| Fixed | 0 | 0 | 0 | 0 |

This is a well-shaped dashboard — single RPC for stats (avoiding the prior-audit unbounded scans), proper skeletons, and a clean role-counts derivation. Issues are mostly cosmetic/UX.

---

## Findings

### F-AD01 · `Math.max(...arr)` inside `monthlyRevenue.map` recomputed per item · 🟡 P2 → fixed-in-this-audit
**Where:** [src/pages/admin/DashboardPage.jsx:146](src/pages/admin/DashboardPage.jsx#L146)

**What:** `const max = Math.max(...monthlyRevenue.map(x => Number(x.revenue || 0)), 1)` is hoisted inside the `.map((m, i) =>` callback — recalculated 6 times for 6 months. Trivial perf cost but it's an O(n²) pattern that gets copy-pasted.

**Fix:** Hoist out of the loop.

**Status:** fixed-in-this-audit.

---

### F-AD02 · Loading skeletons differ per panel — total skeleton size doesn't match loaded UI · 🟡 P2
**Where:** [src/pages/admin/DashboardPage.jsx:60-62, 134-141](src/pages/admin/DashboardPage.jsx#L60)

**What:** The KPI cards skeleton is a flat 28px row, but the loaded card is taller (~88px). This causes a visible layout shift on transition.

**Fix:** Match skeleton height to loaded card.

**Status:** documented.

---

### F-AD03 · "Total Revenue" displayed as `$` (USD) but invoice currency may differ · 🟡 P2
**Where:** [src/pages/admin/DashboardPage.jsx:66](src/pages/admin/DashboardPage.jsx#L66)

**What:** `total_revenue` from the RPC is summed regardless of source currency. Razorpay charges in INR (see [ProfessionalRegisterPage:413](src/pages/auth/ProfessionalRegisterPage.jsx#L413)). Showing the sum with a `$` prefix is misleading at best, materially wrong at worst.

**Fix:** Either show INR (₹), or have the RPC normalise to a single reporting currency and label it. If a global admin dashboard mixes currencies, label it.

**Status:** documented — needs RPC + product input.

---

### F-AD04 · "Pending Review" header `<h3>` is `text-2xl` but other StatCard values are `text-3xl` (visual inconsistency) · 🔵 P3
**Where:** [src/pages/admin/DashboardPage.jsx:72-81](src/pages/admin/DashboardPage.jsx#L72)

**What:** Custom inline card breaks the StatCard typography.

**Fix:** Convert to `<StatCard title="Pending Review" value={...} icon="pending_actions" color="amber" />` to keep visual rhythm.

**Status:** documented.

---

### F-AD05 · `roleCounts` recomputed on every render but the inputs are derived from `stats` (memo candidate) · 🔵 P3
**Where:** [src/pages/admin/DashboardPage.jsx:31-37, 220-228](src/pages/admin/DashboardPage.jsx#L31)

**What:** Three calculations of `clients/consultants/agencies` happen each render. With the conic-gradient string the recomputation is non-trivial. A `useMemo([stats])` would help.

**Status:** documented.

---

### F-AD06 · Avatar in Recent Registrations doesn't link to user detail · 🔵 P3
**Where:** [src/pages/admin/DashboardPage.jsx:200-206](src/pages/admin/DashboardPage.jsx#L200)

**What:** Hover state but no `<Link>`. Clicking the user row does nothing.

**Fix:** Wrap in `<Link to={\`/admin/user-management?id=${u.id}\`}>`. UserManagementPage would need to react to that param.

**Status:** documented.
