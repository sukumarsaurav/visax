import { describe, it, expect } from 'vitest'
import { escField } from '../lib/csvEscape'

describe('escField — CSV injection prevention', () => {
    it('passes through plain strings unchanged', () => {
        expect(escField('hello')).toBe('hello')
        expect(escField('John Smith')).toBe('John Smith')
        expect(escField('123')).toBe('123')
    })

    it('prefixes formula-injection characters with a single quote', () => {
        expect(escField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)")
        expect(escField('+1234567890')).toBe("'+1234567890")
        expect(escField('-1')).toBe("'-1")
        expect(escField('@SUM')).toBe("'@SUM")
    })

    it('wraps fields containing commas in double-quotes', () => {
        expect(escField('Smith, John')).toBe('"Smith, John"')
    })

    it('wraps fields containing double-quotes and escapes them', () => {
        expect(escField('say "hello"')).toBe('"say ""hello"""')
    })

    it('wraps fields containing newlines in double-quotes', () => {
        expect(escField('line1\nline2')).toBe('"line1\nline2"')
    })

    it('handles null and undefined by converting to empty string', () => {
        expect(escField(null)).toBe('')
        expect(escField(undefined)).toBe('')
    })

    it('coerces numbers to strings', () => {
        expect(escField(42)).toBe('42')
        expect(escField(3.14)).toBe('3.14')
    })

    it('still prefixes + quotes when value starts with = AND contains a comma', () => {
        // =cmd,arg — after prefix becomes '=cmd,arg which contains comma → should be quoted
        expect(escField('=cmd,arg')).toBe("\"'=cmd,arg\"")
    })
})
