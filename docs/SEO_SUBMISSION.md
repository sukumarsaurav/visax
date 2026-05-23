# SEO Submission Runbook

Step-by-step for getting Immizy listed in Google, Bing, and Yandex.

---

## 1. Google Search Console (highest priority)

### 1a. Verify domain ownership

1. Go to <https://search.google.com/search-console>
2. Click **Add property** → choose **URL prefix** → enter `https://immizy.in/`
3. Choose **HTML tag** verification method
4. Google will give you a meta tag like:
   ```html
   <meta name="google-site-verification" content="abc123XYZ..." />
   ```
5. Open `index.html` in this repo
6. Find the line:
   ```html
   <meta name="google-site-verification" content="" />
   ```
   and paste the token between the quotes.
7. Commit + deploy (Vercel auto-deploys on push to main)
8. Back in GSC, click **Verify**

> **Alternative**: Domain property (verifies via DNS TXT record). Use this only if you want GSC to cover **all subdomains + protocols** (recommended for production).

### 1b. Submit sitemaps

Once verified:

1. In GSC → **Sitemaps** (left nav)
2. Submit these three URLs one at a time:
   - `https://immizy.in/sitemap-index.xml` ← **submit this first** (the index)
   - `https://immizy.in/sitemap.xml`
   - `https://ylraewihqxurhwexnanr.supabase.co/functions/v1/sitemap-consultants`
3. Google may show "Couldn't fetch" for ~24 h before successful crawl — this is normal.

### 1c. Request indexing for key pages

For the highest-value pages, force a one-time crawl:

1. GSC → **URL Inspection** (top search bar)
2. Paste a URL like `https://immizy.in/immigration/canada-pr`
3. Click **Request Indexing**
4. Repeat for ~20 top pages (home, find-professionals, top destinations, top cities)

---

## 2. Bing Webmaster Tools

1. Go to <https://www.bing.com/webmasters>
2. Sign in with a Microsoft account
3. Click **Add a site** → enter `https://immizy.in/`
4. Choose **HTML meta tag** verification:
   ```html
   <meta name="msvalidate.01" content="abc123XYZ..." />
   ```
5. Paste the token into `index.html`'s `<meta name="msvalidate.01" content="" />`
6. Deploy → click **Verify** in Bing Webmaster
7. **Sitemaps** → submit the same three URLs as Google
8. Bing also indexes for DuckDuckGo + Yahoo — submitting here covers all three at once.

> **Bonus**: Bing has an **Import from GSC** option. Once GSC is set up, you can one-click import the site into Bing.

---

## 3. Yandex Webmaster (optional — useful for Russian-speaking Indian diaspora and Central Asia)

1. <https://webmaster.yandex.com>
2. Add `https://immizy.in/`, copy the verification token
3. Paste into `<meta name="yandex-verification" content="" />`
4. Deploy → verify → submit sitemap-index.xml

---

## 4. IndexNow protocol (faster crawling on Bing / Yandex / Seznam)

IndexNow lets you push URL changes immediately instead of waiting for crawl. Not yet implemented — would require an edge function that POSTs new consultant signups + blog posts to `https://api.indexnow.org/indexnow`. Backlog item.

---

## 5. Health checks after submission

Run these in **GSC → Coverage** report monthly:

| Metric | Target |
|---|---|
| Indexed pages | 80%+ of submitted URLs |
| Mobile usability errors | 0 |
| Core Web Vitals — Good URLs | 80%+ |
| Crawl errors | <1% |

If indexed pages < 50% of submitted, common causes:
- **`noindex` meta tag** on a page (none in our codebase, but worth checking)
- **Canonical pointing to a different URL** (we set canonical to current pathname, should be fine)
- **Duplicate content** (city pages with similar copy → ensure intro text differs meaningfully)
- **Thin content** (occupation pages with <300 words → expand the intro/FAQs)

---

## 6. Bonus — Schema.org validators

After deploy, run these once-per-key-page-type to confirm structured data is parsed:

- Rich Results Test (Google): <https://search.google.com/test/rich-results>
  - `https://immizy.in/immigration/canada-pr` → should show **FAQPage**
  - `https://immizy.in/consultant/{any-id}` → should show **ProfessionalService + AggregateRating**
  - `https://immizy.in/pricing` → should show **Product + Offer**
  - `https://immizy.in/blog/canada-pr-from-india-complete-guide-2026` → should show **Article + BreadcrumbList**

- Schema.org validator: <https://validator.schema.org/>

---

## 7. Local pack (Google Maps) — separate workflow

Most "immigration consultant near me" queries trigger Google's local pack (map + 3 listings). To rank there you also need:

1. **Google Business Profile** for Immizy (not the same as Search Console)
2. Encourage consultants to claim **their own GBP listings** (we can\\'t do this for them; provide a self-service guide in the dashboard)
3. Build NAP (Name + Address + Phone) consistency across:
   - Justdial, Sulekha, IndiaMART
   - Local business directories per Indian city

Out of scope for v1 — flag for v2 once organic SEO is producing leads.
