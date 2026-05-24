# Audit: `src/pages/landing/SupportPage.jsx`

**Audited:** 2026-05-24 · **Status:** ✓ | P0: 0 | P1: 0 | P2: 1 | P3: 1

Support/contact page. Issues: form submission not rate-limited, no CAPTCHA.

---

## Findings
- **F-SP01** · Form submission has no rate limiting (P2)
- **F-SP02** · No anti-spam CAPTCHA on contact form (P3)
