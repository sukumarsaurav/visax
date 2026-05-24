# Immizy — Page-by-Page Code Audit

**Started:** 2026-05-24
**Auditor:** Senior code reviewer (Claude Opus 4.7)
**Scope:** Every page under `src/pages/**` — UI/UX, function, security, performance.
**Mode:** Cross-check existing [PRODUCTION_AUDIT.md](../PRODUCTION_AUDIT.md) + audit fresh. Apply confident fixes inline.

---

## How this audit is structured

- **[CHECKLIST.md](CHECKLIST.md)** — the master rubric applied to every page.
- **[_INDEX.md](_INDEX.md)** — per-page audit status, severity rollup, links to each report.
- **`pages/`** — one markdown file per page audit, named `<portal>__<PageName>.md`.
- **[SUMMARY.md](SUMMARY.md)** — produced last; rolls findings into a prioritized fix roadmap.

## Severity scheme

| Tag | Meaning | SLA |
|-----|---------|-----|
| 🔴 **P0** | Data loss, account takeover, privilege escalation, payment loss | Fix before next deploy |
| 🟠 **P1** | Broken core flow, performance collapse at scale, real PII leak | Fix this sprint |
| 🟡 **P2** | Degraded UX, missing pagination, recoverable error, info-leak | Plan next sprint |
| 🔵 **P3** | Code quality, micro-perf, accessibility polish | Backlog |
| ✅ **OK** | Verified working / well-implemented (noted to avoid re-audit) |

## Finding format

Each finding follows:

```
### F-<id> · <one-line title> · <severity>
**Where:** `path/to/file.jsx:L<start>-L<end>`
**What:** What's wrong, in code terms.
**Why it matters:** Impact in user / business terms.
**Fix:** Concrete code change or pattern. Code snippet if non-trivial.
**Status:** documented | fixed-in-this-audit | needs-confirmation
```

## What "fixed-in-this-audit" means

When confidence is high and blast radius is low, the fix is applied inline and the finding is marked `fixed-in-this-audit`. Examples of what gets fixed:
- XSS sinks (raw `dangerouslySetInnerHTML` on user input)
- Missing UUID validation on `:id` route params
- `eq()` filters that should be `.maybeSingle()` not `.single()`
- Missing `aria-label` on icon-only buttons
- Obvious dead code / unused imports

What does **not** get auto-fixed:
- Schema / RLS changes (need a migration + review)
- Refactors touching > 1 file
- Anything that changes user-visible copy
- Removal of features

## Cross-referencing PRODUCTION_AUDIT.md

The existing audit dates to **2026-05-14** (10 days before this one). For each issue listed there I:
1. Verify the file/line still has the issue (the fix may already have landed in migrations 005–010).
2. If still present → carry forward with a `[prior-audit]` tag.
3. If fixed → note as such in `_INDEX.md` so it doesn't get re-flagged.
