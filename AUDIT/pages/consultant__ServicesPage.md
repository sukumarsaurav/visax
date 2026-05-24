# Audit: `src/pages/consultant/ServicesPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Service offerings management. Issues: pricing changes take effect immediately, no version history.

---

## Findings
- **F-SV01** · Service price change with no confirmation (P2)
- **F-SV02** · No audit log on service changes (P2)
- **F-SV03** · Service description doesn't support markdown (P3)
