# Audit: `src/pages/client/ProfileSetupPage.jsx`

**Audited:** 2026-05-24 · **LOC:** ~250 · **Status:** ✓ | P0: 0 | P1: 1 | P2: 2 | P3: 1

Client profile setup form. Good field validation. Issues: avatar upload not validated, form state not preserved on navigation away.

---

## Findings
- **F-PS01** · Avatar upload missing MIME type validation (P1)
- **F-PS02** · Form changes lost on navigation without confirmation (P2)
- **F-PS03** · Bio textarea lacks max length enforcement (P2)
- **F-PS04** · Phone number validated only as pattern, not by country (P3)
