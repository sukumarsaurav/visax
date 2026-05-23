import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BASE_URL = 'https://immizy.in'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`
const SITE_NAME = 'Immizy'
const LOCALE = 'en-IN'   // primary target: Indian English

function setMeta(nameOrProp, content) {
    if (content === undefined || content === null || content === '') return
    const attr = nameOrProp.startsWith('og:') || nameOrProp.startsWith('twitter:') ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`)
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, nameOrProp)
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}

function setLink(rel, href, attrs = {}) {
    const selector = attrs.hreflang
        ? `link[rel="${rel}"][hreflang="${attrs.hreflang}"]`
        : `link[rel="${rel}"]`
    let el = document.querySelector(selector)
    if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
        document.head.appendChild(el)
    }
    el.setAttribute('href', href)
}

/**
 * Inject a JSON-LD <script>. Multiple schemas per page are supported via
 * the `id` parameter — pass a stable, unique id so we replace (not duplicate)
 * on re-render.
 */
function injectSchema(schema, id) {
    let el = document.getElementById(id)
    if (!el) {
        el = document.createElement('script')
        el.id = id
        el.type = 'application/ld+json'
        document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema)
    return () => { el.remove() }
}

/**
 * @param {object} opts
 * @param {string}  opts.title        - Page-specific title (appended with " | Immizy")
 * @param {string}  opts.description  - Meta description (~160 chars target)
 * @param {string}  [opts.keywords]   - Comma-separated keywords (low SEO weight, but
 *                                      crawlers like Bing still consume — and we use
 *                                      it for our own internal-search hints)
 * @param {string}  [opts.canonical]  - Override canonical URL
 * @param {string}  [opts.ogImage]    - OG image URL
 * @param {object|object[]} [opts.schema] - Single schema or array of JSON-LD schemas
 */
export function useSEO({ title, description, keywords, canonical, ogImage, schema } = {}) {
    const { pathname } = useLocation()

    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Find Verified Immigration Consultants India`
        const canonicalUrl = canonical || `${BASE_URL}${pathname}`
        const image = ogImage || DEFAULT_OG_IMAGE

        // Cap title at ~60 chars for Google's SERP truncation (60–65 chars).
        // Cap description at ~160 chars for SERP snippet (158–160).
        document.title = fullTitle.length > 70 ? `${fullTitle.slice(0, 67)}...` : fullTitle

        setMeta('description', description)
        setMeta('keywords', keywords)
        setMeta('og:site_name', SITE_NAME)
        setMeta('og:type', 'website')
        setMeta('og:title', fullTitle)
        setMeta('og:description', description)
        setMeta('og:url', canonicalUrl)
        setMeta('og:image', image)
        setMeta('og:locale', 'en_IN')
        setMeta('twitter:card', 'summary_large_image')
        setMeta('twitter:title', fullTitle)
        setMeta('twitter:description', description)
        setMeta('twitter:image', image)

        // Document language hint for crawlers that read it from <html lang>.
        document.documentElement.setAttribute('lang', LOCALE)

        setLink('canonical', canonicalUrl)

        // hreflang — tell Google this page targets Indian English. We map
        // the same URL for `en` (fallback) and `x-default` so global English
        // users still land here, but India-localised results get an explicit
        // hint that we're the canonical India variant.
        setLink('alternate', canonicalUrl, { hreflang: 'en-IN' })
        setLink('alternate', canonicalUrl, { hreflang: 'en' })
        setLink('alternate', canonicalUrl, { hreflang: 'x-default' })

        // JSON-LD — accept single schema or array. Each schema gets its own
        // <script> with a stable id derived from @type so updates replace
        // instead of duplicating.
        const cleanups = []
        if (schema) {
            const schemas = Array.isArray(schema) ? schema : [schema]
            schemas.forEach((s, i) => {
                const type = s?.['@type'] || s?.['@graph']?.[0]?.['@type'] || 'data'
                const id = `ld-json-${type}-${i}`.toLowerCase()
                cleanups.push(injectSchema(s, id))
            })
        }
        return () => cleanups.forEach(fn => fn())
    }, [title, description, keywords, pathname, canonical, ogImage, schema])
}
