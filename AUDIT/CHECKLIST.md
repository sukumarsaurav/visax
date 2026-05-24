# Master Audit Checklist

Applied to every page. Skip items that don't apply (e.g. a static legal page has no data-fetch checklist).

---

## 1. UI / UX

### 1.1 Loading states
- [ ] Skeleton or spinner shown while data loads — not a blank screen.
- [ ] Loading state cannot get "stuck" (every async path settles `setLoading(false)`, even on error).
- [ ] No layout shift between loading and loaded states.

### 1.2 Empty states
- [ ] Distinct UI when query succeeds with zero rows (vs. error vs. loading).
- [ ] Empty state has a clear next action (CTA) or explanation.

### 1.3 Error states
- [ ] User-facing error visible when fetch fails (toast or inline).
- [ ] Error message is actionable — not "Error: undefined" or raw stack traces.
- [ ] Retry affordance available, or explicit "Refresh the page" guidance.

### 1.4 Forms
- [ ] Submit button disabled / shows spinner while in-flight (prevents double-submit).
- [ ] Required fields marked (aria-required + visual asterisk).
- [ ] Inline validation for format errors (email, phone, password strength) before submit.
- [ ] Server errors mapped to a sensible inline message (not just a toast).
- [ ] Unsaved-changes guard on navigation if form is dirty (via `useUnsavedChangesGuard`).

### 1.5 Accessibility
- [ ] Every icon-only button has `aria-label`.
- [ ] All form inputs paired with `<label>` (or `aria-labelledby`).
- [ ] Focusable order is logical; modals trap focus and restore on close (via `useFocusTrap`).
- [ ] Color contrast ≥ WCAG AA on text and interactive elements.
- [ ] No `<div onClick>` substitutes for buttons (no keyboard support).
- [ ] Decorative `material-symbols-outlined` icons have `aria-hidden="true"`.

### 1.6 Responsive design
- [ ] No fixed widths that overflow on mobile (< 360px).
- [ ] Tables have horizontal scroll or stack on small screens.
- [ ] Touch targets ≥ 44×44 px.

### 1.7 Dark mode
- [ ] Every color token has a `dark:` variant.
- [ ] No hardcoded `#fff` / `#000`.

### 1.8 Copy
- [ ] No placeholder Lorem ipsum.
- [ ] No untranslated strings (page should run through `useDocumentLang` consistent locale).
- [ ] Buttons use verb-first imperative ("Save changes", not "Changes saved").

---

## 2. Function

### 2.1 Route params
- [ ] Every `useParams().id` validated with `requireUuid()` before any query.
- [ ] Invalid id → redirect to `<NotFound />`, not a silent failure.

### 2.2 Data fetching
- [ ] Aborts in-flight requests on unmount (via `useAbortable` or AbortController).
- [ ] No race conditions: latest filter/search overrides stale results.
- [ ] Pagination, sort, filter state preserved across navigation when expected.

### 2.3 Mutations
- [ ] Optimistic update reverted on error.
- [ ] Confirmation dialog for destructive actions (delete, cancel, reject).
- [ ] After mutation, server is source of truth (re-fetch or use returned row).
- [ ] Idempotency: clicking Save twice doesn't create two records.

### 2.4 Real-time
- [ ] Subscription channel name is user-scoped (`channel(\`x-${user.id}\`)`).
- [ ] Subscription cleaned up in useEffect return.
- [ ] Listens to INSERT, UPDATE, and DELETE as appropriate (not only INSERT).
- [ ] Reconnects after network drop / tab resume.

### 2.5 Navigation
- [ ] Back button works as user expects (no broken history).
- [ ] Refresh preserves view state where reasonable (filters in URL).
- [ ] Protected route correctly redirects to /login with `from` state.

---

## 3. Security

### 3.1 Authorization
- [ ] Page wrapped in `<ProtectedRoute allowedRoles>` if role-gated.
- [ ] No client-side-only role check that the server isn't also enforcing (RLS).
- [ ] No "hidden" admin features that show on URL guess.

### 3.2 Input validation
- [ ] All user input passed to DB goes through validator or RLS column check.
- [ ] File uploads validated for MIME type AND extension AND size (via `fileValidation`).
- [ ] No SQL-like input built via string concat (Supabase client handles this — flag if raw RPC text is constructed).
- [ ] Search input passed through `searchEscape` before `.ilike()` / `.or()` to prevent PostgREST filter injection.

### 3.3 Output / rendering
- [ ] No `dangerouslySetInnerHTML` on user-controlled content.
- [ ] All `<a href={url}>` from user data routed through `safeHref()`.
- [ ] User-supplied URLs in `<img>` not used for credential leakage (referrer policy set).
- [ ] No reflection of URL query params into innerHTML.

### 3.4 Secrets / credentials
- [ ] No API keys, Supabase service role keys, or third-party tokens in client code.
- [ ] No PII (full email/phone of another user) shown to roles that shouldn't see it.

### 3.5 Open redirect
- [ ] `?redirect=`, `?next=`, `from` location state checked against an allow-list of in-app paths before `navigate()`.

### 3.6 CSRF / state-changing GET
- [ ] No GET request that mutates state (Supabase REST uses POST/PATCH/DELETE — flag if a fetch URL contains the token).
- [ ] Invite / accept-invite flows use a single-use token validated server-side.

### 3.7 Rate limiting
- [ ] Sensitive actions (login, password reset, invite-claim, signup) use `useRateLimit` or backed by RPC with throttle.

### 3.8 Logging
- [ ] No `console.log` of tokens, full request/response bodies, or PII in production builds.
- [ ] Errors reported via `errorReporter` (not raw `console.error` only).

---

## 4. Performance

### 4.1 Query shape
- [ ] No `select('*')` — explicit columns (per prior audit).
- [ ] `.limit()` / `.range()` on lists (no unbounded fetch).
- [ ] Filters use indexed columns (cross-ref migration 004 + 007 indexes).
- [ ] Joins are necessary — don't pull `consultant:profiles(...)` if you never render it.

### 4.2 Re-renders
- [ ] Expensive computations wrapped in `useMemo`.
- [ ] Callbacks passed to child components wrapped in `useCallback` only when child is memoized.
- [ ] `useEffect` deps array is correct (no missing dep, no over-firing).
- [ ] Lists keyed by stable id, not array index.

### 4.3 Bundle weight
- [ ] No barrel imports of huge libraries (e.g. `import * as X from 'lodash'`).
- [ ] Heavy components (chart libs, image croppers) lazy-loaded only on the page that uses them.
- [ ] No duplicate dependencies vs. the main vendor bundle.

### 4.4 Network
- [ ] No N+1 queries inside `.map()` (use a single batch query with `.in()`).
- [ ] `Promise.all()` for independent parallel fetches.
- [ ] Debounce on search inputs (via `useDebounce`).
- [ ] Cache-friendly URLs for static assets (hashed filenames — handled by Vite, but flag any direct image src that won't cache).

### 4.5 Real-time cost
- [ ] Channels filtered server-side (`filter: 'user_id=eq.X'`) — not "subscribe to all rows, filter in client".
- [ ] No subscription created in a frequently-mounting component without dedupe.

---

## 5. Cross-cutting code smells to flag

- TODO / FIXME / XXX comments
- Commented-out code blocks
- Magic numbers without named constant
- Functions > 100 lines
- Files > 500 lines (split candidate)
- Duplicated logic across pages that should be a hook / util
- Inconsistent error handling (some calls throw, some swallow, some toast)
- Inconsistent navigation pattern (mixing `navigate()` with `<Link>` for the same destination)
