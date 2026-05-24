# Audit: `src/pages/admin/AuditLogPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 295 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 1 | 4 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

The page correctly escapes all output and uses pagination. One accessibility issue: the expand/collapse button row has no aria-label. Search inputs lack associated labels (placeholders only). Export CSV has no error handling.

---

## Findings

### F-AL01 · Expand/collapse button has no aria-label · 🟠 P1
**Where:** [src/pages/admin/AuditLogPage.jsx:237-240](src/pages/admin/AuditLogPage.jsx#L237)

**What:** The button shows an icon (expand_more / expand_less) but announces only "button" to screen readers, with no context about what it does.

**Fix:** `aria-label={`View details for ${log.action}`}`.

**Status:** documented.

---

### F-AL02 · Search inputs lack labels — only placeholder text · 🟡 P2
**Where:** [src/pages/admin/AuditLogPage.jsx:130-138, 141-149](src/pages/admin/AuditLogPage.jsx#L130)

**What:** The action and user search inputs (L132, L143) have `placeholder` but no `<label>` with `htmlFor`, so screen readers can't pair input to label.

**Fix:** Wrap each input in `<label>`, add `id` to the input, set `htmlFor` on the label.

**Status:** documented.

---

### F-AL03 · `exportCSV` has no error handling — silent failure if blob creation fails · 🟡 P2
**Where:** [src/pages/admin/AuditLogPage.jsx:83-101](src/pages/admin/AuditLogPage.jsx#L83)

**What:** If `new Blob()` or `URL.createObjectURL()` fails, the function silently exits. The user clicks "Export" and nothing happens, no feedback.

**Fix:** Wrap in try-catch and `toast.error()` on failure.

**Status:** documented.

---

### F-AL04 · Expanded detail row rendering creates empty rows for non-matching logs · 🟡 P2
**Where:** [src/pages/admin/AuditLogPage.jsx:246-269](src/pages/admin/AuditLogPage.jsx#L246)

**What:** Line 246 maps over all logs again to render the detail row: `logs.map(log => selectedLog?.id === log.id ? (...) : null)`. This creates one (hidden) null per log, even if only one log is expanded. Inefficient.

**Fix:** Track expanded log in state and render detail only for that one.

**Status:** documented.

---

### F-AL05 · CSV export timestamps lack timezone info — exported times may look wrong in non-UTC timezones · 🟡 P2
**Where:** [src/pages/admin/AuditLogPage.jsx:86](src/pages/admin/AuditLogPage.jsx#L86)

**What:** Line 86: `new Date(l.created_at).toISOString()` exports the UTC time, but the browser displays it as local time in the UI. The CSV will show "2026-05-24T15:30:00Z" but the user's local display showed "11:30 AM" (if in UTC-4). Exported CSV won't match what they see on screen.

**Fix:** Export `toLocaleString()` or include timezone abbreviation in the CSV header.

**Status:** documented.

---

### F-AL06 · Function named `AdminAuditLog` but export default is unnamed · 🔵 P3
**Where:** [src/pages/admin/AuditLogPage.jsx:27](src/pages/admin/AuditLogPage.jsx#L27)

**What:** The function is declared as `export default function AdminAuditLog()` but the filename is `AuditLogPage.jsx`, and other admin pages follow the `PageName` convention. Inconsistent.

**Fix:** Rename to `AuditLogPage`.

**Status:** documented.
