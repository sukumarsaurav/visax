# Audit: `src/pages/admin/PaymentGatewaySettingsPage.jsx`

**Audited:** 2026-05-24 · **LOC:** 284 · **Role gate:** `<ProtectedRoute allowedRoles={ADMIN}>`

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Open | 2 | 2 | 3 | 1 |
| Fixed | 0 | 0 | 0 | 0 |

Two critical issues: (1) Stripe / PayPal **secret keys** are stored in `platform_settings` (a JSON column readable by anyone the RLS lets read) — secrets do not belong here; (2) the "Test Connection" button is a 1.2-second sleep and always reports success, lying about gateway health.

The platform also already has a working **Razorpay** integration ([ProfessionalRegisterPage:388-505](src/pages/auth/ProfessionalRegisterPage.jsx#L388)) — Razorpay isn't even listed on this page.

---

## Findings

### F-PG01 · Storing payment provider **secret keys** in `platform_settings` (a JSON DB column) · 🔴 P0
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:13, 42-43, 184-188](src/pages/admin/PaymentGatewaySettingsPage.jsx#L13)

**What:** The Stripe/PayPal/Square `api_key` is `setValue('payment', { gateways: { stripe: { api_key: '...' } } })`. That stores the live secret as JSON in the `platform_settings` table. Read access is granted to any authenticated user able to query the row (depends on the table's RLS — see PRODUCTION_AUDIT.md #14 which flagged that `platform_settings` had no RLS at all in the initial schema).

**Why it matters:** A leaked secret means an attacker can charge or refund through the gateway in the platform's name. Live keys must live in **Supabase Vault** or in Edge Function environment variables — never in a public table.

**Fix:**
1. Move secrets to Supabase Vault. The Edge Functions (`create-razorpay-order`, etc.) read them at invocation time.
2. The UI stores only `enabled` + masked publishable keys; secret-key editing is a write-only flow that POSTs to an admin Edge Function which forwards to Vault.
3. Audit + rotate any keys that have ever been entered through this UI.

**Status:** documented — architectural change.

---

### F-PG02 · "Test Connection" is a `setTimeout(1200)` that always toasts success · 🔴 P0
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:78-83](src/pages/admin/PaymentGatewaySettingsPage.jsx#L78)

**What:**
```js
const handleTestConnection = async (id) => {
    setTesting(id)
    await new Promise(r => setTimeout(r, 1200))
    setTesting(null)
    showToast(`${name} connection test successful`)
}
```

There is no actual test. The admin clicks, sees "successful", and ships broken credentials to production.

**Why it matters:** Operational fraud against the admin — they trust the test, deploy, payments fail, support tickets pour in.

**Fix:** Call an admin Edge Function `test-gateway-connection` that does a `GET /v1/charges?limit=1` against Stripe (or equivalent) with the configured key and reports success/failure honestly.

**Status:** documented.

---

### F-PG03 · Razorpay integration exists in code but isn't listed in `GATEWAY_META` · 🟠 P1
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:6-10](src/pages/admin/PaymentGatewaySettingsPage.jsx#L6) vs [src/pages/auth/ProfessionalRegisterPage.jsx:388](src/pages/auth/ProfessionalRegisterPage.jsx#L388)

**What:** The real-money flow uses Razorpay (paid agency signup). This admin page only lets you configure Stripe/PayPal/Square — meaning admins can't disable Razorpay or rotate its key from the UI.

**Fix:** Replace placeholder gateways with the actual integrations the platform uses. Razorpay first, since it's live.

**Status:** documented.

---

### F-PG04 · `handleToggle` writes immediately to DB without saving the secrets — toggling **off** then **on** silently clears credentials · 🟠 P1
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:46-52](src/pages/admin/PaymentGatewaySettingsPage.jsx#L46)

**What:** Toggling a gateway off then on preserves the old secrets only because `{ ...cur, enabled: ... }` spreads. OK on first read. But if the admin loads the page, secrets aren't fetched into a separate state — the toggle does the right thing. Flagging because the data flow is fragile.

**Status:** documented.

---

### F-PG05 · `transaction_fee` accepts arbitrary string ("abc", "-5", "9999") · 🟡 P2
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:120-123](src/pages/admin/PaymentGatewaySettingsPage.jsx#L120)

**Fix:** `type="number"`, `min="0"`, `max="100"`, validate on save.

**Status:** documented.

---

### F-PG06 · "PCI DSS Compliant" / "3D Secure 2.0" labels are **static text** with no verification · 🟡 P2
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:256-281](src/pages/admin/PaymentGatewaySettingsPage.jsx#L256)

**What:** The card visually claims compliance and 3DS support. Nothing checks either. An auditor screenshots this page and the platform is on the hook.

**Fix:** Either drive the badges from real checks (e.g. fetch from the gateway), or remove the panel.

**Status:** documented.

---

### F-PG07 · Gateway icon from third-party CDN (`cdn.jsdelivr.net`) · 🟡 P2
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:7-9](src/pages/admin/PaymentGatewaySettingsPage.jsx#L7)

**What:** External SVG load on the admin page that lists payment settings — adds a 3rd-party fingerprint to a sensitive page.

**Fix:** Bundle the SVGs locally.

**Status:** documented.

---

### F-PG08 · `copyToClipboard` doesn't await `navigator.clipboard.writeText` or handle the rejection · 🔵 P3
**Where:** [src/pages/admin/PaymentGatewaySettingsPage.jsx:85-88](src/pages/admin/PaymentGatewaySettingsPage.jsx#L85)

**Fix:** `await` and catch.

**Status:** documented.
