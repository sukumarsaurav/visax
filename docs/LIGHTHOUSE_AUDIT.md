# Lighthouse + Search Console Audit Workflow

Two complementary audits — one local/automatable, one waiting on crawl data.

---

## 1. Local Lighthouse (run any time)

Lighthouse scores pages on Performance, Accessibility, Best Practices, SEO,
and PWA — without needing any crawl data. Run on every meaningful change.

### Quick run (Chrome DevTools)

1. Open Chrome → DevTools (`Cmd+Opt+I` / `F12`)
2. **Lighthouse** tab → check all 5 categories → **Analyze page load**
3. Repeat for each page-type:
   - `/` (home)
   - `/find-professionals`
   - `/consultant/{any-id}` (a real consultant)
   - `/immigration/canada-pr` (destination)
   - `/immigration/canada-pr-for-software-engineer` (occupation)
   - `/compare/canada-vs-australia` (comparison)
   - `/blog` + `/blog/{any-post}` (blog)
   - `/pricing`

### Automated via lighthouse-ci (one-shot)

Install once:
```bash
npm install -g @lhci/cli
```

Then from the project root:
```bash
npm run build
npm run preview &           # serves /dist on http://localhost:4173
sleep 2
lhci autorun \
  --collect.url=http://localhost:4173/ \
  --collect.url=http://localhost:4173/find-professionals \
  --collect.url=http://localhost:4173/immigration/canada-pr \
  --collect.url=http://localhost:4173/immigration/canada-pr-for-software-engineer \
  --collect.url=http://localhost:4173/compare/canada-vs-australia \
  --collect.url=http://localhost:4173/blog \
  --collect.url=http://localhost:4173/pricing \
  --upload.target=temporary-public-storage
kill %1
```

The output prints a public URL with full reports.

### Score targets (SEO category specifically)

| Score | Meaning |
|---|---|
| 100 | All Lighthouse SEO audits pass |
| 90–99 | One or two minor items (alt text, anchor link text) |
| <90 | Investigate — usually missing meta description, broken canonical, or render-blocking issues |

**Immizy target: 95+ on SEO for every page type after this PR.**

### Common Lighthouse SEO fails + fixes

| Audit fail | Fix |
|---|---|
| "Document does not have a meta description" | Page is missing `useSEO({description:...})` |
| "Links do not have descriptive text" | Replace generic "click here" with descriptive anchor text |
| "Image elements do not have `[alt]` attributes" | Add `alt={...}` to every `<img>` |
| "Tap targets are not sized appropriately" | Min 48×48 px touch targets — we use Tailwind size-12 buttons everywhere |
| "Document does not have a valid `hreflang`" | Should not happen — `useSEO` emits 3 hreflang variants automatically |
| "Page has unsuccessful HTTP status code" | Check for 500/404 — most likely SPA fallback isn\\'t configured |

---

## 2. Real-world audit (waits on 30+ days of crawl data)

Lighthouse measures a page; **Search Console** measures how Google sees the
*site* over time. The audit becomes meaningful after Googlebot has crawled
enough URLs to build a coverage picture — typically 30 days post-submission.

### After 30 days, run this audit checklist:

#### 2a. Coverage report
- GSC → **Indexing** → **Pages**
- Expected: ~80% of submitted URLs indexed
- **Investigate**: URLs marked "Crawled — currently not indexed" (usually thin content)
- **Investigate**: URLs marked "Duplicate without user-selected canonical" (canonical conflict)

#### 2b. Performance report
- GSC → **Performance**
- Filter by Country = **India**
- Sort by **Clicks** desc — top queries tell you what's actually working
- Sort by **Impressions** desc with **0 clicks** — high impression / low CTR pages need better titles/descriptions

#### 2c. Core Web Vitals
- GSC → **Experience** → **Core Web Vitals**
- Target: 80%+ URLs in "Good" bucket for mobile
- Issues commonly bubble up here that Lighthouse missed on a single page run

#### 2d. Mobile Usability
- GSC → **Experience** → **Mobile Usability**
- Target: 0 errors. We're already mobile-first via Tailwind.

#### 2e. Manual actions / Security
- GSC → **Security & Manual actions**
- Should be empty. Any entry is urgent.

---

## 3. Monthly cadence (post-launch)

| When | What | Goal |
|---|---|---|
| **Day 1** (deploy) | Submit sitemap-index, request indexing for 20 top pages | Crawl initiated |
| **Day 7** | First Lighthouse SEO run on home + top 5 SEO pages | Score 95+ |
| **Day 30** | Full GSC coverage + performance audit | 80%+ indexed |
| **Day 60** | Identify top-converting queries, double down on those page types | 5+ keywords on page 1 |
| **Day 90** | Strategic review — which destinations / cities / occupations are pulling weight? | Reallocate effort |
| **Monthly** | Re-run lighthouse-ci, check for regressions | No 95→<90 drops |

---

## 4. Tools shopping list

| Tool | Free tier | Paid worth-it? |
|---|---|---|
| Google Search Console | Yes (unlimited) | N/A |
| Bing Webmaster | Yes | N/A |
| Lighthouse / lighthouse-ci | Yes | N/A |
| **Ahrefs Webmaster Tools** | Yes (1 site) | $$$ only when serious about backlinks |
| **Ubersuggest** | Limited | $ for cheap competitor research |
| **Screaming Frog SEO Spider** | 500 URLs free | $ if site grows beyond 500 URLs |

---

## 5. What we can\\'t do from here (and shouldn't try)

- **Lighthouse SEO score doesn't include indexing health** — that's GSC's job
- **No way to "submit URLs faster"** beyond URL Inspection's request indexing (10/day cap)
- **Backlink building** is a separate workstream — outreach, guest posts, directory listings
- **Local pack ranking** requires Google Business Profile, not SEO meta — see SEO_SUBMISSION.md §7
