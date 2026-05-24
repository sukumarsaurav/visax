# Audit: `src/pages/consultant/InviteClientPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 2 | P3: 1

Invite existing/new clients page. Issues: email validation incomplete, bulk invite not rate-limited.

---

## Findings
- **F-IC01** · Email validation doesn't reject common typos (P2)
- **F-IC02** · Bulk invite has no rate limiting or queue (P2)
- **F-IC03** · No success rate feedback for invites (P3)
