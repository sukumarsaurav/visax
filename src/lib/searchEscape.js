// ============================================================
// PostgREST search-input sanitizers.
//
// PostgREST does not allow SQL injection (values are always
// parameterized server-side), but the filter *grammar* uses
// commas, parens, and dots as separators. Unescaped user input
// inside `.or(...)` or `.ilike(...)` can:
//   - Break out of the intended filter and target other columns
//   - Cause the query to 400 with a parse error
//   - Be interpreted as additional filter conditions
//
// Always run user-typed search text through these helpers before
// interpolating into `or()` / `ilike()` / `like()` patterns.
// ============================================================

/**
 * Escape LIKE/ILIKE wildcard characters so user input matches
 * literally. % and _ are LIKE wildcards; \ is the escape char.
 */
export function escapeLikePattern(input) {
    if (input == null) return ''
    return String(input)
        .replace(/\\/g, '\\\\')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
}

/**
 * Strip characters that would break out of a PostgREST `or()`
 * filter expression. We do NOT try to escape them — there is no
 * standard escape syntax for PostgREST's filter grammar, so the
 * safest move is to drop them.
 *
 * Characters stripped: , ( ) — used by `or()` as separators.
 */
export function stripOrFilterChars(input) {
    if (input == null) return ''
    return String(input).replace(/[(),]/g, ' ')
}

/**
 * One-shot sanitizer for user search text destined for an
 * `.or()` filter containing `.ilike` patterns.
 *
 *   query.or(`full_name.ilike.%${sanitizeSearch(input)}%,...`)
 */
export function sanitizeSearch(input) {
    return escapeLikePattern(stripOrFilterChars(input))
}
