/**
 * Sanitize a value for safe inclusion in a CSV cell.
 * Neutralises CSV formula injection by prefixing cells that start with =, +, -, @, tab, or CR
 * with a single quote. Wraps cells containing commas, double-quotes, or newlines in quotes,
 * and escapes internal double-quotes by doubling them.
 */
export function escField(val) {
    const s = String(val ?? '')
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}
