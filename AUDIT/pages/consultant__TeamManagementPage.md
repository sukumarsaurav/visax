# Audit: `src/pages/consultant/TeamManagementPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 1 | P1: 1 | P2: 1 | P3: 0

Team member management for agencies. **CRITICAL:** Role escalation not validated.

---

## Findings
- **F-TM01** · Admin role assignment not verified - owner can demote self (P0)
- **F-TM02** · Team member deletion has no confirmation (P1)
- **F-TM03** · Invite expiration not enforced (P2)
