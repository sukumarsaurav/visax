// ============================================================
// Minimal HTML / text sanitisation helpers.
//
// React escapes children by default, so plain `{message}` is safe.
// These helpers exist for the two cases where escaping isn't enough:
//
//   1. `dangerouslySetInnerHTML` — anything that takes a raw HTML string.
//      You should avoid this entirely; if you can't (e.g. rendering
//      markdown the server hasn't sanitised), pipe the string through
//      `sanitizeHtml`. NOTE: this is intentionally conservative — it
//      strips ALL HTML and returns plain text. If you need real rich
//      text, add DOMPurify and use that instead.
//
//   2. URLs from user content — `linkifyUrl` strips dangerous schemes
//      so a stored bio "javascript:alert(1)" cannot be clicked.
// ============================================================

/**
 * Strip all HTML tags + decode entities. Returns plain text safe to
 * render with React's default escaping.
 */
export function sanitizeHtml(input) {
    if (typeof input !== 'string') return ''
    // Browser parser handles malformed-tag edge cases. But textContent
    // includes the *content* of <script> / <style> tags, which would leak
    // raw JS into the output. Strip those tag bodies first.
    const stripped = input
        .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    const el = document.createElement('div')
    el.innerHTML = stripped
    return el.textContent || ''
}

/**
 * Returns the URL if it's safe to use as an href, else null.
 * Allowed schemes: http, https, mailto, tel.
 */
export function safeHref(url) {
    if (typeof url !== 'string') return null
    const trimmed = url.trim()
    if (!trimmed) return null

    // Block obvious dangerous schemes (case-insensitive, ignore whitespace
    // in between characters that some browsers tolerate).
    const lowered = trimmed.toLowerCase().replace(/\s/g, '')
    if (lowered.startsWith('javascript:') ||
        lowered.startsWith('data:') ||
        lowered.startsWith('vbscript:') ||
        lowered.startsWith('file:')) {
        return null
    }

    try {
        // Absolute URL — accept http(s)/mailto/tel only.
        const u = new URL(trimmed)
        if (!['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol)) return null
        return u.toString()
    } catch {
        // Relative URL — accept if it doesn't start with a scheme.
        if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null
        return trimmed
    }
}
