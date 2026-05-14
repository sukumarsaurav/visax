// Shared date/time formatting utilities

/**
 * Format a date string to "Mar 15, 2026" style
 */
export function formatDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Format a date string to time like "2:30 PM"
 */
export function formatTime(d) {
    if (!d) return '—'
    return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/**
 * Format a date string to "Mar 15, 2026 at 2:30 PM"
 */
export function formatDateTime(d) {
    if (!d) return '—'
    return `${formatDate(d)} at ${formatTime(d)}`
}

/**
 * Relative time string e.g. "5m ago", "3h ago", "2d ago"
 */
export function timeAgo(dateStr) {
    if (!dateStr) return ''
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

/**
 * Short date: "Mar 15"
 */
export function formatShortDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
