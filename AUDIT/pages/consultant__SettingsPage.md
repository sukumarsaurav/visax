# Audit: `src/pages/consultant/SettingsPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 1 | P2: 2 | P3: 0

Consultant settings (rate, bio, services, notifications). Issues: rate change not confirmed, no validation on service hours.

---

## Findings
- **F-SE01** · Hourly rate change has no confirmation (P1)
- **F-SE02** · Service specializations lack validation (P2)
- **F-SE03** · Notification preferences not persisted correctly (P2)
