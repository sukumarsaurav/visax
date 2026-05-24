# Audit: `src/pages/account/AccountDataPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 320 · **Role gate:** Protected (`<ProtectedRoute>` required, checks `user` exists)

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 0 | 0 | 1 | 1 |

GDPR compliance page: data export, consent preferences, account deletion. Typed confirmation ("DELETE") required before deletion. Consent changes logged. One issue on error handling.

---

## Findings

### F-AD01 · Consent logging doesn't catch or validate error · 🟡 P2
**Where:** [src/pages/account/AccountDataPage.jsx:192-197](src/pages/account/AccountDataPage.jsx#L192)

**What:** `gdprRepo.logConsent({ ... })` is called but the returned promise is not awaited or caught. If the API fails, the UI doesn't know, and the checkbox state diverges from server state.

**Fix:** 
```js
onChange={async () => {
  try {
    await gdprRepo.logConsent({ ... })
    toast.success('Preference updated')
  } catch (e) {
    toast.error(friendlyError(e, 'Failed to update preference'))
  }
}}
```

**Status:** documented.

---

### F-AD02 · Export download URL could leak PII if URL is logged in external service · 🔵 P3
**Where:** [src/pages/account/AccountDataPage.jsx:139](src/pages/account/AccountDataPage.jsx#L139)

**What:** `<a href={exportRequest.download_url}>` — the download link is a signed, time-limited URL. Opening it in a browser logs the URL in the Referer header of subsequent requests and HTTP access logs. If a user clicks a link from the export page and lands on a third-party site, the Referer leaks the signed URL.

**Fix:** Use `target="_blank" rel="noopener noreferrer"` (already present ✓) and optionally remove the URL from logs with a downloader middleware.

**Status:** documented.
