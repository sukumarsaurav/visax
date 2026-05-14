// Maps Postgres/PostgREST error codes to user-safe messages.
// Raw error.message from Supabase must never reach the UI — it exposes
// constraint names, column names, and internal DB structure.
const CODE_MAP = {
    '23505': 'An account with this email already exists.',
    '23503': 'This action references data that no longer exists.',
    '23514': 'The value you entered is not allowed.',
    '42501': "You don't have permission to perform this action.",
    '42P01': 'An internal error occurred. Please try again.',
    'PGRST116': 'Record not found.',
    'PGRST301': 'Your session has expired. Please sign in again.',
    'invalid_credentials': 'Invalid email or password.',
    'email_not_confirmed': 'Please confirm your email address before signing in.',
    'user_already_exists': 'An account with this email already exists.',
    'weak_password': 'Password is too weak. Use at least 8 characters.',
    'over_request_rate_limit': 'Too many attempts. Please wait a moment and try again.',
}

/**
 * Returns a safe, user-facing error string.
 * @param {object|null} error  Supabase error object
 * @param {string} fallback    Shown when no specific mapping exists
 */
export function friendlyError(error, fallback = 'Something went wrong. Please try again.') {
    if (!error) return fallback
    return (
        CODE_MAP[error.code] ||
        CODE_MAP[error.message] ||
        CODE_MAP[error.error_code] ||
        fallback
    )
}
