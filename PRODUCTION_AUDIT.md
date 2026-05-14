# VisaX — Production Readiness Audit
**Date:** 2026-05-14 | **Target:** 1000 concurrent users | **Engineer:** Senior DB Review

---

## Executive Summary

17 issues found across database layer, frontend query patterns, and infrastructure design. **4 are critical blockers** that will cause data corruption or complete failure under load. The rest are performance degradations that compound at scale.

| Severity | Count | Categories |
|----------|-------|------------|
| 🔴 P0 — Critical (Data Loss / Corruption) | 4 | Race conditions, unbounded queries |
| 🟠 P1 — High (Performance Collapse at Scale) | 6 | N+1 queries, missing indexes, RLS overhead |
| 🟡 P2 — Medium (Degraded Experience) | 5 | Missing pagination, stale real-time |
| 🔵 P3 — Low (Code Quality) | 2 | Error handling gaps, select(*) |

---

## P0 — Critical Blockers

### 1. Race Condition: Invoice & Case Number Generators

**Files:** `supabase/migrations/001_initial_schema.sql:797–838`

Both `generate_invoice_number()` and `generate_case_number()` use `SELECT MAX()` to determine the next sequence value:

```sql
-- BROKEN under concurrent load:
SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
INTO seq_num FROM invoices;
```

**What happens at 1000 concurrent users:** Two users submit at the same millisecond. Both transactions read MAX = 42. Both try to insert INV-00043. One hits the `UNIQUE` constraint and rolls back. The end user sees a 500 error; the payment is silently dropped.

**Fix (in migration 004):** Replace with PostgreSQL sequences (`nextval()`), which are atomic and lock-free:
```sql
CREATE SEQUENCE invoice_seq START 1;
NEW.invoice_number := 'INV-' || LPAD(nextval('invoice_seq')::TEXT, 5, '0');
```

---

### 2. Unbounded Queries — Full Table Scans on Every Page Load

**Files:** `src/pages/landing/HomePage.jsx:40–42`, `src/pages/landing/FindProfessionalsPage.jsx:59–64`

`HomePage.fetchHeroData()` fetches **all reviews in the database** on every page load:
```js
// Fetches every review row in the DB, no LIMIT:
const { data: reviews } = await supabase
    .from('reviews')
    .select('consultant_id, rating')
```

`FindProfessionalsPage.loadMeta()` makes 4 parallel unbounded queries on every page load:
```js
await Promise.all([
    supabase.from('reviews').select('consultant_id, rating'),     // ALL reviews
    supabase.from('services').select('provider_id, price').eq('is_active', true), // ALL services
    supabase.from('agencies').select('id, owner_id, name'),       // ALL agencies
    supabase.from('agency_members').select('...').eq('status','active'), // ALL members
])
```

**What happens at 1000 concurrent users:** 1000 simultaneous requests each loading full table dumps. At 10,000 reviews, that's 10M rows/second being serialized and sent over the wire. Database CPU pegs at 100%; Supabase connection pool exhausts; every subsequent query times out.

**Fix:** Replace with the `get_platform_stats()` RPC and `consultant_rating_summary` materialized view defined in migration 004:
```js
// HomePage — single RPC, pre-aggregated:
const { data } = await supabase.rpc('get_platform_stats')

// FindProfessionalsPage — join materialized view instead of loading all reviews:
const { data } = await supabase
    .from('profiles')
    .select('*, rating:consultant_rating_summary!inner(avg_rating, review_count)')
    .eq('application_status', 'approved')
```

---

### 3. Missing Pagination in Core Hooks

**Files:** `src/hooks/useAppointments.js:16–30`, `src/hooks/useCases.js:16–31`, `src/hooks/useInvoices.js:16–31`, `src/hooks/useMessages.js:31–64`

All four hooks fetch **all records with no LIMIT**:
```js
// useAppointments — fetches every appointment for this user, forever:
const { data, error } = await supabase
    .from('appointments')
    .select('*, client:profiles!..., consultant:profiles!...')
    .order('scheduled_at', { ascending: true })
// No .limit() or .range()
```

After 2 years of usage, a busy consultant with 500 appointments + 200 cases + 300 invoices loads **1000+ rows with 2-column joins** on every dashboard navigation.

**Fix:** Add pagination to all hooks:
```js
// Add these parameters:
const PAGE_SIZE = 50
const { data, count } = await supabase
    .from('appointments')
    .select('...', { count: 'exact' })
    .order('scheduled_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
```

---

### 4. RLS Helper Functions — Per-Row Database Query

**File:** `supabase/migrations/002_rls_policies.sql:49–74`

The `get_user_role()`, `get_user_agency_id()`, `is_admin()`, and `is_agency_admin()` functions each execute a SELECT query. RLS evaluates these **for every row returned**:

```sql
-- Called on every row of every cases query:
CREATE OR REPLACE FUNCTION get_user_role() RETURNS user_role AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
```

**What happens:** A `SELECT * FROM cases` returning 100 rows triggers 100 calls to `get_user_role()` → 100 sub-queries to `users` table. With 1000 concurrent users this is 100,000 extra queries/second on your users table alone.

**Fix (in migration 004):** Read the role from the JWT claims (zero DB hit). Set custom claims in your Supabase Auth hook:
```sql
-- Reads JWT claim first; only falls back to DB if missing:
v_role := current_setting('request.jwt.claims', true)::jsonb ->> 'user_role';
```

In your Supabase Auth Hook (Edge Function), add:
```js
// supabase/functions/auth-hook/index.ts
return {
  user_metadata: { ... },
  app_metadata: {
    user_role: user.role,          // cached from users table
    agency_id: user.agency_id      // cached from consultant_profiles
  }
}
```

---

## P1 — High Priority Performance Issues

### 5. Missing Composite Indexes

**File:** `supabase/migrations/001_initial_schema.sql:663–709`

The schema only has single-column indexes. The most frequent query patterns filter on 2–3 columns. PostgreSQL must either perform a bitmap AND between two indexes (slow) or fall back to a sequential scan.

**Most impactful missing indexes (all added in migration 004):**

| Table | Missing Index | Queries Affected |
|-------|--------------|------------------|
| `cases` | `(consultant_id, status)` | Dashboard, CasesPage |
| `cases` | `(client_id, status)` | Client dashboard |
| `appointments` | `(consultant_id, date, status)` | Calendar, AppointmentsPage |
| `invoices` | `(consultant_id, status)` | Revenue analytics |
| `messages` | `(conversation_id, created_at DESC)` | Message thread loading |
| `conversations` | `(participant_1_id, last_message_at DESC)` | Conversation list |
| `notifications` | `(user_id, is_read, created_at DESC)` | Unread badge count |
| `reviews` | `(consultant_id, rating)` | Rating aggregation |
| `team_members` | `(agency_id, status)` | Team dashboard |
| `case_activities` | `(case_id, created_at DESC)` | Activity timeline |

All indexes use `CONCURRENTLY` so they can be created on a live database without table locks.

---

### 6. In-Memory Aggregation for Analytics

**File:** `src/pages/analytics/AnalyticsPage.jsx:83–168`

`fetchAgencyStats()` loads all cases, appointments, invoices, and reviews for an entire agency into JavaScript memory, then filters per-member in a loop:

```js
// Loads everything:
const [casesRes, apptRes, invoiceRes, reviewsRes] = await Promise.all([
    supabase.from('cases').select('status, consultant_id').in('consultant_id', memberIds),
    ...
])
// Then loops through members in JS:
const perMember = allMembers.map(m => {
    const mCases = cases.filter(c => c.consultant_id === m.consultant_id)
    ...
})
```

An agency with 20 members × 200 cases each = 4,000 rows loaded into one browser tab's memory.

**Fix:** Use the `get_consultant_analytics()` RPC added in migration 004, or use `GROUP BY` in the query:
```js
// One query, database does the grouping:
const { data } = await supabase
    .from('cases')
    .select('consultant_id, status, count:id.count()')
    .in('consultant_id', memberIds)
    .group('consultant_id, status')  // when Supabase supports GROUP BY
```

---

### 7. Inefficient Rating Update Trigger

**File:** `supabase/migrations/001_initial_schema.sql:776–793`

The existing trigger recalculates rating by querying all reviews on every INSERT:
```sql
UPDATE consultant_profiles SET
    rating_overall = (SELECT AVG(rating) FROM reviews WHERE consultant_id = NEW.consultant_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE consultant_id = NEW.consultant_id)
```

At 1000 concurrent reviews (e.g., post-event spike), this creates 2000 sub-queries all hitting the same rows.

**Fix (in migration 004):** Incremental arithmetic — no sub-query needed:
```sql
UPDATE consultant_profiles SET
    rating_overall = (rating_overall * review_count + NEW.rating) / (review_count + 1),
    review_count   = review_count + 1
WHERE id = NEW.consultant_id;
```

---

### 8. Non-Specific Real-Time Channel Names

**File:** `src/hooks/useMessages.js:16`

```js
const channel = supabase.channel('messages')  // ← generic name
```

If two components (or the hook + MessagesPage) both subscribe to `'messages'`, Supabase treats them as the same channel. The second subscription overwrites the first, or both receive duplicate events. This is a **silent data bug** — missed messages, doubled notifications.

**Fix:**
```js
const channel = supabase.channel(`messages-${user.id}`)
```

Similarly in `useNotifications.js:14`: `supabase.channel('notifications')` → `supabase.channel(\`notifications-${user.id}\`)`

---

### 9. Real-Time Subscriptions Missing UPDATE Events

**Files:** `src/hooks/useMessages.js:17–26`, `src/hooks/useNotifications.js:15–24`

Both hooks only listen to `INSERT`. When a message is marked read, the `is_read` flag changes (UPDATE) but the other participant's UI never updates. Users see stale unread counts until they refresh.

```js
// Missing in useMessages:
.on('postgres_changes', { event: 'UPDATE', table: 'messages',
    filter: `recipient_id=eq.${user.id}` }, handleUpdate)

// Missing in useNotifications:
.on('postgres_changes', { event: 'UPDATE', table: 'notifications',
    filter: `user_id=eq.${user.id}` }, handleUpdate)
```

---

### 10. Duplicate Subscription in MessagesPage

**File:** `src/pages/consultant/MessagesPage.jsx`

`MessagesPage` creates its own Supabase subscription **in addition to** the one already in `useMessages`. This means:
- Two event listeners on the same table
- Double state updates on new messages
- Memory leak if the page component unmounts before cleanup

**Fix:** Remove the direct subscription in `MessagesPage` and consume state from `useMessages` hook exclusively.

---

## P2 — Medium Priority

### 11. `select('*')` in 20+ Queries

Overfetching columns wastes bandwidth and increases deserialization cost. Identified in:
- `useAppointments.js:21` — `select('*,...')` on appointments
- `useCases.js:20` — `select('*,...')` on cases  
- `useInvoices.js:20` — `select('*,...')` on invoices
- `src/pages/consultant/SettingsPage.jsx:87`
- `src/pages/landing/ConsultantProfilePage.jsx:72–73`
- Plus 15 more admin pages

Replace `*` with explicit column lists in all selects.

---

### 12. Missing Error Handling on Storage Operations

**File:** `src/pages/client/DocumentsPage.jsx:58–78`

```js
await supabase.storage.from('documents').upload(path, file)
await supabase.from('documents').insert({...})
```

If the storage upload succeeds but the database insert fails (or vice versa), you get an orphaned file in storage (wasting quota) or a DB record pointing to a nonexistent file.

**Fix:** Wrap in a try/catch and roll back the storage upload if the DB insert fails:
```js
const { error: uploadError } = await supabase.storage.from('documents').upload(path, file)
if (uploadError) throw uploadError
const { error: dbError } = await supabase.from('documents').insert({...})
if (dbError) {
    await supabase.storage.from('documents').remove([path])  // rollback
    throw dbError
}
```

---

### 13. `update_updated_at()` Trigger Never Attached

**File:** `supabase/migrations/001_initial_schema.sql:716–722`

The function is defined but no trigger uses it. The `cases`, `appointments`, `invoices` tables have no `updated_at` tracking. Without this, you cannot efficiently query "what changed in the last hour" for sync, auditing, or cache invalidation.

**Fix (in migration 004):** Add `updated_at` columns and attach triggers to all mutable tables.

---

### 14. `platform_settings` and `audit_logs` Tables Have No RLS

**File:** `supabase/migrations/002_rls_policies.sql`

Both tables are absent from the RLS enable list. This means any authenticated user can read all platform settings (including potentially sensitive configuration) and insert/modify audit logs (defeating their audit purpose entirely).

**Fix (in migration 004):** Enable RLS and add appropriate policies.

---

### 15. `useMessages` — All Messages Loaded, Grouped in JS

**File:** `src/hooks/useMessages.js:31–64`

`fetchConversations()` loads every message the user has ever sent or received, then groups them into conversations in JavaScript. The actual conversation list only needs the **most recent message per partner**.

After 1 year of active use, a consultant with 50 clients × 100 messages/client = 5,000 rows loaded to display a 50-item conversation list.

**Fix:** Use the `get_conversations()` RPC added in migration 004 which uses a window function to return one row per conversation at the database level.

---

## P3 — Low Priority

### 16. `ilike` Search Without Trigram Index

**File:** `src/pages/admin/UserManagementPage.jsx:40–47`, `src/pages/landing/FindProfessionalsPage.jsx:115–119`

```js
query = query.or(`full_name.ilike.%${appliedSearch}%,bio.ilike.%${appliedSearch}%`)
```

Leading wildcard `ilike('%term%')` cannot use a btree index. The `pg_trgm` extension is enabled but trigram indexes on `full_name` and `bio` are missing.

**Fix (in migration 004):** GIN trigram indexes added:
```sql
CREATE INDEX idx_users_full_name_trgm ON users USING gin((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_consultant_profiles_bio_trgm ON consultant_profiles USING gin(bio gin_trgm_ops);
```

---

### 17. No Auth Hook for JWT Custom Claims

The RLS optimization in item #4 requires a Supabase Auth Hook to embed `user_role` and `agency_id` in the JWT. Without this, the fallback DB query runs on every request (just slower, not broken).

**Create:** `supabase/functions/custom-claims/index.ts` that reads the user's role from `users` table at sign-in time and embeds it in `app_metadata`. This is a one-time cost at login vs. a per-row cost on every query.

---

## What's Already Done Well

- ✅ RLS is enabled and comprehensive across all tables
- ✅ Foreign key constraints with proper CASCADE rules
- ✅ Enum types for all status fields (no magic strings)
- ✅ `pg_trgm` extension enabled for text search
- ✅ Conversations table properly separates metadata from message content
- ✅ `Promise.all()` used for parallel fetches where appropriate
- ✅ Real-time subscriptions include user-scoped filters
- ✅ Proper cleanup (`supabase.removeChannel`) in useEffect returns
- ✅ Pagination implemented in FindProfessionalsPage (PAGE_SIZE = 9)
- ✅ Incremental local state updates after mutations (avoids re-fetch)
- ✅ `UNIQUE` constraints on junction tables (`wishlists`, `agency_members`)

---

## Migration & Deployment Order

Apply in this order — each step is safe to run on a live database:

```
1. supabase/migrations/004_production_optimizations.sql
   - All CONCURRENTLY indexes: no table locks, runs in background
   - Sequence creation: instant
   - Trigger replacements: brief row lock per table

2. Supabase Dashboard → Auth → Hooks
   - Create custom-claims Edge Function
   - Set user_role + agency_id in app_metadata at login

3. Frontend changes (from this audit):
   - Add .limit() to all hooks
   - Replace HomePage reviews fetch with get_platform_stats() RPC
   - Replace useMessages fetchConversations() with get_conversations() RPC
   - Fix channel names to include user.id
   - Add UPDATE listeners to real-time subscriptions
```

---

## Estimated Impact at 1000 Concurrent Users

| Change | Current | After Fix | Improvement |
|--------|---------|-----------|-------------|
| RLS helper functions | ~100 queries/result set | 0–1 queries (JWT cache) | **99% reduction** |
| Platform stats (HomePage) | Full reviews table scan | Single pre-aggregated row | **~10,000x faster** |
| Conversation list load | All messages ever | 1 row per conversation | **~100x faster** |
| Appointment list | Unbounded | 50 rows paginated | **~10x less data** |
| Rating aggregation trigger | 2 sub-queries per review | 0 sub-queries (arithmetic) | **Eliminates contention** |
| Invoice/Case generation | Race condition risk | Sequence (atomic) | **0 duplicate key errors** |
