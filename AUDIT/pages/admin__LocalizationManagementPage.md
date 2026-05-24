# Audit: `src/pages/admin/LocalizationManagementPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 350 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 2 | 6 | 4 |
| Fixed | 0 | 0 | 0 | 0 |

A localization and translation management page. The "Add Language" button is non-functional (no onClick handler). CSV import is listed in the accept attribute but not implemented. Export has no error handling. Multiple accessibility issues (missing aria-labels, unlabeled inputs).

---

## Findings

### F-LM01 · "Add Language" button has no onClick handler — doesn't work · 🟠 P1
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:125](src/pages/admin/LocalizationManagementPage.jsx#L125)

**What:** Line 125: `<Button icon="add">Add Language</Button>` has no onClick prop. Clicking it does nothing.

**Fix:** Add onClick handler that opens a modal or form to add a new language to the state.

**Status:** documented.

---

### F-LM02 · CSV import is listed but not implemented — accept=".csv" with JSON.parse only · 🟠 P1
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:299-311](src/pages/admin/LocalizationManagementPage.jsx#L299)

**What:** Line 299: `<input type="file" accept=".json,.csv" />` but the handler (L304) only calls `JSON.parse(text)`. CSV files will fail to parse and show "Invalid JSON file" error.

**Fix:** Either remove `.csv` from accept, or implement CSV parsing.

**Status:** documented.

---

### F-LM03 · Export function has no error handling — blob creation can fail silently · 🟡 P2
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:77-83](src/pages/admin/LocalizationManagementPage.jsx#L77)

**What:** Same issue as AuditLogPage — if `new Blob()` or `URL.createObjectURL()` fails, the user clicks Export and nothing happens.

**Fix:** Wrap in try-catch and `showToast('Export failed', 'error')` on failure.

**Status:** documented.

---

### F-LM04 · Import file input has no size validation · 🟡 P2
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:299-311](src/pages/admin/LocalizationManagementPage.jsx#L299)

**What:** No size check on the file. A user could upload a 500MB JSON file and it would attempt to parse it into state.

**Fix:** Check `file.size > 5 * 1024 * 1024` before `file.text()`.

**Status:** documented.

---

### F-LM05 · No audit log on language toggle or settings save · 🟡 P2
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:56-68](src/pages/admin/LocalizationManagementPage.jsx#L56)

**What:** Toggling a language active/inactive or changing global settings (default language, currency, date format) writes nothing to the audit log.

**Fix:** Import `writeAuditLog` and add calls to `handleToggleLang` and `handleSaveGlobal`.

**Status:** documented.

---

### F-LM06 · Toggle switches lack aria-labels · 🟡 P2
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:180-182, 270-273](src/pages/admin/LocalizationManagementPage.jsx#L180)

**What:** Both toggle buttons (language status and date format auto) announce only "button" to screen readers.

**Fix:** Add `aria-label={`Toggle ${...}`}` to each toggle.

**Status:** documented.

---

### F-LM07 · Translation textareas lack label associations · 🟡 P2
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:228-234](src/pages/admin/LocalizationManagementPage.jsx#L228)

**What:** The textarea (L228) has a label above it (L225) but no htmlFor/id pairing.

**Fix:** Add `id` to textarea and `htmlFor` to label.

**Status:** documented.

---

### F-LM08 · Search input lacks label — only placeholder for accessibility · 🟡 P2
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:138-142](src/pages/admin/LocalizationManagementPage.jsx#L138)

**What:** The search input has a search icon and placeholder but no `<label>` with `htmlFor`.

**Fix:** Add `id` to input and wrap in `<label htmlFor={id}>` or use aria-label.

**Status:** documented.

---

### F-LM09 · Custom toast state duplicates global react-hot-toast · 🔵 P3
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:29, 32-35](src/pages/admin/LocalizationManagementPage.jsx#L29)

**What:** The page imports `Card` and `Button` but not `react-hot-toast`. Instead, it defines its own `toast` state and `showToast` function (L32-35), duplicating the global toast pattern.

**Fix:** Import `toast` from `react-hot-toast` and use `toast.success()` / `toast.error()`.

**Status:** documented.

---

### F-LM10 · Translation keys are hardcoded — no way to add new keys · 🔵 P3
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:85-92](src/pages/admin/LocalizationManagementPage.jsx#L85)

**What:** TRANSLATION_KEYS is a hardcoded array of 6 keys. There's no UI to add new translation keys, so the translations system can't be extended without code changes.

**Status:** documented — architectural decision.

---

### F-LM11 · Translation progress is static — not calculated from actual translations · 🔵 P3
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:170](src/pages/admin/LocalizationManagementPage.jsx#L170)

**What:** The progress bar (L170) displays `lang.progress` from the hardcoded DEFAULT_LANGUAGES array (8, 85, 42, 60). This doesn't reflect actual translation coverage.

**Status:** documented — architectural decision.

---

### F-LM12 · Currency select is limited to 3 options · 🔵 P3
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:277-284](src/pages/admin/LocalizationManagementPage.jsx#L277)

**What:** Only USD, EUR, GBP are available. Some markets (India, Nigeria, etc.) need INR, NGN, etc.

**Status:** documented.

---

### F-LM13 · Documentation link is a placeholder · 🔵 P3
**Where:** [src/pages/admin/LocalizationManagementPage.jsx:343](src/pages/admin/LocalizationManagementPage.jsx#L343)

**What:** `<a className="..." href="#">Read Documentation →</a>` — the href is `#`, which won't navigate anywhere.

**Fix:** Link to actual documentation, or remove the link if it doesn't exist yet.

**Status:** documented.
