import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const BASE_URL = 'https://immizy.in'
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`
const SITE_NAME = 'Immizy'

function setMeta(nameOrProp, content) {
    const attr = nameOrProp.startsWith('og:') || nameOrProp.startsWith('twitter:') ? 'property' : 'name'
    let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`)
    if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, nameOrProp)
        document.head.appendChild(el)
    }
    el.setAttribute('content', content)
}

function setLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`)
    if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
    }
    el.setAttribute('href', href)
}

function injectSchema(schema, id = 'ld-json') {
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
 * @param {string}  opts.description  - Meta description (max ~160 chars)
 * @param {string}  [opts.canonical]  - Override canonical URL
 * @param {string}  [opts.ogImage]    - OG image URL
 * @param {object}  [opts.schema]     - JSON-LD schema object
 */
export function useSEO({ title, description, canonical, ogImage, schema } = {}) {
    const { pathname } = useLocation()

    useEffect(() => {
        const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Find Verified Immigration Consultants India`
        const canonicalUrl = canonical || `${BASE_URL}${pathname}`
        const image = ogImage || DEFAULT_OG_IMAGE

        document.title = fullTitle

        setMeta('description', description || '')
        setMeta('og:site_name', SITE_NAME)
        setMeta('og:type', 'website')
        setMeta('og:title', fullTitle)
        setMeta('og:description', description || '')
        setMeta('og:url', canonicalUrl)
        setMeta('og:image', image)
        setMeta('twitter:card', 'summary_large_image')
        setMeta('twitter:title', fullTitle)
        setMeta('twitter:description', description || '')
        setMeta('twitter:image', image)

        setLink('canonical', canonicalUrl)

        let cleanup = () => {}
        if (schema) {
            cleanup = injectSchema(schema)
        }
        return cleanup
    }, [title, description, pathname, canonical, ogImage, schema])
}
