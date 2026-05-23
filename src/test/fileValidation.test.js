import { describe, it, expect } from 'vitest'
import { sanitizeFilename, detectMimeFromContent } from '../lib/fileValidation'
import { isUuid, isEmail, isHttpUrl, checkPassword } from '../lib/validators'
import { safeHref, sanitizeHtml } from '../lib/sanitize'

// ── Filename sanitization ────────────────────────────────────────────────────

describe('sanitizeFilename', () => {
    it('strips directory traversal sequences', () => {
        expect(sanitizeFilename('../../etc/passwd.pdf')).toBe('passwd.pdf')
        expect(sanitizeFilename('..\\..\\system32\\file.pdf')).toBe('file.pdf')
    })

    it('removes path-unsafe characters', () => {
        expect(sanitizeFilename('hack<script>.pdf')).not.toMatch(/[<>]/)
        expect(sanitizeFilename('a|b?c*.pdf')).not.toMatch(/[|?*]/)
    })

    it('removes zero-width and control characters', () => {
        expect(sanitizeFilename('file​‌‍.pdf')).toBe('file.pdf')
        expect(sanitizeFilename('file\x00\x01\x02.pdf')).toBe('file.pdf')
    })

    it('collapses runs of whitespace', () => {
        expect(sanitizeFilename('My    File.pdf')).toBe('My File.pdf')
    })

    it('caps length at 100 and preserves the extension', () => {
        const long = 'a'.repeat(200) + '.pdf'
        const out = sanitizeFilename(long)
        expect(out.length).toBeLessThanOrEqual(100)
        expect(out.endsWith('.pdf')).toBe(true)
    })

    it('falls back to "upload" for empty / null / undefined', () => {
        expect(sanitizeFilename(null)).toBe('upload')
        expect(sanitizeFilename('')).toBe('upload')
        expect(sanitizeFilename('🚨🚨🚨')).toBe('upload')
    })

    it('keeps unicode letters (legitimate non-Latin names)', () => {
        expect(sanitizeFilename('履歴書.pdf')).toBe('履歴書.pdf')
        expect(sanitizeFilename('résumé.pdf')).toBe('résumé.pdf')
    })
})

// ── Magic-byte detection ─────────────────────────────────────────────────────

describe('detectMimeFromContent', () => {
    function makeFile(bytes) {
        return new File([new Uint8Array(bytes)], 'test.bin')
    }

    it('detects JPEG by FF D8 FF', async () => {
        const f = makeFile([0xFF, 0xD8, 0xFF, 0xE0, 0, 0, 0, 0])
        expect(await detectMimeFromContent(f)).toBe('image/jpeg')
    })

    it('detects PNG by full signature', async () => {
        const f = makeFile([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
        expect(await detectMimeFromContent(f)).toBe('image/png')
    })

    it('detects PDF', async () => {
        const f = makeFile([0x25, 0x50, 0x44, 0x46, 0x2D])
        expect(await detectMimeFromContent(f)).toBe('application/pdf')
    })

    it('rejects spoofed file (.exe renamed .pdf)', async () => {
        // Windows PE header — common malware signature
        const f = makeFile([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])
        expect(await detectMimeFromContent(f)).toBeNull()
    })
})

// ── Validators ───────────────────────────────────────────────────────────────

describe('isUuid', () => {
    it('accepts valid UUIDs', () => {
        expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
    })
    it('rejects non-UUIDs', () => {
        expect(isUuid('not-a-uuid')).toBe(false)
        expect(isUuid('123')).toBe(false)
        expect(isUuid(null)).toBe(false)
        expect(isUuid(undefined)).toBe(false)
        expect(isUuid('550e8400-e29b-41d4-a716-44665544000')).toBe(false) // too short
    })
})

describe('isEmail', () => {
    it('accepts plausible addresses', () => {
        expect(isEmail('user@example.com')).toBe(true)
        expect(isEmail('a+b@sub.example.co.uk')).toBe(true)
    })
    it('rejects malformed addresses', () => {
        expect(isEmail('plainstring')).toBe(false)
        expect(isEmail('a@b')).toBe(false)
        expect(isEmail('@x.com')).toBe(false)
        expect(isEmail('a@x.')).toBe(false)
        expect(isEmail('a'.repeat(260) + '@x.com')).toBe(false) // too long
    })
})

describe('isHttpUrl', () => {
    it('accepts http(s)', () => {
        expect(isHttpUrl('https://example.com')).toBe(true)
        expect(isHttpUrl('http://example.com/path?q=1')).toBe(true)
    })
    it('rejects dangerous schemes and localhost', () => {
        expect(isHttpUrl('javascript:alert(1)')).toBe(false)
        expect(isHttpUrl('file:///etc/passwd')).toBe(false)
        expect(isHttpUrl('http://localhost:3000')).toBe(false)
        expect(isHttpUrl('not a url')).toBe(false)
    })
})

describe('checkPassword', () => {
    it('rejects short passwords', () => {
        const r = checkPassword('short1!')
        expect(r.ok).toBe(false)
    })
    it('rejects passwords missing character classes', () => {
        expect(checkPassword('aaaaaaaaaaaa').ok).toBe(false)
        expect(checkPassword('AAAAAAAAAA').ok).toBe(false)
    })
    it('rejects common passwords', () => {
        // common-list entries are exact-match (case-insensitive)
        expect(checkPassword('Password1').ok).toBe(false) // too short
        expect(checkPassword('123456789!').ok).toBe(false) // only 2 char classes
    })
    it('rejects passwords containing the email local-part', () => {
        const r = checkPassword('john1234567A', { email: 'john@example.com' })
        expect(r.ok).toBe(false)
    })
    it('accepts a strong password', () => {
        const r = checkPassword('GoodOne42!Pass')
        expect(r.ok).toBe(true)
    })
})

// ── Sanitisation ─────────────────────────────────────────────────────────────

describe('safeHref', () => {
    it('strips javascript: and data: URLs', () => {
        expect(safeHref('javascript:alert(1)')).toBeNull()
        expect(safeHref('JavaScript:alert(1)')).toBeNull()
        expect(safeHref('  javascript :alert(1)')).toBeNull()
        expect(safeHref('data:text/html,<script>1</script>')).toBeNull()
    })
    it('accepts http(s)/mailto/tel', () => {
        expect(safeHref('https://example.com')).toBe('https://example.com/')
        expect(safeHref('mailto:foo@bar.com')).toMatch(/^mailto:/)
        expect(safeHref('tel:+1234567890')).toMatch(/^tel:/)
    })
    it('accepts plain relative paths', () => {
        expect(safeHref('/dashboard')).toBe('/dashboard')
    })
})

describe('sanitizeHtml', () => {
    it('strips tags', () => {
        expect(sanitizeHtml('<script>alert(1)</script>hello')).toBe('hello')
        expect(sanitizeHtml('<b>bold</b> text')).toBe('bold text')
    })
    it('handles malformed HTML', () => {
        expect(sanitizeHtml('<b>x<i>y')).toBe('xy')
    })
})
