// Utility for conditional class names — supports strings, objects, and arrays
export function clsx(...args) {
    const classes = []
    for (const arg of args) {
        if (!arg) continue
        if (typeof arg === 'string') {
            classes.push(arg)
        } else if (Array.isArray(arg)) {
            const inner = clsx(...arg)
            if (inner) classes.push(inner)
        } else if (typeof arg === 'object') {
            for (const [key, value] of Object.entries(arg)) {
                if (value) classes.push(key)
            }
        }
    }
    return classes.join(' ').trim()
}
